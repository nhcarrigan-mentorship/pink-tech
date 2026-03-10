import { useAuth } from "../../contexts/AuthContext";
import LazyIcon from "../ui/LazyIcon";
import { Link } from "react-router-dom";

export default function Hero() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="relative text-white py-10 md:py-24 overflow-hidden bg-gradient-to-br from-pink-500 to-rose-500">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/85 to-rose-500/85" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center">
          <>
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 font-bold">
              Discover Women Shaping the Future of Technology
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mb-4 md:mb-8 mx-auto">
              {isAuthenticated
                ? "Discover inspiring women in tech and manage your profile"
                : "The definitive directory of inspiring leaders, innovators, and experts across the tech industry"}
            </p>
            {isAuthenticated && (
              <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
                <Link
                  to={`/${user?.username}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-pink-500 font-bold text-lg rounded-lg shadow-lg group cursor-pointer hover:bg-pink-500 hover:text-white transition-all hover:scale-105"
                >
                  <LazyIcon
                    name="User"
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  />
                  View My Profile
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-pink-500 font-bold text-lg rounded-lg shadow-lg group cursor-pointer hover:bg-pink-500 hover:text-white transition-all hover:scale-105"
                >
                  <LazyIcon
                    name="Search"
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  />
                  Search Profiles
                </Link>
              </div>
            )}
          </>
        </div>
      </div>
    </div>
  );
}
