import BackNavigation from "../../../shared/components/navigation/BackNavigation";
import LazyIcon from "../../../shared/ui/display/LazyIcon";

export default function ProfileNotFound() {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div className="inline-flex justify-center items-center w-20 h-20 bg-pink-100 rounded-full">
        <LazyIcon name="User" className="w-10 h-10 text-pink-600" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold">Profile Not Found</h1>
      <p className="text-gray-600 text-center mb-4">
        The profile you're looking for doesn't exist or has been removed.
      </p>
      <BackNavigation variant="error" />
    </div>
  );
}
