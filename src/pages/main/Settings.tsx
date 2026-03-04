import { useEffect, useState } from "react";
import LazyIcon from "../../components/ui/LazyIcon";
import { useAuth } from "../../contexts/AuthContext";
import { Check, X } from "lucide-react";
import { getSupabase } from "../../config/supabaseClient";

export default function Settings() {
  const USERNAME_MIN = 3;
  const USERNAME_MAX = 20;

  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<Error | null>(null);

  // Populate username
  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user?.username]);

  async function saveUsername(e: React.FormEvent) {
    // Exit form when username is the same
    if (username === user?.username) setEditingUsername(false);

    setSavingUsername(true);
    e.preventDefault();

    let success;

    try {
      const supabase = await getSupabase();

      // Update username
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user?.id)
        .select()
        .single();

      if (error) throw new Error(error);

      if (username) updateProfile({ username });

      success = true;
    } catch (err) {
      const normalized = err instanceof Error ? err : Error(String(err));
      setUsernameError(normalized);
    } finally {
      setSavingUsername(false);
      if (success) setEditingUsername(false);
    }
  }

  function startEditing() {
    setUsername(user?.username ?? null);
    setEditingUsername(true);
  }

  function validateUsername(value: string): string | null {
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

  function onUsernameChange(username: string) {
    const usernameValidationError = validateUsername(username);

    setUsernameError(
      usernameValidationError ? Error(usernameValidationError) : null,
    );
    setUsername(username);
  }

  function onCancel() {
    setEditingUsername(false);
  }

  return (
    <>
      <div className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto mb-6 md:mb-8">
            {/* Page Title */}
            <h2 className="flex items-center gap-3 text-2xl md:text-4xl text-gray-900 mb-2 font-bold border-b-2 border-pink-200 pb-2">
              <LazyIcon
                name="Settings"
                className="w-8 h-8 text-pink-600"
                aria-hidden
              />
              Account Settings
            </h2>

            {/* ── Account Information ── */}
            <div className="mt-8 border border-pink-200 rounded">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-200">
                <h2 className="px-5 py-4 text-lg md:text-base text-gray-900 font-bold">
                  Account Information
                </h2>
              </div>
              <div className="divide-y divide-pink-200">
                {/* Name — read-only */}
                <div className="px-5 py-4">
                  <p className="text-pink-700 font-bold text-xs uppercase tracking-wide mb-0.5">
                    Name
                  </p>
                  <p>{user?.displayName}</p>
                </div>

                {/* Username - inline editable */}
                {editingUsername ? (
                  <form className="px-5 py-4" onSubmit={(e) => saveUsername(e)}>
                    <label className="text-pink-700 font-bold text-xs uppercase tracking-wide">
                      Username
                    </label>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="relative flex-1 max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none pointer-events-none">
                          @
                        </span>
                        <input
                          value={username ?? ""}
                          onChange={(e) => onUsernameChange(e.target.value)}
                          className="w-full pl-8 py-1.5 border border-pink-200 rounded focus:outline-pink-600"
                        ></input>
                      </div>
                      <button
                        type="submit"
                        disabled={savingUsername || usernameError != null}
                        className="p-1.5 rounded text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                        aria-label="Save username"
                      >
                        {savingUsername ? (
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={onCancel}
                        className="p-1.5 rounded text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        disabled={savingUsername}
                        aria-label="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {usernameError && (
                      <p className="mt-1.5 text-xs text-red-600">
                        {usernameError.message}
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="px-5 py-4">
                    <p className="text-pink-700 font-bold text-xs uppercase tracking-wide mb-0.5">
                      Username
                    </p>
                    <div className="flex justify-between">
                      <p>@{user?.username}</p>
                      <button
                        className="inline-flex items-center gap-1 text-sm text-pink-600 font-bold cursor-pointer hover:text-pink-700 transition-colors disabled:cursor-not-allowed"
                        onClick={startEditing}
                      >
                        <LazyIcon name="Edit" className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                )}

                {/* Email — read-only */}
                <div className="px-5 py-4">
                  <p className="text-pink-700 font-bold text-xs uppercase tracking-wide mb-0.5">
                    Email
                  </p>
                  <p>{user?.authEmail}</p>
                </div>

                {/* Password — read-only */}
                <div className="px-5 py-4">
                  <p className="text-pink-700 font-bold text-xs uppercase tracking-wide mb-0.5">
                    Password
                  </p>
                  <p>••••••••</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
