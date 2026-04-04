import { useEffect, useState } from "react";
import LazyIcon from "../../../components/ui/LazyIcon";
import type { UserProfile } from "../../../shared/types/UserProfile";
import ImageWithFallback from "../../../components/ui/ImageWithFallback";

interface FeaturedProfileCardProps {
  profile: UserProfile;
  onLearnMore: () => void;
}

export default function FeaturedProfileCard({
  profile,
  onLearnMore,
}: FeaturedProfileCardProps) {
  const [motionModule, setMotionModule] = useState<any | null>(null);
  useEffect(() => {
    let mounted = true;
    import("motion/react").then((m) => {
      if (mounted) setMotionModule(m);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const MotionDiv = motionModule?.motion?.div ?? "div";
  return (
    <div className="grid md:grid-cols-3 gap-0">
      {/* Image */}
      <div
        className={`md:col-span-1 relative h-[250px] md:h-[400px] border-r-2 border-pink-200`}
      >
        <ImageWithFallback
          src={profile?.image ? profile.image : ""}
          alt={profile?.displayName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="md:col-span-2 p-4 md:p-8">
        <MotionDiv
          initial={motionModule ? { opacity: 0 } : undefined}
          animate={motionModule ? { opacity: 1 } : undefined}
          transition={motionModule ? { delay: 0.1, duration: 0.3 } : undefined}
        >
          <div className="mb-2 md:mb-3">
            <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded border border-pink-200 font-bold">
              Featured Profile
            </span>
          </div>

          <h3 className="text-xl md:text-3xl text-gray-900 mb-2 font-bold border-b border-pink-200 pb-2">
            {profile?.displayName}
          </h3>

          <div className="space-y-1 md:space-y-1.5 mb-3 md:mb-4 text-xs md:text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <LazyIcon
                name="Briefcase"
                className="w-3 h-3 md:w-4 md:h-4 text-pink-600"
              />
              <span>
                {profile?.role} at {profile?.company}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <LazyIcon
                name="MapPin"
                className="w-3 h-3 md:w-4 md:h-4 text-pink-600"
              />
              <span>{profile?.location}</span>
            </div>
          </div>

          <p className="text-sm md:text-base text-gray-900 mb-3 md:mb-4 leading-relaxed">
            {profile?.bio}
          </p>

          {/* Expertise Tags */}
          <div className="flex flex-wrap gap-1 md:gap-1.5 mb-3 md:mb-4">
            {profile?.expertise &&
              profile.expertise.slice(0, 4).map((exp, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white border border-pink-200 text-pink-700 rounded text-xs"
                >
                  {exp}
                </span>
              ))}
          </div>

          <button
            onClick={onLearnMore}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all text-xs md:text-sm group cursor-pointer"
          >
            Read Full Profile
            <LazyIcon
              name="ArrowRight"
              className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform"
            />
          </button>
        </MotionDiv>
      </div>
    </div>
  );
}
