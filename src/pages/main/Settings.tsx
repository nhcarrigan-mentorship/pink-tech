import { useState } from "react";
import LazyIcon from "../../components/ui/LazyIcon";
import { useAuth } from "../../contexts/AuthContext";
import { Check, X } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username);
  const [editingUsername, setEditingUsername] = useState(false);

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
                  <form className="px-5 py-4">
                    <label className="text-pink-700 font-bold text-xs uppercase tracking-wide">
                      Username
                    </label>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="relative flex-1 max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none pointer-events-none">
                          @
                        </span>
                        <input
                          value={username}
                          className="w-full pl-8 py-1.5 border border-pink-200 rounded focus:outline-pink-600"
                        ></input>
                      </div>
                      <button className="p-1.5 rounded text-green-600 hover:bg-green-50 disabled:opacity-50 transition-colors cursor-pointer">
                        <Check className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Lowercase letters, numbers, underscores, dots, and
                      hyphens. Min 3 characters.
                    </p>
                  </form>
                ) : (
                  <div className="px-5 py-4">
                    <p className="text-pink-700 font-bold text-xs uppercase tracking-wide mb-0.5">
                      Username
                    </p>
                    <div className="flex justify-between">
                      <p>{user?.username}</p>
                      <button
                        className="inline-flex items-center gap-1 text-sm text-pink-600 font-bold cursor-pointer hover:text-pink-700 transition-colors"
                        onClick={() => setEditingUsername(true)}
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
