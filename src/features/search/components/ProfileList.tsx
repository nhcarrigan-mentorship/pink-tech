import type { UserProfile } from "../../../shared/types/UserProfile";
import ProfileCard from "./ProfileSearchCard";

interface ProfileListProps {
  filteredProfiles: UserProfile[];
}

export default function ProfileList({ filteredProfiles }: ProfileListProps) {
  return (
    <div className="space-y-4">
      {filteredProfiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}
