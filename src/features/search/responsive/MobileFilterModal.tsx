import { useEffect, useRef, useState } from "react";
// Custom event to hide/show mobile nav
import LazyIcon from "../../../shared/ui/display/LazyIcon";

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  allExpertise: string[];
  selectedExpertise: string[];
  toggleExpertise: (expertise: string) => void;
  clearAllFilters: () => void;
  filteredProfilesCount: number;
}

export default function MobileFilterModal({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  allExpertise,
  selectedExpertise,
  toggleExpertise,
  clearAllFilters,
  filteredProfilesCount,
}: MobileFilterModalProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showAllExpertise, setShowAllExpertise] = useState(false);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Hide mobile nav when modal is open
  useEffect(() => {
    const nav = document.querySelector(".mobile-nav-hide-on-modal");
    if (isOpen && nav) {
      (nav as HTMLElement).style.display = "none";
    } else if (nav) {
      (nav as HTMLElement).style.display = "";
    }
    return () => {
      if (nav) (nav as HTMLElement).style.display = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[100] flex items-end pt-0 pb-0 bg-white">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div className="relative w-full h-full bg-white rounded-none shadow-none flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 rounded-t-3xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <LazyIcon name="Filter" className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Filter & Search
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-pink-100 rounded-full transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close filters"
            >
              <LazyIcon name="X" className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Refine your search to find the perfect leader profile
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-6 py-6 space-y-6">
            {/* Search Section */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Search Leaders
              </label>
              <div className="relative">
                <LazyIcon
                  name="Search"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5 pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Name, role, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 text-base border-2 border-pink-200 rounded-xl outline-pink-500 focus:border-pink-500 bg-white transition-all placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors p-1 rounded-full hover:bg-pink-50 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <LazyIcon name="X" className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-pink-200" />

            {/* Expertise Filter Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-gray-900">
                  Filter by Expertise
                </label>
                {selectedExpertise.length > 0 && (
                  <button
                    onClick={() => clearAllFilters()}
                    className="text-xs text-pink-600 hover:text-pink-700 font-medium cursor-pointer underline"
                  >
                    Clear ({selectedExpertise.length})
                  </button>
                )}
              </div>

              {/* Expertise Chips - With See More/Less Toggle */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {(showAllExpertise
                    ? allExpertise
                    : allExpertise.slice(0, 10)
                  ).map((exp) => {
                    const isSelected = selectedExpertise.includes(exp);
                    return (
                      <button
                        key={exp}
                        onClick={() => toggleExpertise(exp)}
                        className={`px-3 py-2 rounded-full font-medium text-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                          isSelected
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-2 border-pink-500 shadow-md"
                            : "bg-white text-gray-700 border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50"
                        }`}
                      >
                        {exp}
                      </button>
                    );
                  })}
                </div>

                {/* See More/Less Button */}
                {allExpertise.length > 10 && (
                  <button
                    onClick={() => setShowAllExpertise(!showAllExpertise)}
                    className="w-full py-3 bg-white border-2 border-pink-200 text-pink-600 rounded-xl hover:bg-pink-50 hover:border-pink-400 transition-all cursor-pointer flex items-center justify-center gap-2 font-semibold text-sm"
                  >
                    {showAllExpertise ? (
                      <>
                        <span>See less</span>
                        <LazyIcon name="ChevronUp" className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>See more ({allExpertise.length - 10} more)</span>
                        <LazyIcon name="ChevronDown" className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-t-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 space-y-3">
          {/* Results Summary */}
          <div className="flex items-center justify-between p-3 bg-white border-2 border-pink-200 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Results</span>
            </div>
            <span className="text-2xl font-bold text-pink-600">
              {filteredProfilesCount}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={clearAllFilters}
              className="px-4 py-3.5 bg-white border-2 border-pink-300 text-pink-700 font-bold rounded-xl hover:bg-pink-50 transition-all cursor-pointer active:scale-[0.98]"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all cursor-pointer shadow-lg active:scale-[0.98]"
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
