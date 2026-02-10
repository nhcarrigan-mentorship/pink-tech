import ProfileContent from "./ProfileContent";
import ProfileInfobox from "./ProfileInfobox";
import type { UserProfile } from "../../../types/UserProfile";

interface ProfileCardProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | undefined>>;
  isOwner: boolean;
}

export default function ProfileCard({
  profile,
  isOwner,
  setProfile,
}: ProfileCardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        <ProfileInfobox
          isOwner={isOwner}
          profile={profile}
          setProfile={setProfile}
        />
        <ProfileContent isOwner={isOwner} profile={profile} />
      </div>
    </div>
  );
}
