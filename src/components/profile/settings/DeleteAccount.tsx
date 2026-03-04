import LazyIcon from "../../ui/LazyIcon";

export default function DeleteAccount() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto mb-6 md:mb-8">
        {/* ── Account Deletion ── */}
        <div className="mt-8 border border-red-200 rounded">
          <div className="bg-red-50 border-b border-red-200">
            <h2 className="px-5 py-4 text-lg md:text-base text-gray-900 font-bold">
              Danger Zone
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-bold text-gray-900">
                Delete my account
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                Permanently remove your account and all associated data. This
                cannot be undone.
              </p>
            </div>
            <button className="flex-shrink-0 px-5 py-2 border border-red-400 flex gap-2 items-center text-sm text-red-600 font-bold rounded cursor-pointer hover:bg-red-50 transition-colors">
              <LazyIcon name="Trash2" className="w-4 h-5" />
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
