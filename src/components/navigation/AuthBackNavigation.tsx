import { useNavigate } from "react-router-dom";
import LazyIcon from "../ui/LazyIcon";

export default function AuthBackNavigation() {
  const navigate = useNavigate();

  return (
    // Back Link
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 min-h-[44px] ml-2 px-2 py-2 mb-8 text-pink-500 cursor-pointer rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors"
    >
      <LazyIcon name="ArrowLeft" className="w-5 h-5 md:w-4 md:h-4" />
      <span className="font-medium">Go Back</span>
    </button>
  );
}
