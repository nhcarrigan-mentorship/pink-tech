import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PanInfo } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfilesContext } from "../../../contexts/ProfilesContext";
import FeaturedProfileCard from "./FeaturedProfileCard";
import Pagination from "../../ui/Pagination";
import LoadingState from "../../ui/LoadingState";
import ErrorState from "../../ui/ErrorState";

export default function FeaturedProfiles() {
  const FEATURED_COUNT = 5;
  const { profiles, loading, error, refetch } = useProfilesContext();
  const featuredProfiles = profiles.slice(0, FEATURED_COUNT);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();

  // Minimum swipe distance (in px)
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  useEffect(() => {
    if (isPaused) return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    if (!mediaQuery.matches) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % featuredProfiles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, featuredProfiles.length]);

  const currentProfile = featuredProfiles[currentIndex];

  const handleLearnMore = () => {
    navigate(`/${currentProfile.username}`);
  };

  const handleCardClick = () => {
    navigate(`/${currentProfile.username}`);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + featuredProfiles.length) % featuredProfiles.length,
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % featuredProfiles.length);
  };

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo,
  ) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      // Swiped left - go to next
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % featuredProfiles.length);
    } else if (swipe > swipeConfidenceThreshold) {
      // Swiped right - go to previous
      setDirection(-1);
      setCurrentIndex(
        (prev) =>
          (prev - 1 + featuredProfiles.length) % featuredProfiles.length,
      );
    }
  };

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 50 : -50,
        opacity: 0,
        scale: 0.95,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 50 : -50,
        opacity: 0,
        scale: 0.95,
      };
    },
  };

  let content;
  if (error) {
    content = (
      <ErrorState
        heading="Unable to Load Featured Profiles"
        message="An error occurred while loading the featured profiles. Please try again later."
        onRetry={refetch}
      />
    );
  } else if (loading) {
    content = <LoadingState message="Loading featured profiles..." />;
  } else {
    content = (
      <div
        className="max-w-5xl mx-auto relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Arrows - Desktop Only */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 p-1.5 md:p-2 rounded-full shadow-md border border-pink-200 transition-all cursor-pointer hidden md:block"
            aria-label="Previous profile"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
          </button>
        )}
        {currentIndex < featuredProfiles.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 p-1.5 md:p-2 rounded-full shadow-md border border-pink-200 transition-all cursor-pointer hidden md:block"
            aria-label="Next profile"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
          </button>
        )}
        {/* Mobile Swipe Indicators */}
        <div className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          {currentIndex > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 0.6, x: 0 }}
              className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-pink-500/90 to-transparent rounded-r-lg"
            >
              <ChevronsLeft className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </div>
        <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          {currentIndex < profiles.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 0.6, x: 0 }}
              className="flex items-center gap-1 px-2 py-1 bg-gradient-to-l from-pink-500/90 to-transparent rounded-l-lg"
            >
              <ChevronsRight className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            onClick={handleCardClick}
            onDragEnd={handleDragEnd}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            style={{
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            className="bg-white border-2 border-pink-200 rounded overflow-hidden cursor-pointer hover:border-pink-400 md:cursor-pointer select-none"
          >
            <FeaturedProfileCard
              profile={currentProfile}
              onLearnMore={handleLearnMore}
            />
          </motion.div>
        </AnimatePresence>
        {/* Number Pagination - All screens */}
        <div className="flex items-center justify-center gap-1 md:gap-2 mt-4">
          <Pagination
            currentPage={currentIndex + 1}
            totalPages={featuredProfiles.length}
            onPageChange={(page) => {
              setDirection(page - 1 > currentIndex ? 1 : -1);
              setCurrentIndex(page - 1);
            }}
          />
        </div>
        {/* Mobile Swipe Hint - Only show on first load */}
        {currentIndex === 0 && featuredProfiles.length > 1 && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 3, duration: 1 }}
            className="md:hidden flex items-center justify-center gap-2 mt-3 text-xs text-gray-500"
          >
            <ChevronsLeft className="w-3 h-3" />
            <span>Swipe to explore more profiles</span>
            <ChevronsRight className="w-3 h-3" />
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-4xl text-gray-900 mb-2 font-bold border-b-2 border-pink-200 pb-2 inline-block">
            Featured Leader
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-3 md:mt-4">
            Highlighting trailblazers transforming technology
          </p>
        </div>
        {content}
      </div>
    </div>
  );
}
