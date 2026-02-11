import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LazyIcon from "../ui/LazyIcon";

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
        <p className="text-gray-600">Sign in to continue your story</p>
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
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          {isLoading ? "Signing In" : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Social Login Options */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isLoading}
          className="py-3 px-4 border-2 border-pink-200 rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:border-pink-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium">Google</span>
        </button>
        <button
          type="button"
          disabled={isLoading}
          className="py-3 px-4 border-2 border-pink-200 rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:border-pink-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span className="text-sm font-medium">LinkedIn</span>
        </button>
      </div>

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
