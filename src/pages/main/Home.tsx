import { useAuth } from "../../contexts/AuthContext";
import Hero from "../../components/layout/Hero";
import FeaturedProfiles from "../../components/profile/home/FeaturedProfiles";
import CallToAction from "../../components/layout/CallToAction";
import { HomeSearch } from "../../components/profile/home/HomeSearch";

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
