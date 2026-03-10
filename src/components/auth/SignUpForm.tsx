import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import LazyIcon from "../ui/LazyIcon";

export default function SignUpForm() {
  const NAME_MIN = 3;
  const NAME_MAX = 141;
  const USERNAME_MIN = 3;
  const USERNAME_MAX = 20;
  const EMAIL_MAX = 320;

  const PASSWORD_MIN = 8;
  const PASSWORD_MAX = 128;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState<Error | null>(null);
  const [emailError, setEmailError] = useState<Error | null>(null);
  const [nameError, setNameError] = useState<Error | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { signup } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  function validateUsername(value: string): string | null {
    if (value.length < 1) return null;
    if (value.length < USERNAME_MIN || value.length > USERNAME_MAX)
      return `Username must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters.`;
    if (!/^[a-zA-Z0-9_-]+$/.test(value))
      return "Username can only contain letters, numbers, underscores, and hyphens.";
    if (/^[_-]|[_-]$/.test(value))
      return "Username cannot start or end with an underscore or hyphen.";
    if (/[_-]{2}/.test(value))
      return "Username cannot contain consecutive underscores or hyphens.";
    if (/^[0-9]/.test(value)) return "Username must start with a letter.";
    return null;
  }

  function validateName(value: string): string | null {
    const trimmed = value.trim();

    if (trimmed.length < 1) return null;
    if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX)
      return "Name must be between 2 and 141 characters.";
    if (!/^[\p{L}\p{M}'\-. ]+$/u.test(trimmed))
      return "Name can only contain letters, spaces, hyphens, apostrophes, and periods.";
    if (/\s{2,}/.test(trimmed))
      return "Name cannot contain consecutive spaces.";
    if (/[-'.]{2,}/.test(trimmed))
      return "Name cannot contain consecutive hyphens, apostrophes, or periods.";
    if (/^[-'.]|[-'.]$/.test(trimmed))
      return "Name cannot start or end with a hyphen, apostrophe, or period.";
    return null;
  }

  function validateEmail(value: string): string | null {
    const trimmed = value.trim();

    if (trimmed.length < 1) return null;
    if (trimmed.length > EMAIL_MAX)
      return "Email must be 320 characters or fewer.";
    if (/\s/.test(trimmed)) return "Email must not contain spaces.";

    const parts = trimmed.split("@");
    if (parts.length !== 2) return "Please provide a valid email address.";

    const [local, domain] = parts;

    // Local-part checks
    if (local.length < 1 || local.length > 64)
      return "Email local part should be 1–64 characters.";
    if (local.startsWith(".") || local.endsWith("."))
      return "Email local part must not start or end with a dot.";
    if (local.includes(".."))
      return "Email local part must not contain consecutive dots.";
    if (!/^[A-Za-z0-9._-]+$/.test(local))
      return "Email local part may only include letters, numbers, dots, underscores, and hyphens.";

    // Domain checks
    if (domain.length < 1 || domain.length > 255)
      return "Please provide a valid email domain.";
    const labels = domain.split(".").filter(Boolean);
    if (labels.length < 2)
      return "Email domain must include a top-level domain (e.g. .com).";
    for (const label of labels) {
      if (label.length < 1 || label.length > 63)
        return "Each domain label should be 1–63 characters.";
      if (!/^[A-Za-z0-9-]+$/.test(label))
        return "Email domain may only include letters, numbers, and hyphens.";
      if (label.startsWith("-") || label.endsWith("-"))
        return "Email domain labels must not start or end with a hyphen.";
    }
    const tld = labels[labels.length - 1];
    if (!/^[A-Za-z]{2,}$/.test(tld))
      return "Top-level domain should be at least 2 letters.";

    return null;
  }

  const PASSWORD_RULES = [
    {
      label: "At least 8 characters",
      test: (v: string) => v.length >= PASSWORD_MIN,
    },
    {
      label: "At most 128 characters",
      test: (v: string) => v.length <= PASSWORD_MAX,
    },
    {
      label: "One uppercase letter (A–Z)",
      test: (v: string) => /[A-Z]/.test(v),
    },
    {
      label: "One lowercase letter (a–z)",
      test: (v: string) => /[a-z]/.test(v),
    },
    { label: "One number (0–9)", test: (v: string) => /[0-9]/.test(v) },
    {
      label: "One special character (!@#$%^&*…)",
      test: (v: string) => /[^A-Za-z0-9]/.test(v),
    },
  ];

  function getPasswordStrength(value: string): number {
    if (value.length === 0) return 0;
    return PASSWORD_RULES.filter((r) => r.test(value)).length;
  }

  function validatePassword(value: string): string | null {
    if (value.length < 1) return null;
    if (value.length > PASSWORD_MAX)
      return `Password must be at most ${PASSWORD_MAX} characters.`;
    if (value.length < PASSWORD_MIN)
      return `Password must be at least ${PASSWORD_MIN} characters.`;
    if (!/[A-Z]/.test(value))
      return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(value))
      return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(value))
      return "Password must contain at least one number.";
    if (!/[^A-Za-z0-9]/.test(value))
      return "Password must contain at least one special character.";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSigningUp(true);

    try {
      const usernameValidationError = validateUsername(username);
      if (usernameValidationError) throw new Error(usernameValidationError);
      const passwordValidationError = validatePassword(password);
      if (passwordValidationError) throw new Error(passwordValidationError);
      await signup(email, name, username, password);
      setEmailSent(true);
      sessionStorage.setItem("pendingVerification", email);
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
          Add your profile to the directory and control how you're represented
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
              minLength={NAME_MIN}
              maxLength={NAME_MAX}
              value={email}
              autoComplete="email"
              required
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(
                  validateEmail(e.target.value)
                    ? new Error(validateEmail(e.target.value)!)
                    : null,
                );
              }}
              placeholder="you@example.com"
              disabled={isSigningUp}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            ></input>
          </div>
          {emailError && (
            <p className="mt-1.5 text-xs text-red-600">{emailError.message}</p>
          )}
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
              onChange={(e) => {
                setName(e.target.value);
                setNameError(
                  validateName(e.target.value)
                    ? new Error(validateName(e.target.value)!)
                    : null,
                );
              }}
              placeholder="Jane Smith"
              disabled={isSigningUp}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            ></input>
          </div>
          {nameError && (
            <p className="mt-1.5 text-xs text-red-600">{nameError.message}</p>
          )}
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
              minLength={USERNAME_MIN}
              maxLength={USERNAME_MAX}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(
                  validateUsername(e.target.value)
                    ? new Error(validateUsername(e.target.value)!)
                    : null,
                );
              }}
              onBlur={(e) => {
                const msg = validateUsername(e.target.value);
                setUsernameError(msg ? new Error(msg) : null);
              }}
              placeholder="janesmith"
              disabled={isSigningUp}
              className={`w-full pl-11 pr-4 py-3 border rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                usernameError ? "border-red-400" : "border-gray-300"
              }`}
            ></input>
          </div>
          {usernameError && (
            <p className="mt-1.5 text-xs text-red-600">
              {usernameError.message}
            </p>
          )}
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
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(validatePassword(e.target.value));
              }}
              placeholder="••••••••"
              disabled={isSigningUp}
              className={`w-full pl-11 pr-11 py-3 border rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                passwordError ? "border-red-400" : "border-gray-300"
              }`}
            ></input>

            <button
              type="button"
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

          {/* Strength bar */}
          {password.length > 0 &&
            (() => {
              const strength = getPasswordStrength(password);
              const levels = [
                { min: 0, label: "", bars: 0 },
                { min: 1, label: "Very weak", bars: 1 },
                { min: 2, label: "Weak", bars: 2 },
                { min: 3, label: "Fair", bars: 3 },
                { min: 5, label: "Strong", bars: 4 },
                { min: 6, label: "Very strong", bars: 5 },
              ];
              const level = [...levels]
                .reverse()
                .find((l) => strength >= l.min)!;
              const colors = [
                "",
                "bg-red-500",
                "bg-orange-400",
                "bg-yellow-400",
                "bg-lime-500",
                "bg-green-500",
              ];
              const textColors = [
                "",
                "text-red-500",
                "text-orange-400",
                "text-yellow-500",
                "text-lime-600",
                "text-green-600",
              ];
              return (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < level.bars ? colors[level.bars] : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  {level.label && (
                    <p
                      className={`text-xs font-medium ${textColors[level.bars]}`}
                    >
                      {level.label}
                    </p>
                  )}
                </div>
              );
            })()}

          {/* Requirements checklist */}
          {password.length > 0 && (
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.filter(
                (r) => r.label !== "At most 128 characters",
              ).map((rule) => {
                const met = rule.test(password);
                return (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs ${
                      met ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <LazyIcon
                      name={met ? "CircleCheck" : "Circle"}
                      className="w-3.5 h-3.5 shrink-0"
                    />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}
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
