import { useAuth } from "../../shared/contexts/AuthContext";
import CallToAction from "../../shared/components/CallToAction";
import { HomeSearch } from "../../features/search/components/HomeSearch";
import FeaturedProfiles from "../../features/profile/featured/FeaturedProfiles";
import Hero from "../../shared/components/Hero";

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
