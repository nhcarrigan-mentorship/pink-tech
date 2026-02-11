import { useState, useEffect } from "react";
import LazyIcon from "../ui/LazyIcon";

export default function ScrollToTopButton() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 right-6 md:bottom-10 md:right-10 z-40 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3.5 md:p-4 rounded-full shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-rose-600 transition-all cursor-pointer hover:scale-110 active:scale-95 animate-fade-in"
      aria-label="Scroll to top"
    >
      <LazyIcon name="ArrowUp" className="w-5 h-5 md:w-6 md:h-6" />
    </button>
  );
}
