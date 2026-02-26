import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import LazyIcon from "../ui/LazyIcon";

export default function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { signup } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSigningUp(true);

    try {
      await signup(email, name, username, password);
      setEmailSent(true);
      navigate("/verify", { state: { email } });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while signing up",
      );
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="bg-white p-8 border border-pink-100 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex justify-center items-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white">
          <LazyIcon name="UserPlus" className="w-8 h-8" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Join PinkTech</h1>
        <p className="text-gray-600">
          Create your profile and share your story
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {emailSent && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            We've sent a verification link to <strong>{email}</strong>.
          </div>
        )}
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <LazyIcon
              name="Mail"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />

            <input
              type="email"
              name="email"
              id="email"
              value={email}
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isSigningUp}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            ></input>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block mb-2 text-sm font-medium">
            Full Name
          </label>

          <div className="relative">
            <LazyIcon
              name="User"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />

            <input
              type="text"
              name="name"
              id="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              disabled={isSigningUp}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            ></input>
          </div>
        </div>

        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block mb-2 text-sm font-medium">
            Username
          </label>

          <div className="relative">
            <LazyIcon
              name="User"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />

            <input
              type="text"
              name="username"
              id="username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="janesmith"
              disabled={isSigningUp}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            ></input>
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <LazyIcon
              name="Lock"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={password}
              autoComplete="new-password"
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSigningUp}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            ></input>

            <button
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <LazyIcon name="EyeOff" className="w-5 h-5" />
              ) : (
                <LazyIcon name="Eye" className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold cursor-pointer hover:from-pink-600 to-rose-600 hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={isSigningUp || emailSent}
        >
          {isSigningUp ? "Signing Up" : "Sign Up"}
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

      <p className="mt-6 text-center text-gray-600 text-sm font-medium">
        Already have an account?{" "}
        <span className="text-pink-500 hover:text-pink-600">
          <Link to="/login">Sign In</Link>
        </span>
      </p>
    </div>
  );
}
