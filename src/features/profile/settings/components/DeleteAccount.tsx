import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LazyIcon from "../../../../shared/ui/LazyIcon";
import { useAuth } from "../../../../contexts/AuthContext";
import { useProfilesContext } from "../../../../hooks/useProfilesContext";

export default function DeleteAccount() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const { user, deleteProfile } = useAuth();
  const { removeProfileFromContext } = useProfilesContext();
  const navigate = useNavigate();

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteProfile();
      if (user?.id) removeProfileFromContext(user.id);
      navigate("/");
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error(String(err));
      setDeleteError(normalized);
    } finally {
      setIsDeleting(false);
    }
  }

  function cancelDelete() {
    setShowDeleteModal(false);
  }

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
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-shrink-0 px-5 py-2 border border-red-400 flex gap-2 items-center text-sm text-red-600 font-bold rounded cursor-pointer hover:bg-red-50 transition-colors"
            >
              <LazyIcon name="Trash2" className="w-4 h-5" />
              Delete My Account
            </button>
          </div>
        </div>
      </div>
      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative w-full max-w-sm p-6 space-y-5 bg-white border-gray-200 rounded shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex justify-center items-center items-center bg-red-100 rounded-full">
                <LazyIcon
                  name="AlertTriangle"
                  className="text-red-600 w-5 h-5"
                />
              </div>
              <div>
                <h3 className="font-bold">Delete Account</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold">@{user?.username}</span>? All your
              profile data will be removed.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="flex-1 py-2 text-sm text-gray-700 font-bold border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 flex gap-2 justify-center items-center py-2 text-sm font-bold bg-red-600 text-white rounded cursor-pointer hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <LazyIcon name="Trash2" className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
            {deleteError && (
              <p className="mt-1.5 text-xs text-red-600">
                Failed to delete profile. Please try again later.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
