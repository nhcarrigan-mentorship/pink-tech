import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import LazyIcon from "../ui/LazyIcon";
import {
  getPasswordStrength,
  validateEmail,
  validateName,
  validatePassword,
  validateUsername,
  NAME_MAX,
  NAME_MIN,
  PASSWORD_RULES,
  USERNAME_MAX,
  USERNAME_MIN,
} from "../../utils/validators";

type FormValues = {
  name: null | string;
  email: null | string;
  username: null | string;
  password: null | string;
};

type FormErrors = {
  name: null | string;
  email: null | string;
  username: null | string;
  password: null | string;
};

const FieldValidators = {
  name: validateName,
  email: validateEmail,
  username: validateUsername,
  password: validatePassword,
};

export default function SignUpForm() {
  const [formValues, setFormValues] = useState<FormValues>({
    name: null,
    email: null,
    username: null,
    password: null,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: null,
    email: null,
    username: null,
    password: null,
  });

  const { name, email, username, password } = formValues;

  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { signup } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    const { name, value } = e.target;

    // Get the validator that matches field input
    const validator = FieldValidators[name as keyof FormValues];

    if (validator) {
      setFormValues((prev) => ({ ...prev, [name]: value }));
      setFormErrors((prev) => ({ ...prev, [name]: validator(value) }));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSigningUp(true);

    try {
      const usernameValidationError = validateUsername(username ?? "");
      if (usernameValidationError) throw new Error(usernameValidationError);
      const passwordValidationError = validatePassword(password ?? "");
      if (passwordValidationError) throw new Error(passwordValidationError);
      await signup(email ?? "", name ?? "", username ?? "", password ?? "");
      setEmailSent(true);
      sessionStorage.setItem("pendingVerification", email ?? "");
      navigate("/verify", { state: { email: email } });
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
              value={email ?? ""}
              autoComplete="email"
              required
              onChange={(e) => {
                onInputChange(e);
              }}
              placeholder="you@example.com"
              disabled={isSigningUp}
              className="w-full pl-11 pr-4 py-3 border border-pink-200 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            ></input>
          </div>
          {formErrors["email"] && (
            <p className="mt-1.5 text-xs text-red-600">{formErrors["email"]}</p>
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
              value={name ?? ""}
              onChange={(e) => {
                onInputChange(e);
              }}
              placeholder="Jane Smith"
              disabled={isSigningUp}
              className="w-full pl-11 pr-4 py-3 border border-pink-200 rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            ></input>
          </div>
          {formErrors["name"] && (
            <p className="mt-1.5 text-xs text-red-600">{formErrors["name"]}</p>
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
              value={username ?? ""}
              onChange={(e) => onInputChange(e)}
              onBlur={(e) => {
                const msg = validateUsername(e.target.value);
                setFormErrors((prev) => ({
                  ...prev,
                  username: msg,
                }));
              }}
              placeholder="janesmith"
              disabled={isSigningUp}
              className={`w-full pl-11 pr-4 py-3 border rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                formErrors["username"] ? "border-red-400" : "border-pink-200"
              }`}
            ></input>
          </div>
          {formErrors["username"] && (
            <p className="mt-1.5 text-xs text-red-600">
              {formErrors["username"]}
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
              value={password ?? ""}
              autoComplete="new-password"
              required
              onChange={(e) => {
                onInputChange(e);
              }}
              placeholder="••••••••"
              disabled={isSigningUp}
              className={`w-full pl-11 pr-11 py-3 border rounded-lg outline-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                formErrors["password"] ? "border-red-400" : "border-pink-200"
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
          {password ??
            ("".length > 0 &&
              (() => {
                const strength = getPasswordStrength(password ?? "");
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
              })())}

          {/* Requirements checklist */}
          {password ??
            ("".length > 0 && (
              <ul className="mt-2 space-y-1">
                {PASSWORD_RULES.filter(
                  (r) => r.label !== "At most 128 characters",
                ).map((rule) => {
                  const met = rule.test(password ?? "");
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
            ))}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold cursor-pointer hover:from-pink-600 to-rose-600 hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={isSigningUp || emailSent}
        >
          {isSigningUp ? "Signing Up" : "Sign Up"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600 text-sm font-medium">
        Already have an account?{" "}
        <span className="text-pink-500 hover:text-pink-600">
          <Link to="/login">Sign In</Link>
        </span>
      </p>
    </div>
  );
}
