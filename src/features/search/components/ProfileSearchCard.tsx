import { Link } from "react-router-dom";
import type { UserProfile } from "../../../shared/types/UserProfile";
import ImageWithFallback from "../../../shared/ui/display/ImageWithFallback";
import LazyIcon from "../../../shared/ui/display/LazyIcon";

interface ProfileSearchCardProps {
  profile: UserProfile;
}

export default function ProfileSearchCard({ profile }: ProfileSearchCardProps) {
  return (
    <Link
      to={`/${profile.username}`}
      className="block bg-white border border-pink-200 rounded hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 transition-colors cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Profile Image - Thumbnail */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 sm:w-24 sm:h-24 overflow-hidden rounded border border-pink-200 bg-gray-100">
            <ImageWithFallback
              src={profile.image ? profile.image : ""}
              alt={profile.displayName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 min-w-0">
          {/* Profile Name */}
          <h3 className="text-xl mb-1 text-gray-900 font-bold">
            {profile.displayName}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            {/* Profile Role */}
            {profile?.role && (
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                <LazyIcon
                  name="Award"
                  className="w-3.5 h-3.5 text-pink-600 flex-shrink-0"
                />
                <span>{profile.role}</span>
              </span>
            )}
            {/* Profile Company */}
            {profile?.company && (
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                <LazyIcon
                  name="Building2"
                  className="w-3.5 h-3.5 text-pink-600 flex-shrink-0"
                />
                <span>{profile.company}</span>
              </span>
            )}
            {profile?.location && (
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                <LazyIcon
                  name="MapPin"
                  className="w-3.5 h-3.5 text-pink-600 flex-shrink-0"
                />
                <span>{profile.location}</span>
              </span>
            )}
          </div>

          {/* Bio Preview */}
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {profile.bio}
          </p>

          {/* Expertise Tags */}
          {profile?.expertise && (
            <div className="flex flex-wrap gap-1.5">
              {profile.expertise.slice(0, 4).map((exp, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white border border-pink-200 text-pink-700 rounded text-xs"
                >
                  {exp}
                </span>
              ))}
              {profile.expertise.length > 4 && (
                <span className="px-2 py-0.5 bg-white border border-pink-200 text-gray-600 rounded text-xs">
                  +{profile.expertise.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
