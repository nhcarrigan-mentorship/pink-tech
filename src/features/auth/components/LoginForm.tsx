import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import LazyIcon from "../../../shared/ui/display/LazyIcon";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [rememberLogin, setRememberLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while logging in.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    import("sonner").then((mod) => {
      try {
        mod.toast("Password reset email sent!", {
          description:
            "Please check your email for instructions to reset your password.",
          duration: 5000,
          style: {
            background: "#fdf2f8",
            border: "1px solid #ec4899",
            color: "#831843",
          },
          className: "font-medium",
        });
      } catch (e) {
        /* ignore */
      }
    });
  };

  return (
    <div className="bg-white p-8 border border-pink-100 rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex justify-center items-center w-16 h-16 mb-4 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full">
          <LazyIcon name="LogIn" className="w-8 h-8 text-white" />
        </div>
        {/* Header */}
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to manage your profile</p>
      </div>

      {/* Error Message  */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm text-gray-600 font-medium"
          >
            Email Address
          </label>

          <div className="relative">
            <LazyIcon
              name="Mail"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 border border-pink-200 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="you@example.com"
            ></input>
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm text-gray-600 font-medium"
          >
            Password
          </label>
          <div className="relative">
            <LazyIcon
              name="Lock"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 border border-pink-200 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            ></input>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showPassword ? (
                <LazyIcon name="EyeOff" className="w-5 h-5" />
              ) : (
                <LazyIcon name="Eye" className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          {/* Remember Login Field */}
          <label htmlFor="remember-login" className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember-login"
              name="remember-login"
              checked={rememberLogin}
              onChange={(e) => setRememberLogin(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-600 cursor-pointer">
              Remember Me
            </span>
          </label>
          {/* Forgot Password Field */}
          <button
            type="button"
            className="text-sm text-pink-500 font-medium cursor-pointer"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all hover:scale-105 shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600 text-sm font-medium">
        Don't have an account?{" "}
        <span>
          <Link to={"/signup"} className="text-pink-500 hover:text-pink-600">
            Join PinkTech
          </Link>
        </span>
      </p>
    </div>
  );
}
