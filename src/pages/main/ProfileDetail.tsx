import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import BackNavigation from "../../components/navigation/BackNavigation";
import ProfileAuthorshipNotice from "../../components/profile/detail/ProfileAuthorshipNotice";
import ProfileCard from "../../components/profile/detail/ProfileCard";
import ProfileNotFound from "../../features/search/results/ProfileNotFound";
import { useProfilesContext } from "../../contexts/ProfilesContext";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";

export default function ProfileDetail() {
  const { username } = useParams();
  const { profiles, loading, error, refetch, fetchFullProfile } =
    useProfilesContext();
  const profile = profiles.find((p) => p.username === username);
  const [showBottomNotice, setShowBottomNotice] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const isOwner = isAuthenticated && user?.id === profile?.id;

  useEffect(() => {
    if (noticeDismissed) return;
    const handleScroll = () => {
      setShowBottomNotice(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [noticeDismissed]);

  // Lazy-load full profile (including `content`) via context-level guarded fetch
  useEffect(() => {
    if (!username) return;
    if (!profile || !profile.content) {
      fetchFullProfile(username);
    }
  }, [username, profile, fetchFullProfile]);

  let content;

  if (error) {
    content = (
      <ErrorState
        heading="Unable to Load Profile"
        message="An error occurred while loading profile. Please try again later."
        onRetry={refetch}
      />
    );
  } else if (loading) {
    content = <LoadingState message="Loading profile..." />;
  } else if (!profile) {
    content = (
      <div className="flex flex-1 justify-center items-center p-10">
        <ProfileNotFound />
      </div>
    );
  } else {
    return (
      <div className="flex-1 py-2">
        <BackNavigation />
        <ProfileAuthorshipNotice isOwner={isOwner} position="top" />
        <ProfileCard profile={profile} isOwner={isOwner} />
        {/* Notice Banner - Bottom (abstracted) */}
        {!isOwner && showBottomNotice && !noticeDismissed && (
          <ProfileAuthorshipNotice
            isOwner={isOwner}
            position="bottom"
            show={true}
            onClose={() => {
              setNoticeDismissed(true);
              setShowBottomNotice(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <BackNavigation />
      <div className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{content}</div>
      </div>
    </>
  );
}
