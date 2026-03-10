import { Link } from "react-router-dom";
import LazyIcon from "../ui/LazyIcon";

export default function CallToAction() {
  return (
    <div className="py-16 md:py-20 mb-20 bg-gray-50 text-gray-900 border border-pink-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 items-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center">
          Are You a Woman in Tech?
        </h2>

        {/* Description */}
        <p className="max-w-2xl text-lg md:text-xl text-center mb-4">
          Join the directory and control how you're represented. Your profile
          helps others discover your work and contributions to the industry.
        </p>

        {/* Call to Action Button */}
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-pink-500 font-bold text-lg rounded-lg shadow-lg group cursor-pointer hover:bg-pink-500 border-2 border-pink-500 hover:text-white transition-all hover:scale-105"
        >
          Add Your Profile
          <LazyIcon
            name="ArrowRight"
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}
