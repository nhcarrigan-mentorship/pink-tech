import { Info, X } from "lucide-react";

interface ProfileAuthorshipNoticeProps {
  isOwner: boolean;
  position?: "top" | "bottom";
  onClose?: () => void;
  show?: boolean;
  className?: string;
}

export default function ProfileAuthorshipNotice({
  isOwner,
  position = "top",
  onClose,
  show = true,
  className = "",
}: ProfileAuthorshipNoticeProps) {
  if (!show) return null;

  const base = (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-pink-800">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>
            {isOwner
              ? "This is your personal profile. Click on 'Edit Profile' to make changes."
              : "This profile is written and maintained by the member."}
          </span>
        </div>
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex-shrink-0 text-pink-600 hover:text-pink-800 transition-colors p-1"
            aria-label="Close notice"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  if (position === "bottom") {
    return (
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-[51] bg-pink-50 border-t-2 border-pink-200 shadow-lg animate-fade-in cursor-pointer hover:bg-pink-100 transition-colors">
        {base}
      </div>
    );
  }
  return <div className="bg-pink-50 border-b border-pink-200">{base}</div>;
}
