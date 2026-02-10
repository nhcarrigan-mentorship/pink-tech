import ImageWithFallback from "../../ui/ImageWithFallback";
import type { UserProfile } from "../../../types/UserProfile";
import {
  Award,
  Building2,
  Edit,
  MapPin,
  Linkedin,
  Twitter,
  Globe,
} from "lucide-react";
import React, { useState } from "react";
import toSnakeCaseObject from "../../../utils/snakeCase";
import supabase from "../../../config/supabaseClient";
import camelcaseKeys from "camelcase-keys";

interface ProfileInfoboxProps {
  isOwner: boolean;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | undefined>>;
}

export default function ProfileInfobox({
  profile,
  isOwner,
  setProfile,
}: ProfileInfoboxProps) {
  const [editedProfile, setEditedProfile] =
    useState<Partial<UserProfile>>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  function startEditing() {
    setIsEditing(true);
    setSaveError(false);
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
    setIsSaving(true);

    const changedFields = getChangedFields(profile, editedProfile);

    try {
      const { error, data } = await supabase
        .from("profiles")
        .update(toSnakeCaseObject(changedFields))
        .eq("id", profile.id)
        .select();
      if (error) {
        setSaveError(true);
      } else {
        console.log(data);
        setProfile(camelcaseKeys(data[0]));
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  }

  function onCancel() {
    setIsEditing(false);
    setSaveError(false);
  }

  const socialClassName = "w-5 h-5 text-pink-600";

  const socials = [
    {
      key: "linkedin",
      label: "Linkedin",
      icon: <Linkedin className={socialClassName} />,
    },
    {
      key: "twitter",
      label: "Twitter",
      icon: <Twitter className={socialClassName} />,
    },
    {
      key: "website",
      label: "website",
      icon: <Globe className={socialClassName} />,
    },
  ];

  const availableSocials = socials.filter(
    ({ key }) => profile && profile[key as keyof UserProfile],
  );

  return isOwner && isEditing ? (
    <aside className="md:w-72 lg:w-80 flex-shrink-0">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded">
        {/* Profile Image */}

        <div className="aspect-square overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={editedProfile.image ? editedProfile.image : ""}
            alt={editedProfile?.displayName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Infobox Content */}

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

              {saveError === true && (
                <div className="text-red-600 font-semibold mt-2">
                  Error saving your changes. Please try again later.
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </aside>
  ) : (
    <aside className="md:w-72 lg:w-80 flex-shrink-0">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded">
        {/* Profile Image */}
        <div className="aspect-square overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={profile.image ?? undefined}
            alt={profile.displayName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Infobox Content */}
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
      </div>
    </aside>
  );
}
