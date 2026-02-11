import LazyIcon from "../../ui/LazyIcon";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function ProfileCreation() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="py-8 md:py-16 border-t-2 border-pink-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-4xl text-gray-900 mb-2 font-bold border-b-2 border-pink-200 pb-2 inline-block">
            Create Your Profile
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-3 md:mt-4">
            Share your story and join the community of inspiring women in tech
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left: Profile Preview */}
          <div className="bg-white border-2 border-pink-200 rounded overflow-hidden">
            {/* Header Section */}
            <div className="border-b-2 border-pink-200 p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-2xl text-gray-900 font-bold border-b border-pink-200 pb-1 mb-2">
                    Your Name
                  </h3>
                  <div className="space-y-1 md:space-y-1.5 text-xs md:text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <LazyIcon
                        name="Briefcase"
                        className="w-3 h-3 md:w-4 md:h-4 text-pink-600 flex-shrink-0"
                      />
                      <span>Your Role at Your Company</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <LazyIcon
                        name="MapPin"
                        className="w-3 h-3 md:w-4 md:h-4 text-pink-600 flex-shrink-0"
                      />
                      <span>Your Location</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="p-4 md:p-6 border-b-2 border-pink-200">
              <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <LazyIcon
                  name="User"
                  className="w-4 h-4 md:w-5 md:h-5 text-pink-600"
                />
                About
              </h4>
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                Share your professional journey, what drives you, and the impact
                you're making in technology.
              </p>
            </div>

            {/* Achievements Section - Hide on mobile to save space */}
            <div className="hidden md:block p-6 border-b-2 border-pink-200">
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <LazyIcon name="Award" className="w-5 h-5 text-pink-600" />
                Key Achievements
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">•</span>
                  <span>Your notable accomplishments and projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">•</span>
                  <span>Awards and recognition you've received</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">•</span>
                  <span>Impact you've made in your field</span>
                </li>
              </ul>
            </div>

            {/* Expertise Section */}
            <div className="p-4 md:p-6">
              <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">
                Expertise
              </h4>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                <span className="px-2 py-1 bg-white border border-pink-200 text-pink-700 rounded text-xs">
                  Your Skills
                </span>
                <span className="px-2 py-1 bg-white border border-pink-200 text-pink-700 rounded text-xs">
                  Technologies
                </span>
                <span className="px-2 py-1 bg-white border border-pink-200 text-pink-700 rounded text-xs">
                  Specializations
                </span>
              </div>
            </div>
          </div>

          {/* Right: Benefits List */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white border-2 border-pink-200 rounded overflow-hidden">
              {/* Toggle header for mobile */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="md:hidden w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <h3 className="text-lg font-bold text-gray-900">
                  Why Create a Profile?
                </h3>
                {isExpanded ? (
                  <LazyIcon
                    name="ChevronUp"
                    className="w-5 h-5 text-pink-600 flex-shrink-0"
                  />
                ) : (
                  <LazyIcon
                    name="ChevronDown"
                    className="w-5 h-5 text-pink-600 flex-shrink-0"
                  />
                )}
              </button>

              {/* Desktop title (always visible) */}
              <div className="hidden md:block p-6 pb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Why Create a Profile?
                </h3>
              </div>

              {/* Content - collapsible on mobile, always visible on desktop */}
              <div
                className={`${
                  isExpanded ? "block" : "hidden"
                } md:block p-4 md:px-6 md:pb-6 md:pt-0`}
              >
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-2 md:gap-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-pink-600 text-xs md:text-sm font-bold">
                        ✓
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-0.5 md:mb-1 text-sm md:text-base">
                        Control Your Story
                      </h4>
                      <p className="text-xs md:text-sm text-gray-700">
                        Present yourself on your own terms
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-pink-600 text-xs md:text-sm font-bold">
                        ✓
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-0.5 md:mb-1 text-sm md:text-base">
                        Join the Community
                      </h4>
                      <p className="text-xs md:text-sm text-gray-700">
                        Connect with inspiring women in tech
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-pink-600 text-xs md:text-sm font-bold">
                        ✓
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-0.5 md:mb-1 text-sm md:text-base">
                        Increase Visibility
                      </h4>
                      <p className="text-xs md:text-sm text-gray-700">
                        Make your achievements discoverable
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-pink-600 text-xs md:text-sm font-bold">
                        ✓
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-0.5 md:mb-1 text-sm md:text-base">
                        Shape the Narrative
                      </h4>
                      <p className="text-xs md:text-sm text-gray-700">
                        Change perceptions about women in tech
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center md:text-left">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md text-sm md:text-base group cursor-pointer"
              >
                Get Started
                <LazyIcon
                  name="ArrowRight"
                  className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
