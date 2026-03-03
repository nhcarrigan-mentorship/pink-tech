import LazyIcon from "../../components/ui/LazyIcon";
import { useAuth } from "../../contexts/AuthContext";

export default function Settings() {
  const { user } = useAuth();

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
              <div className="divide-y divide-gray-100">
                {/* Name — read-only */}
                <div className="px-5 py-4">
                  <p className="text-pink-700 font-bold text-xs uppercase tracking-wide mb-0.5">
                    Name
                  </p>
                  <p>{user?.displayName}</p>
                </div>

                {/* Editable Username */}
                <div className="px-5 py-4">
                  <p className="text-pink-700 font-bold text-xs uppercase tracking-wide mb-0.5">
                    Username
                  </p>
                  <div className="flex justify-between">
                    <p>{user?.username}</p>
                    <button className="inline-flex items-center gap-1 text-sm text-pink-600 font-bold cursor-pointer hover:text-pink-700 transition-colors">
                      <LazyIcon name="Edit" className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>

                {/* Email — read-only */}
                <div className="px-5 py-4">
                  <p className="text-pink-700 font-bold text-xs uppercase tracking-wide mb-0.5">
                    Email
                  </p>
                  <p>{user?.authEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
