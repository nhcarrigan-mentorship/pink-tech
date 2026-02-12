import ImageWithFallback from "../../ui/ImageWithFallback";
import type { UserProfile } from "../../../types/UserProfile";
import LazyIcon from "../../ui/LazyIcon";
import React, { useEffect, useState } from "react";
import { useProfilesContext } from "../../../contexts/ProfilesContext";
import toSnakeCaseObject from "../../../utils/snakeCase";
import { getSupabase } from "../../../config/supabaseClient";
import camelcaseKeys from "camelcase-keys";
import { Camera, Edit, Award, Building2, MapPin } from "lucide-react";

interface ProfileInfoboxProps {
  isOwner: boolean;
  profile: UserProfile;
}

export default function ProfileInfobox({
  profile,
  isOwner,
}: ProfileInfoboxProps) {
  const [newProfileFile, setNewProfileFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<Error | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { updateProfileInContext } = useProfilesContext();
  const [editedProfile, setEditedProfile] =
    useState<Partial<UserProfile>>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewProfileFile(file);
  }

  async function saveProfileImage(file: File) {
    setIsUploading(true);

    try {
      const supabase = await getSupabase();
      const filePath = `profiles/${profile.id}/${Date.now()}-${newProfileFile?.name}`;

      const { data: sessionData } = await supabase.auth.getSession();
      console.log("session", sessionData); // null means not authenticated

      // upload file
      const uploadRes = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: false });
      console.log("uploadRes:", uploadRes);
      if (uploadRes.error) throw uploadRes.error;

      // get public URL
      const { data: publicURLData, error: urlError } = await supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      if (urlError) {
        console.log(urlError);
        throw urlError;
      }

      const publicUrl =
        (publicURLData as any)?.publicUrl ?? (publicURLData as any) ?? null;
      return publicUrl;
    } catch (err) {
      setImageError(err as Error);
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  // Update preview url
  useEffect(() => {
    let url: string | null = null;

    if (newProfileFile) {
      url = URL.createObjectURL(newProfileFile);
      setPreviewUrl(url);
    } else if (editedProfile.image && typeof editedProfile.image === "string") {
      setPreviewUrl(editedProfile.image);
    } else {
      setPreviewUrl(null);
    }
  }, [newProfileFile, editedProfile.image]);

  function startEditing() {
    setIsEditing(true);
    setEditedProfile(profile);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaveError(null); // clear stale errors
    setIsSaving(true);

    const changedFields = getChangedFields(profile, editedProfile);

    let success = false;

    try {
      // upload file first (only if selected)
      if (newProfileFile) {
        const publicUrl = await saveProfileImage(newProfileFile);
        if (publicUrl) changedFields.image = publicUrl;
      }

      const supabase = await getSupabase();
      const { error, data } = await supabase
        .from("profiles")
        .update(toSnakeCaseObject(changedFields))
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      // Convert snake_case -> camelCase and update the local profile.
      const updated = camelcaseKeys(data, {
        deep: true,
      }) as unknown as UserProfile;

      // keep global profiles list in sync
      updateProfileInContext(updated);

      // update local profile state
      setEditedProfile(updated);

      // clear selection/preview
      setNewProfileFile(null);

      success = true;
    } catch (err) {
      setSaveError(err as Error);
    } finally {
      setIsSaving(false);
      if (success) setIsEditing(false);
    }
  }

  function onCancel() {
    setIsEditing(false);
  }

  const socialClassName = "w-5 h-5 text-pink-600";

  const socials = [
    {
      key: "linkedin",
      label: "Linkedin",
      icon: <LazyIcon name="Linkedin" className={socialClassName} />,
    },
    {
      key: "twitter",
      label: "Twitter",
      icon: <LazyIcon name="Twitter" className={socialClassName} />,
    },
    {
      key: "website",
      label: "website",
      icon: <LazyIcon name="Globe" className={socialClassName} />,
    },
  ];

  const availableSocials = socials.filter(
    ({ key }) => profile && profile[key as keyof UserProfile],
  );

  return (
    <aside className="md:w-72 lg:w-80 flex-shrink-0">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded">
        {/* Profile Image */}
        <div className="relative group aspect-square overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={isEditing ? (previewUrl ?? "") : (editedProfile.image ?? "")}
            alt={editedProfile?.displayName}
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <label className="absolute inset-0 flex justify-center items-center bg-pink-600 background-opacity-90 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
              <div className="flex flex-col items-center text-white">
                <Camera className="w-20 h-20" />
                <div className="font-bold">Upload Photo</div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPhotoChange}
              ></input>
            </label>
          )}
        </div>

        {isOwner && isEditing ? (
          <div className="p-4 space-y-3 text-sm">
            <div className="pb-3 border-b border-pink-200">
              {/* Profile Name */}

              <h3 className="mb-2 text-base font-bold text-gray-900">
                Edit Profile
              </h3>

              <p>Update your profile information</p>
            </div>

            <form onSubmit={(e) => onSave(e)}>
              <div className="space-y-3">
                {/* Profile Name */}

                <label
                  htmlFor="displayName"
                  className="text-pink-600 font-bold"
                >
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

                {/* Action Buttons */}

                <div className="flex gap-3 pt-4 mt-4 border-t border-pink-200">
                  <button
                    disabled={isSaving}
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
              </div>
            </form>
          </div>
        ) : (
          <div className="p-4 space-y-3 text-sm">
            <div className="pb-3 border-b border-pink-200">
              {/* Profile Name */}
              <h3 className="mb-2 text-base font-bold text-gray-900">
                {profile.displayName}
              </h3>
              <p>{profile.bio}</p>
              {isOwner && (
                <button
                  className="inline-flex items-center gap-2 mt-2 text-pink-600 text-sm font-bold hover:text-pink-700 hover:cursor-pointer transition-colors"
                  onClick={startEditing}
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Profile Role */}
              {profile.role && (
                <div>
                  <div className="text-pink-700 font-semibold">Role</div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-pink-700" />
                    <div className="text-gray-900">{profile.role}</div>
                  </div>
                </div>
              )}
              {/* Profile Company */}
              {profile.company && (
                <>
                  <div className="text-pink-700 font-semibold">
                    Company/Organization
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-pink-700" />
                    <div className="text-gray-900">{profile.company}</div>
                  </div>
                </>
              )}
              {/* Profile Location */}
              {profile.location && (
                <div>
                  <div className="text-pink-700 font-semibold">Location</div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-700" />
                    <div className="text-gray-900">{profile.location}</div>
                  </div>
                </div>
              )}
              {/* Profile Links */}
              {availableSocials.length > 0 && (
                <div>
                  <div className="mb-2 text-pink-700 font-semibold">Links</div>
                  <div className="flex items-center gap-3">
                    {availableSocials.map(({ key, label, icon }) => {
                      return (
                        <a
                          href={profile![key as keyof UserProfile] as string}
                          key={key}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-[44px] min-h-[44px] bg-white border border-pink-200 hover:bg-pink-100 rounded flex items-center justify-center transition-colors"
                        >
                          {icon}
                          <span className="sr-only">{label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Profile Expertise */}
              {profile.expertise && (
                <div>
                  <div className="mb-2 text-pink-700 font-semibold">
                    Expertise
                  </div>
                  <div className="flex items-center flex-wrap gap-1">
                    {profile.expertise?.map((expertise) => (
                      <span className="px-2 py-0.5 border border-pink-200 bg-white text-pink-700 text-xs rounded hover:bg-pink-100 transition-colors">
                        {expertise}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
