import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LazyIcon from "../../shared/ui/LazyIcon";

export default function DesktopNavigationMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, uiCachedUser } = useAuth();
  const displayUser = user ?? uiCachedUser;
  const showAuthenticated = isAuthenticated || !!uiCachedUser;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  async function handleLogout() {
    navigate("/");
    await logout();
  }

  return (
    <div className="hidden md:flex gap-6">
      <Link
        to="/"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActive("/")
            ? "bg-pink-50 text-pink-700"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <LazyIcon name="Home" className="w-4 h-4" />
        <span>Home</span>
      </Link>
      <Link
        to="/search"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActive("/search")
            ? "bg-pink-50 text-pink-700"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <LazyIcon name="Search" className="w-4 h-4" />
        <span>Search</span>
      </Link>
      {showAuthenticated ? (
        <>
          <Link
            to={`/${displayUser?.username}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isActive(`/${displayUser?.username}`)
                ? "bg-pink-50 text-pink-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LazyIcon name="User" className="w-4 h-4" />
            <span>My Profile</span>
          </Link>
          <Link
            to="/settings"
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isActive("/settings")
                ? "bg-pink-50 text-pink-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LazyIcon name="Settings" className="w-4 h-4" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            <LazyIcon name="LogOut" className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </>
      ) : (
        <Link
          to="/login"
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            isActive("/login")
              ? "bg-pink-50 text-pink-700"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <LazyIcon name="LogIn" className="w-4 h-4" />
          <span>Login</span>
        </Link>
      )}
    </div>
  );
}
