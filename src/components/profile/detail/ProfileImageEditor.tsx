import type { UserProfile } from "../../../types/UserProfile";
import ImageWithFallback from "../../ui/ImageWithFallback";
import { Edit } from "lucide-react";

interface ProfileImageEditor {
  editedProfile: Partial<UserProfile>;
  setNewProfileFile: React.Dispatch<React.SetStateAction<File | null>>;
  previewUrl: string | null;
  isUploadingImage: boolean;
}

export default function ProfileImageEditor({
  editedProfile,
  setNewProfileFile,
  previewUrl,
  isUploadingImage,
}: ProfileImageEditor) {
  // Set new profile image
  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setNewProfileFile(file);
  }

  return (
    <div className="relative group aspect-square overflow-hidden">
      <label>
        <input
          type="file"
          name="image"
          id="image"
          accept="image/*"
          className="hidden"
          onChange={onPhotoChange}
        ></input>
        <span className="hidden">Image</span>
        <ImageWithFallback
          src={previewUrl ?? ""}
          alt={editedProfile?.displayName}
          className="w-full h-full object-cover pb-3 border-b border-pink-200 bg-transparent cursor-pointer"
        />
      </label>

      {/* Edit icon overlay for owners (appears on hover) */}
      {!isUploadingImage ? (
        <div
          aria-label="Edit profile"
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <Edit className="w-4 h-4 text-pink-600" />
        </div>
      ) : (
        <div className="absolute inset-0 flex justify-center items-center bg-black/60 text-white font-bold">
          Uploading...
        </div>
      )}
    </div>
  );
}
