import camelcaseKeys from "camelcase-keys";
import { Award, Building2, Mail, MapPin, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getSupabase } from "../../../../shared/config/supabaseClient";
import type { UserProfile } from "../../../../shared/types/UserProfile";
import LazyIcon from "../../../../shared/ui/display/LazyIcon";
import {
  getAvatarPublicUrl,
  uploadAvatar,
} from "../../../../shared/utils/avatarStorage";
import toSnakeCaseObject from "../../../../shared/utils/snakeCase";
import {
  validateBio,
  validateCompany,
  validateEmail,
  validateExpertise,
  validateGithub,
  validateLinkedin,
  validateLocation,
  validateName,
  validateRole,
  validateWebsite,
} from "../../../../shared/utils/validators";
import ProfileImageEditor from "./ProfileImageEditor";
import { socials } from "./ProfileSocials";

interface ProfileInfoboxFormProps {
  profile: UserProfile;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onProfileUpdated: (updated: UserProfile) => void;
}

type FormErrors = {
  displayName: string | null;
  bio: string | null;
  email: string | null;
  role: string | null;
  company: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  expertise: string | null;
};

const fieldValidators: Partial<
  Record<keyof FormErrors, (value: string) => string | null>
> = {
  bio: validateBio,
  company: validateCompany,
  displayName: validateName,
  email: validateEmail,
  github: validateGithub,
  linkedin: validateLinkedin,
  location: validateLocation,
  role: validateRole,
  website: validateWebsite,
};

