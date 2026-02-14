import type { UserProfile } from "../../../types/UserProfile";
import LazyIcon from "../../ui/LazyIcon";
import { useState } from "react";
import { Edit, Award, Building2, MapPin } from "lucide-react";
import ProfileInfoboxForm from "./ProfileInfoboxForm";

interface ProfileInfoboxProps {
  isOwner: boolean;
  profile: UserProfile;
}

export default function ProfileInfobox({
  profile,
  isOwner,
}: ProfileInfoboxProps) {
  const [isEditing, setIsEditing] = useState(false);

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
        {isOwner && isEditing ? (
          /* Inline Form */
          <ProfileInfoboxForm
            profile={profile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
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
                  onClick={() => setIsEditing(true)}
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
