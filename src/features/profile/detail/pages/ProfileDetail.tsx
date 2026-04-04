import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import BackNavigation from "../../../../shared/components/navigation/BackNavigation";
import ProfileNotFound from "../../../search/results/ProfileNotFound";
import { useProfilesContext } from "../../../../shared/hooks/useProfilesContext";
import ErrorState from "../../../../shared/ui/feedback/ErrorState";
import LoadingState from "../../../../shared/ui/feedback/LoadingState";
import ProfileAuthorshipNotice from "../components/ProfileAuthorshipNotice";
import ProfileCard from "../components/ProfileCard";

export default function ProfileDetail() {
  const { username } = useParams();
  const { profiles, loading, error, refetch, fetchFullProfile } =
    useProfilesContext();
  const profile = profiles.find(
    (p) => p.username.toLowerCase() === username?.toLowerCase(),
  );
  const [showBottomNotice, setShowBottomNotice] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  const { isAuthenticated, user, uiCachedUser } = useAuth();
  const displayUser = user ?? uiCachedUser;
  const isOwner = isAuthenticated && displayUser?.id === profile?.id;

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
      setIsFetchingProfile(true);
      fetchFullProfile(username).finally(() => setIsFetchingProfile(false));
    }
  }, [username, profile, fetchFullProfile]);

  // Preload the profile image to improve LCP when we have an image URL
  useEffect(() => {
    if (!profile?.image) return;
    const href = profile.image;
    const existing = document.querySelector(
      `link[rel=\"preload\"][data-profile-image]`,
    );
    if (existing) {
      existing.setAttribute("href", href);
      return;
    }

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    link.setAttribute("data-profile-image", "true");
    // attempt to hint high priority for browser
    link.setAttribute("importance", "high");
    document.head.appendChild(link);

    // Add a preconnect to Supabase origin to shorten DNS/TCP/TLS time
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        const origin = new URL(supabaseUrl).origin;
        const existingPre = document.querySelector(
          `link[rel=\"preconnect\"][href=\"${origin}\"]`,
        );
        if (!existingPre) {
          const pre = document.createElement("link");
          pre.rel = "preconnect";
          pre.href = origin;
          pre.crossOrigin = "anonymous";
          pre.setAttribute("data-preconnect-supabase", "true");
          document.head.appendChild(pre);
        }
      }
    } catch (e) {
      // ignore URL parse errors
    }

    return () => {
      try {
        link.remove();
      } catch (e) {
        /* ignore */
      }
    };
  }, [profile?.image]);

  let content;

  if (error) {
    content = (
      <ErrorState
        heading="Unable to Load Profile"
        message="An error occurred while loading profile. Please try again later."
        onRetry={refetch}
      />
    );
  } else if (loading || isFetchingProfile) {
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
      {profile && <BackNavigation />}
      <div className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{content}</div>
      </div>
    </>
  );
}
