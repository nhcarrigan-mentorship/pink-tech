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
  const [bioError, setBioError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [linkedinError, setLinkedinError] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [websiteError, setWebsiteError] = useState<string | null>(null);
  const [newProfileFile, setNewProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const { updateProfileInContext } = useProfilesContext();

  function validateName(name: string): string | null {
    const NAME_MIN = 2;
    const NAME_MAX = 50;
    const NAME_ALLOWED_REGEX = /^[A-Za-z\s'\-]+$/;

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

  function validateBio(bio: string): string | null {
    const BIO_MAX = 160;
    if (bio.length < 1 || bio.length <= BIO_MAX) return null;
    return `Bio must not be more than ${BIO_MAX} characters.`;
  }

  function validateEmail(email: string): string | null {
    const trimmed = email.trim();

    if (trimmed.length < 1) return null;
    if (trimmed.length > 320) return "Email must be 320 characters or fewer.";
    if (/\s/.test(trimmed)) return "Email must not contain spaces.";

    const parts = trimmed.split("@");
    if (parts.length !== 2) return "Please enter a valid email address.";

    const [local, domain] = parts;

    // Local-part checks
    if (local.length < 1 || local.length > 64)
      return "Email local part must be 1–64 characters.";
    if (local.startsWith(".") || local.endsWith("."))
      return "Local part cannot start or end with a dot.";
    if (local.includes(".."))
      return "Local part cannot contain consecutive dots.";
    if (!/^[A-Za-z0-9._-]+$/.test(local))
      return "Local part contains invalid characters.";

    // Domain checks
    if (domain.length < 1 || domain.length > 255)
      return "Please enter a valid domain.";
    const labels = domain.split(".").filter(Boolean);
    if (labels.length < 2)
      return "Domain must include a top-level domain (e.g. .com).";
    for (const label of labels) {
      if (label.length < 1 || label.length > 63)
        return "Each domain label must be 1–63 characters.";
      if (!/^[A-Za-z0-9-]+$/.test(label))
        return "Domain contains invalid characters.";
      if (label.startsWith("-") || label.endsWith("-"))
        return "Domain labels cannot start or end with a hyphen.";
    }
    const tld = labels[labels.length - 1];
    if (!/^[A-Za-z]{2,}$/.test(tld))
      return "Top-level domain must be at least 2 letters.";

    return null;
  }

  function normalizeUrl(url: string) {
    if (!url) return url;
    const trimmed = url.trim();
    return trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  }

  function validateLinkedin(url: string): string | null {
    const trimmed = url.trim();
    if (!trimmed) return null;
    try {
      const parsed = new URL(
        trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
      );
      const host = parsed.hostname.toLowerCase();
      if (!host.includes("linkedin.com"))
        return "Please enter a LinkedIn profile URL.";
      const path = parsed.pathname || "";
      if (!path.startsWith("/in/") && !path.startsWith("/pub/"))
        return "LinkedIn profile URL should be a personal profile (e.g. /in/username).";
      return null;
    } catch (e) {
      return "Please enter a valid LinkedIn URL.";
    }
  }

  function validateGithub(url: string): string | null {
    const trimmed = url.trim();
    if (!trimmed) return null;
    try {
      const parsed = new URL(
        trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
      );
      const host = parsed.hostname.toLowerCase();
      if (!host.includes("github.com"))
        return "Please enter a GitHub profile URL.";
      const segments = parsed.pathname.split("/").filter(Boolean);
      if (segments.length < 1)
        return "Please enter a GitHub profile URL (e.g. github.com/username).";
      const username = segments[0];
      if (!/^[A-Za-z0-9-]+$/.test(username))
        return "Please enter a valid GitHub username in the URL.";
      return null;
    } catch (e) {
      return "Please enter a valid GitHub URL.";
    }
  }

  function validateWebsite(url: string): string | null {
    const trimmed = url.trim();
    if (!trimmed) return null;
    try {
      // allow users to omit protocol by prefixing https:// when parsing
      const parsed = new URL(
        trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
      );
      const host = parsed.hostname;
      if (!host || !host.includes("."))
        return "Please enter a valid website domain.";
      return null;
    } catch (e) {
      return "Please enter a valid website URL.";
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

    if (name === "displayName") {
      const invalidName = validateName(value);
      if (invalidName) {
        setNameError(invalidName);
      } else {
        setNameError(null);
      }
    }

    if (name === "bio") {
      const invalidBio = validateBio(value);
      if (invalidBio) setBioError(invalidBio);
      else {
        setBioError(null);
      }
    }

    if (name === "email") {
      const invalidEmail = validateEmail(value);
      if (invalidEmail) setEmailError(invalidEmail);
      else {
        setEmailError(null);
      }
    }

    if (name === "linkedin") {
      const invalid = validateLinkedin(value);
      if (invalid) setLinkedinError(invalid);
      else setLinkedinError(null);
    }

    if (name === "github") {
      const invalid = validateGithub(value);
      if (invalid) setGithubError(invalid);
      else setGithubError(null);
    }

    if (name === "website") {
      const invalid = validateWebsite(value);
      if (invalid) setWebsiteError(invalid);
      else setWebsiteError(null);
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

      socials.forEach((social) => {
        if ((changedFields as any)[social.key])
          (changedFields as any)[social.key] = normalizeUrl(
            (changedFields as any)[social.key],
          );
      });

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
            {bioError && (
              <p className="text-red-600 font-semibold" role="alert">
                {bioError}
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
              {emailError && (
                <p className="text-red-600 font-semibold" role="alert">
                  {emailError}
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
                  <label htmlFor="role">
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
                {key === "linkedin" && linkedinError && (
                  <p className="text-red-600 font-semibold" role="alert">
                    {linkedinError}
                  </p>
                )}
                {key === "github" && githubError && (
                  <p className="text-red-600 font-semibold" role="alert">
                    {githubError}
                  </p>
                )}
                {key === "website" && websiteError && (
                  <p className="text-red-600 font-semibold" role="alert">
                    {websiteError}
                  </p>
                )}
              </div>
            ))}
          </fieldset>
        </div>

        {/* Profile Expertise */}
        <div className="mt-3 pb-3">
          <label className="text-pink-600 font-bold">Expertise</label>
          {/* Profile Expertise */}
          {editedProfile.expertise && (
            <div className="flex items-center flex-wrap gap-1 mt-3">
              {editedProfile.expertise?.map((expertise) => (
                <span className="px-2 py-0.5 border border-pink-200 bg-white text-pink-700 text-xs rounded hover:bg-pink-100 transition-colors">
                  {expertise}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-pink-200">
          <button
            disabled={
              isSaving ||
              isUploadingImage ||
              nameError != null ||
              emailError != null ||
              bioError != null ||
              linkedinError != null ||
              githubError != null ||
              websiteError != null
            }
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