export default function ProfileInfoboxForm({
  profile,
  isEditing,
  setIsEditing,
  onProfileUpdated,
}: ProfileInfoboxFormProps) {
  const [editedProfile, setEditedProfile] =
    useState<Partial<UserProfile>>(profile);
  const [expertiseInput, setExpertiseInput] = useState<string | null>(null);
  const [newProfileFile, setNewProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    displayName: null,
    bio: null,
    email: null,
    role: null,
    company: null,
    location: null,
    linkedin: null,
    github: null,
    website: null,
    expertise: null,
  });

  function normalizeUrl(url: string) {
    if (!url) return url;
    const trimmed = url.trim();
    return trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  }

  function removeExpertise(expertise: string) {
    setEditedProfile((prev) => {
      const prevExpertise = Array.isArray(prev.expertise)
        ? (prev!.expertise as string[])
        : [];

      return {
        ...prev,
        expertise: prevExpertise.filter(
          (currentExp) => currentExp != expertise,
        ),
      };
    });
  }

  function addExpertise() {
    setEditedProfile((prev) => {
      if (!expertiseInput) return prev;

      const list = Array.isArray(prev?.expertise)
        ? (prev.expertise as string[])
        : [];

      if (expertiseInput && list.includes(expertiseInput)) return prev;

      setExpertiseInput("");

      return { ...prev, expertise: [...list, expertiseInput] };
    });
  }

  function onExpertiseChange(expertise: string) {
    setExpertiseInput(expertise);

    const invalidExpertise = validateExpertise(expertise, profile.expertise);
    if (invalidExpertise) {
      setFormErrors((prev) => ({ ...prev, expertise: invalidExpertise }));
    } else {
      setFormErrors((prev) => ({ ...prev, expertise: null }));
    }
  }

  function clearField(field: string) {
    // Do not hide the field; only clear its value so the UI stays visible
    setEditedProfile((prev) => ({ ...prev, [field]: null }));
  }

  // Initialize when entering edit mode
  useEffect(() => {
    if (isEditing) {
      // Make all optional fields visible when entering edit mode

      setEditedProfile(profile);
      setSaveError(null);
    }
  }, [isEditing, profile]);

  // preview effect: create object URL for immediate preview and revoke it on cleanup
  useEffect(() => {
    if (newProfileFile) {
      const url = URL.createObjectURL(newProfileFile);
      setPreviewUrl(url);
      return () => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // ignore
        }
      };
    }

    let mounted = true;
    (async () => {
      if (editedProfile.image) {
        const pub = await getAvatarPublicUrl(editedProfile.image as string);
        if (mounted) setPreviewUrl(pub);
      } else {
        if (mounted) setPreviewUrl(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [newProfileFile, editedProfile.image]);

  function onCancel() {
    setIsEditing(false);
    setSaveError(null);
  }

  function onInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;

    // Get the validator that matches field input
    const validator = fieldValidators[name as keyof FormErrors];

    if (validator) {
      setFormErrors((prev) => ({ ...prev, [name]: validator(value) }));
    }

    setEditedProfile({
      ...editedProfile,

      [name]: value,
    });
  }

  function getChangedFields(
    original: Partial<UserProfile>,
    edited: Partial<UserProfile>,
  ) {
    const changed: Record<string, any> = {};

    for (const key of Object.keys(edited) as (keyof UserProfile)[]) {
      // Skip id field
      if (key === "id") continue;

      // only include fields that are present on `edited` and differ from the original
      if (!(key in edited)) continue;

      let editedVal = edited[key];
      const originalVal = original[key];

      // If the value is `undefined`, treat it as "no change"
      if (editedVal === undefined) continue;

      // Trim strings and save (null if empty)
      if (typeof editedVal === "string") {
        const trimmedVal = editedVal.trim();
        const valueToSave = trimmedVal === "" ? null : trimmedVal;

        if (valueToSave != originalVal) {
          changed[key] = valueToSave;
        }
      } else if (editedVal === null && originalVal !== null) {
        // Handle explicitly cleared fields (null values)
        changed[key] = null;
      }
    }

    return changed as Partial<UserProfile>;
  }

  // uploadAvatar moved to shared util (uploadAvatar)

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaveError(null); // clear stale errors
    setIsSaving(true);

    const changedFields = getChangedFields(profile, editedProfile);

    let success = false;

    try {
      if (newProfileFile) {
        try {
          setIsUploadingImage(true);
          const filePath = await uploadAvatar(newProfileFile, profile.id);
          if (filePath) {
            const pub = await getAvatarPublicUrl(filePath);
            (changedFields as any).image = pub;
            setPreviewUrl(pub);
          }
        } catch (err: unknown) {
          const normalizedError =
            err instanceof Error ? err : new Error(String(err));
          setSaveError(normalizedError);
          setIsSaving(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      // if nothing changed, skip the update
      if (Object.keys(changedFields).length === 0) {
        setIsSaving(false);
        setIsEditing(false);
        return;
      }

      socials.forEach((social) => {
        if ((changedFields as any)[social.key])
          (changedFields as any)[social.key] = normalizeUrl(
            (changedFields as any)[social.key],
          );
      });

      const updatedAt = new Date().toISOString();
      changedFields.lastUpdated = updatedAt;

      console.log("updating profiles with", toSnakeCaseObject(changedFields));
      const supabase = await getSupabase();

      // Update existing profile to avoid nullifying required fields
      const { error } = await supabase
        .from("profiles")
        .update(toSnakeCaseObject(changedFields))
        .eq("id", profile.id);

      if (error) throw error;

      // Optimistically merge local state so UI updates immediately after save.
      const updated = camelcaseKeys(
        {
          ...profile,
          ...changedFields,
        },
        { deep: true },
      ) as unknown as UserProfile;

      // keep global profiles list in sync
      onProfileUpdated(updated);

      // update local profile state
      setEditedProfile(updated);

      success = true;
    } catch (err) {
      const normalizedError =
        err instanceof Error ? err : new Error(String(err));
      setSaveError(normalizedError);
    } finally {
      setIsSaving(false);
      if (success) setIsEditing(false);
    }
  }

  return (
    <div className="p-4 space-y-3 text-sm">
      <div className="pb-3 border-b border-pink-200">
        {/* Profile Name */}
        <h3 className="mb-2 text-base font-bold text-gray-900">Edit Profile</h3>
        <p>Update your profile information</p>
      </div>
      <form
        onSubmit={(e) => onSave(e)}
        className="space-y-3"
        aria-busy={isSaving || isUploadingImage}
      >
        <div className="pb-3 border-b border-pink-200">
          <ProfileImageEditor
            editedProfile={editedProfile}
            setNewProfileFile={setNewProfileFile}
            previewUrl={previewUrl}
            isUploadingImage={isUploadingImage}
          />
          {/* Profile Name */}
          <label htmlFor="displayName" className="text-pink-600 font-bold">
            Name
          </label>
          <input
            type="text"
            name="displayName"
            id="displayName"
            value={editedProfile.displayName}
            onChange={onInputChange}
            className="w-full mt-1 px-3 py-2 bg-white border border-pink-200 rounded-lg focus:outline-pink-500 transition-colors"
          ></input>
          {formErrors.displayName && (
            <p className="text-red-600 font-semibold mt-2" role="alert">
              {formErrors.displayName}
            </p>
          )}
        </div>
        {/* Profile Bio */}
        <div className="pb-3 border-b border-pink-200">
          <label htmlFor="bio" className="text-pink-600 font-bold">
            Bio
          </label>
          <div className="flex flex-col gap-2">
            <textarea
              name="bio"
              id="bio"
              value={editedProfile.bio ?? ""}
              placeholder="e.g., Software engineer passionate about AI and mentoring. Building tools that empower communities."
              onChange={onInputChange}
              className="w-full mt-1 px-3 py-2 bg-white border border-pink-200 rounded-lg focus:outline-pink-500 transition-colors"
            ></textarea>
            <button
              type="button"
              disabled={isSaving || isUploadingImage}
              onClick={() => clearField("bio")}
              className="flex text-xs text-gray-600 font-medium self-end hover:text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove Bio
            </button>
            {formErrors.bio && (
              <p className="text-red-600 font-semibold" role="alert">
                {formErrors.bio}
              </p>
            )}
          </div>
        </div>
        {/* Profile Information */}
        <div className="pb-3 border-b border-pink-200">
          <fieldset className="space-y-1">
            <legend className="text-pink-600 font-bold">Information</legend>

            {/* Profile Role */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="role">
                  <span className="hidden">Role</span>
                  <Award className="w-3.5 h-3.5 text-pink-600" />
                </label>
                <input
                  type="text"
                  name="role"
                  id="role"
                  value={editedProfile.role ?? ""}
                  placeholder="Software Engineer"
                  onChange={onInputChange}
                  className="w-full mt-1 px-3 py-2 bg-white border border-pink-200 rounded-lg focus:outline-pink-500 transition-colors"
                ></input>
                <button
                  type="button"
                  disabled={isSaving || isUploadingImage}
                  onClick={() => clearField("role")}
                  className="flex items-center text-gray-400 hover:text-gray-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span className="hidden">Remove Role</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
              {formErrors.role && (
                <p className="text-red-600 font-semibold" role="alert">
                  {formErrors.role}
                </p>
              )}
            </div>

            {/* Profile Company */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="company">
                  <span className="hidden">Company</span>
                  <Building2 className="w-3.5 h-3.5 text-pink-600" />
                </label>
                <input
                  type="text"
                  name="company"
                  id="company"
                  value={editedProfile.company ?? ""}
                  placeholder="Tech Company"
                  onChange={onInputChange}
                  className="w-full mt-1 px-3 py-2 bg-white border border-pink-200 rounded-lg focus:outline-pink-500 transition-colors"
                ></input>
                <button
                  type="button"
                  disabled={isSaving || isUploadingImage}
                  onClick={() => clearField("company")}
                  className="flex items-center text-gray-400 hover:text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden">Remove Company</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
              {formErrors.company && (
                <p className="text-red-600 font-semibold" role="alert">
                  {formErrors.company}
                </p>
              )}
            </div>

            {/* Profile Location */}

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="location">
                  <span className="hidden">Location</span>
                  <MapPin className="w-3.5 h-3.5 text-pink-600" />
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={editedProfile.location ?? ""}
                  placeholder="San Francisco, CA"
                  onChange={onInputChange}
                  className="w-full mt-1 px-3 py-2 bg-white border border-pink-200 rounded-lg focus:outline-pink-500 transition-colors"
                ></input>
                <button
                  type="button"
                  disabled={isSaving || isUploadingImage}
                  onClick={() => clearField("location")}
                  className="flex items-center text-gray-400 hover:text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden">Remove Location</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
              {formErrors.location && (
                <p className="text-red-600 font-semibold" role="alert">
                  {formErrors.location}
                </p>
              )}
            </div>

            {/* Profile Email */}

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="email">
                  <span className="hidden">Email</span>
                  <Mail className="w-3.5 h-3.5 text-pink-600" />
                </label>
                <input
                  type="text"
                  name="email"
                  id="email"
                  value={editedProfile.email ?? ""}
                  placeholder="janedoe@email.com"
                  onChange={onInputChange}
                  className="w-full mt-1 px-3 py-2 bg-white border border-pink-200 rounded-lg focus:outline-pink-500 transition-colors"
                ></input>
                <button
                  type="button"
                  disabled={isSaving || isUploadingImage}
                  onClick={() => clearField("email")}
                  className="flex items-center text-gray-400 hover:text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden">Remove Email</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
              {formErrors.email && (
                <p className="text-red-600 font-semibold" role="alert">
                  {formErrors.email}
                </p>
              )}
            </div>
          </fieldset>
        </div>
        {/* Profile Links */}
        <div className="pb-3 border-b border-pink-200">
          <fieldset className="space-y-1">
            <legend className="text-pink-600 font-bold">Links</legend>
            {/* Profile Link */}
            {socials.map(({ key, placeholder, name }) => (
              <div key={key} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label htmlFor={key}>
                    <span className="hidden">{key}</span>
                    <LazyIcon
                      name={name}
                      className="w-3.5 h-3.5 text-pink-600"
                    />
                  </label>
                  <input
                    type="text"
                    name={key}
                    id={key}
                    value={(editedProfile as any)[key] ?? ""}
                    placeholder={placeholder}
                    onChange={onInputChange}
                    className="w-full mt-1 px-3 py-2 bg-white border border-pink-200 rounded-lg focus:outline-pink-500 transition-colors"
                  ></input>
                  <button
                    type="button"
                    disabled={isSaving || isUploadingImage}
                    onClick={() => clearField(key)}
                    className="flex items-center text-gray-400 hover:text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden">Remove Link</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {key === "linkedin" && formErrors.linkedin && (
                  <p className="text-red-600 font-semibold" role="alert">
                    {formErrors.linkedin}
                  </p>
                )}
                {key === "github" && formErrors.github && (
                  <p className="text-red-600 font-semibold" role="alert">
                    {formErrors.github}
                  </p>
                )}
                {key === "website" && formErrors.website && (
                  <p className="text-red-600 font-semibold" role="alert">
                    {formErrors.website}
                  </p>
                )}
              </div>
            ))}
          </fieldset>
        </div>
        {/* Profile Expertise */}
        <div className="mt-3 pb-3 space-y-2">
          <label className="text-pink-600 font-bold">Expertise</label>
          {editedProfile.expertise && (
            <div className="flex items-center flex-wrap gap-1 mt-3">
              {editedProfile.expertise?.map((expertise) => (
                // Current expertise
                <span
                  key={expertise}
                  className="inline-flex justify-center items-center gap-1 px-2 py-0.5 border border-pink-200 bg-white text-pink-700 text-xs rounded"
                >
                  {expertise}
                  <button
                    type="button"
                    disabled={isSaving || isUploadingImage}
                    onClick={() => removeExpertise(expertise)}
                    aria-label="Remove expertise"
                    className="hover:bg-pink-100 transition-colors rounded-full p-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="expertise"
              id="expertise"
              value={expertiseInput ?? ""}
              placeholder="New expertise (e.g., Data Science)"
              onChange={(e) => onExpertiseChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!formErrors.expertise) addExpertise();
                }
              }}
              className="flex-1 w-full mt-1 px-3 py-2 bg-white border border-pink-200 rounded-lg focus:outline-pink-500 transition-colors"
              aria-label="New expertise"
              autoFocus
            ></input>
            <button
              type="button"
              aria-label="Add expertise"
              disabled={
                isSaving || isUploadingImage || formErrors.expertise != null
              }
              onClick={() => addExpertise()}
              className="min-w-[36px] min-h-[36px] flex justify-center items-center bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {formErrors.expertise && (
            <p className="text-red-600 font-semibold" role="alert">
              {formErrors.expertise}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-pink-200">
          <button
            type="submit"
            disabled={
              isSaving ||
              isUploadingImage ||
              Object.values(formErrors).some(Boolean)
            }
            className="flex-1 min-h-[44px] py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving || isUploadingImage}
            className="flex-1 min-h-[44px] py-3 bg-white border border-pink-200 text-gray-900 font-bold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
        {saveError && (
          <p className="text-red-600 font-semibold mt-2">
            Error saving your changes. Please try again later.
          </p>
        )}
      </form>
    </div>
  );
}
