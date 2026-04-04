import { useAuth } from "../contexts/AuthContext";

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
              {isAuthenticated
                ? `Welcome Back, ${user?.displayName}`
                : "Discover Women Shaping Today's Technology"}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              {isAuthenticated
                ? "Discover inspiring women in tech and manage your profile"
                : "The definitive directory of inspiring leaders, innovators, and experts across the tech industry"}
            </p>
          </>
        </div>
      </div>
    </div>
  );
}
