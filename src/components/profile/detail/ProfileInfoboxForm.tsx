import { useEffect, useState } from "react";
import toSnakeCaseObject from "../../../utils/snakeCase";
import camelcaseKeys from "camelcase-keys";
import type { UserProfile } from "../../../types/UserProfile";
import { useProfilesContext } from "../../../contexts/ProfilesContext";
import { getSupabase } from "../../../config/supabaseClient";
import ProfileImageEditor from "./ProfileImageEditor";

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
  const [newProfileFile, setNewProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const { updateProfileInContext } = useProfilesContext();

  useEffect(() => {
    if (isEditing) {
      setEditedProfile(profile);
      setSaveError(null);
    }
  }, []);

  // preview effect: create object URL for immediate preview and revoke it on cleanup
  useEffect(() => {
    if (!newProfileFile) {
      setPreviewUrl(editedProfile.image ?? null);
      return;
    }
    const url = URL.createObjectURL(newProfileFile);
    setPreviewUrl(url);

    return () => {
      // Revoke the object URL when the file or component changes to avoid memory leaks
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // ignore
      }
    };
  }, [newProfileFile, profile.image]);

  function onCancel() {
    setIsEditing(false);
    setSaveError(null);
  }

  function onInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;

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

    (Object.keys(edited) as (keyof UserProfile)[]).forEach((typedKey) => {
      if (typedKey === "id") return;
      if (edited[typedKey] !== original[typedKey]) {
        changed[typedKey] =
          edited[typedKey] === null ? undefined : edited[typedKey];
      }
    });
    return changed as Partial<UserProfile>;
  }

  async function uploadAvatar(file: File) {
    // Set file name
    const fileExt = file.name.split(".").pop() ?? "png";
    const filePath = `${profile.id}-${Date.now()}.${fileExt}`;
    const supabase = await getSupabase();

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Get public url
    const { data, error: urlError } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    if (urlError)
      throw new Error(`Failed to get public URL: ${urlError.message}`);
    return data.publicUrl;
  }

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
          const publicUrl = await uploadAvatar(newProfileFile);
          if (publicUrl) {
            (changedFields as any).image = publicUrl;
            setPreviewUrl(publicUrl);
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
        </div>
        <div className="pb-3 border-b border-pink-200">
          {/* Profile Bio */}
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
            <button className="flex flex-end text-xs text-gray-600 font-medium self-end cursor-pointer hover:text-gray-700">
              Remove Bio
            </button>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 mt-4">
          <button
            disabled={isSaving || isUploadingImage}
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
          <div className="text-red-600 font-semibold mt-2">
            Error saving your changes. Please try again later.
          </div>
        )}
      </form>
    </div>
  );
}
