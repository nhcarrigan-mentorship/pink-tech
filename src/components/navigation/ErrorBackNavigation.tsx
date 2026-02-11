import { useNavigate } from "react-router-dom";
import LazyIcon from "../ui/LazyIcon";

export default function ErrorBackNavigation() {
  const navigate = useNavigate();

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
