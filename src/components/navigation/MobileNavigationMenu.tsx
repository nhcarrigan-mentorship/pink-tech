import LazyIcon from "../../shared/ui/LazyIcon";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function MobileNavigationMenu() {
  // Add a class to allow hiding when modal is open
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, uiCachedUser } = useAuth();
  const displayUser = user ?? uiCachedUser;
  const showAuthenticated = isAuthenticated || !!uiCachedUser;

  const handleLogout = async () => {
    navigate("/");
    await logout();
  };
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom mobile-nav-hide-on-modal">
      <div className="flex justify-around items-center h-16 px-2">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[70px] ${
            isActive("/") ? "text-pink-600" : "text-gray-600"
          }`}
        >
          <LazyIcon
            name="Home"
            className={`w-6 h-6 ${isActive("/") ? "stroke-[2.5]" : ""}`}
          />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link
          to="/search"
          className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[70px] ${
            isActive("/search") ? "text-pink-600" : "text-gray-600"
          }`}
        >
          <LazyIcon
            name="Search"
            className={`w-6 h-6 ${isActive("/search") ? "stroke-[2.5]" : ""}`}
          />
          <span className="text-xs font-medium">Search</span>
        </Link>

        {showAuthenticated ? (
          <>
            <Link
              to={`/${displayUser?.username}`}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[70px] ${
                isActive(`/${displayUser?.username}`)
                  ? "text-pink-600"
                  : "text-gray-600"
              }`}
            >
              <LazyIcon
                name="User"
                className={`w-6 h-6 ${
                  isActive(`/${displayUser?.username}`) ? "stroke-[2.5]" : ""
                }`}
              />
              <span className="text-xs font-medium">Profile</span>
            </Link>
            <Link
              to={`/settings`}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[70px] ${
                isActive(`/settings`) ? "text-pink-600" : "text-gray-600"
              }`}
            >
              <LazyIcon
                name="Settings"
                className={`w-6 h-6 ${
                  isActive(`/settings`) ? "stroke-[2.5]" : ""
                }`}
              />
              <span className="text-xs font-medium">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors text-gray-600 cursor-pointer min-w-[70px]"
            >
              <LazyIcon name="LogOut" className="w-6 h-6" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[70px] ${
              isActive("/login") ? "text-pink-600" : "text-gray-600"
            }`}
          >
            <LazyIcon
              name="LogIn"
              className={`w-6 h-6 ${isActive("/login") ? "stroke-[2.5]" : ""}`}
            />
            <span className="text-xs font-medium">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
