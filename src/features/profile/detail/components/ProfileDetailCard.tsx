import type { UserProfile } from "../../../../shared/types/UserProfile";
import ProfileContent from "./ProfileContent";
import ProfileInfobox from "./ProfileInfobox";

interface ProfileDetailCardProps {
  profile: UserProfile;
  isOwner: boolean;
}

export default function ProfileDetailCard({ profile, isOwner }: ProfileDetailCardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        <ProfileInfobox isOwner={isOwner} profile={profile} />
        <ProfileContent isOwner={isOwner} profile={profile} />
      </div>
    </div>
  );
}
