import { useEffect, useState } from "react";
import toSnakeCaseObject from "../../../utils/snakeCase";
import camelcaseKeys from "camelcase-keys";
import type { UserProfile } from "../../../types/UserProfile";
import { useProfilesContext } from "../../../contexts/ProfilesContext";
import ProfileImageEditor from "./ProfileImageEditor";
import { socials } from "./ProfileSocials";
import { getSupabase } from "../../../config/supabaseClient";
import { uploadAvatar, getAvatarPublicUrl } from "../../../utils/avatarStorage";
import { Award, Building2, Mail, MapPin, X } from "lucide-react";
import LazyIcon from "../../ui/LazyIcon";

interface ProfileInfoboxFormProps {
  profile: UserProfile;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProfileInfoboxForm({
  profile,
  isEditing,
  setIsEditing,
}: ProfileInfoboxFormProps) {
  const [editedProfile, setEditedProfile] =
    useState<Partial<UserProfile>>(profile);
  const [nameError, setNameError] = useState<string | null>(null);
  const [newProfileFile, setNewProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const { updateProfileInContext } = useProfilesContext();

  const NAME_MIN = 2;
  const NAME_MAX = 50;
  const NAME_ALLOWED_REGEX = /^[A-Za-z\s'\-]+$/;

  function validateName(name: string): string | null {
    const trimmed = name.trim();
    // Return error messages
    if (trimmed.length < NAME_MIN)
      return `Name must at least ${NAME_MIN} characters.`;
    if (trimmed.length > NAME_MAX)
      return `Name must not be more than ${NAME_MAX} characters.`;
    if (!NAME_ALLOWED_REGEX.test(trimmed))
      return `Name can only contain letters, spaces, apostrophes, and hyphens.`;
    return null;
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

    if (name === "displayName") {
      const invalidName = validateName(value);
      console.log(invalidName);
      if (invalidName) {
        setNameError(invalidName);
      } else {
        setNameError(null);
      }
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

      const editedVal = edited[key];
      const originalVal = original[key];

      // If the value is `undefined`, treat it as "no change"

      if (editedVal === undefined) continue;
      if (editedVal != originalVal) {
        changed[key] = editedVal;
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

      console.log("updating profiles with", toSnakeCaseObject(changedFields));
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("profiles")
        .update(toSnakeCaseObject(changedFields))
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      const updated = camelcaseKeys(data, {
        deep: true,
      }) as unknown as UserProfile;

      // keep global profiles list in sync
      updateProfileInContext(updated);

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
      <form onSubmit={(e) => onSave(e)} className="space-y-3">
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
            className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-pink-500 transition-colors"
          ></input>
          {nameError && (
            <p className="text-red-600 font-semibold mt-2" role="alert">
              {nameError}
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
              className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-pink-500 transition-colors"
            ></textarea>
            <button
              className="flex text-xs text-gray-600 font-medium self-end cursor-pointer hover:text-gray-700"
              type="button"
              onClick={() => clearField("bio")}
            >
              Remove Bio
            </button>
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
                  className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-pink-500 transition-colors"
                ></input>
                <button
                  className="flex items-center text-gray-400 cursor-pointer hover:text-gray-700"
                  type="button"
                  onClick={() => clearField("role")}
                >
                  <span className="hidden">Remove Role</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
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
                  className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-pink-500 transition-colors"
                ></input>
                <button
                  className="flex items-center text-gray-400 cursor-pointer hover:text-gray-700"
                  type="button"
                  onClick={() => clearField("company")}
                >
                  <span className="hidden">Remove Company</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
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
                  className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-pink-500 transition-colors"
                ></input>
                <button
                  className="flex items-center text-gray-400 cursor-pointer hover:text-gray-700"
                  type="button"
                  onClick={() => clearField("location")}
                >
                  <span className="hidden">Remove Location</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
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
                  className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-pink-500 transition-colors"
                ></input>
                <button
                  className="flex items-center text-gray-400 cursor-pointer hover:text-gray-700"
                  type="button"
                  onClick={() => clearField("email")}
                >
                  <span className="hidden">Remove Email</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </fieldset>
        </div>
        <div className="pb-3 border-b border-pink-200">
          {/* Profile Links */}

          <fieldset className="space-y-1">
            <legend className="text-pink-600 font-bold">Links</legend>
            {/* Profile Link */}
            {socials.map(({ key, placeholder, name }) => (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="role">
                    <span className="hidden">{key}</span>
                    <LazyIcon name={name} className="w-3.5 h-3.5 text-pink-600" />
                  </label>
                  <input
                    type="text"
                    name={key}
                    id={key}
                    value={(editedProfile as any)[key] ?? ""}
                    placeholder={placeholder}
                    onChange={onInputChange}
                    className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-pink-500 transition-colors"
                  ></input>
                  <button
                    className="flex items-center text-gray-400 cursor-pointer hover:text-gray-700"
                    type="button"
                    onClick={() => clearField(key)}
                  >
                    <span className="hidden">Remove Link</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </fieldset>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 mt-4">
          <button
            disabled={isSaving || isUploadingImage || nameError != null}
            className="flex-1 min-h-[44px] py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 min-h-[44px] py-3 bg-white border border-gray-300 text-gray-900 font-bold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
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
