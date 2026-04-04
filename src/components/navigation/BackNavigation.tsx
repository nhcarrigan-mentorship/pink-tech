import { useNavigate } from "react-router-dom";
import LazyIcon from "../ui/LazyIcon";

interface BackNavigationProps {
  variant?: string;
}

export default function BackNavigation({ variant }: BackNavigationProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/search"); // Fallback to search page
    }
  };

  if (variant === "error") {
    return (
      <button
        className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <LazyIcon name="ArrowLeft" className="w-4 h-4" />
        <span className="md:text-lg">Go Back</span>
      </button>
    );
  }

  return (
    <div className="sticky top-14 md:top-16 z-10 shadow-sm border-b border-pink-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md cursor-pointer min-h-[44px]"
        >
          <LazyIcon name="ArrowLeft" className="w-5 h-5" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
}
