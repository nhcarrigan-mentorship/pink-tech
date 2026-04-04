import FeaturedProfiles from "../../features/profile/featured/FeaturedProfiles";
import { HomeSearch } from "../../features/search/components/HomeSearch";
import CallToAction from "../../shared/components/CallToAction";
import Hero from "../../shared/components/Hero";
import { useAuth } from "../../shared/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Hero />
      <HomeSearch />
      <FeaturedProfiles />
      {!isAuthenticated && <CallToAction />}
    </div>
  );
}
