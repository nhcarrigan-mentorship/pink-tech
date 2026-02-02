import { AlertCircle } from "lucide-react";
import { useProfilesContext } from "../../contexts/ProfilesContext";

interface ErrorStateProps {
  heading?: string;
  message?: string;
}

export default function ErrorState({
  heading = "Unable to Load Profiles",
  message = "An error occurred. Please try again later.",
}: ErrorStateProps) {
  const { refetch } = useProfilesContext();

  return (
    <div className="flex flex-col justify-center items-center gap-2 py-16 border border-2 border-pink-200 rounded">
      <AlertCircle className="w-12 h-12 mb-2 text-pink-500" />
      <h2 className="text-xl font-bold">{heading}</h2>
      <p className="mb-2 text-center text-gray-900">{message}</p>

      <button
        onClick={() => refetch}
        className="px-6 py-2 bg-white border-2 border-pink-500 text-pink-600 font-bold rounded-lg hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white hover:border-transparent transition-all cursor-pointer"
      >
        Retry
      </button>
    </div>
  );
}
