import LazyIcon from "../../../shared/ui/LazyIcon";
import SearchInput from "../components/SearchInput";

interface MobileSearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedExpertiseCount: number;
  onFilterClick: () => void;
  onClearFilters: () => void;
  filteredProfilesCount: number;
}

export default function MobileSearchBar({
  searchQuery,
  setSearchQuery,
  selectedExpertiseCount,
  onFilterClick,
  onClearFilters,
  filteredProfilesCount,
}: MobileSearchBarProps) {
  return (
    <div className="md:hidden space-y-3">
      {/* Search Bar */}
      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      {/* Filter Button */}
      <button
        onClick={onFilterClick}
        className={`w-full px-4 py-3.5 border-2 rounded-lg flex items-center justify-between transition-all cursor-pointer shadow-sm ${
          selectedExpertiseCount > 0
            ? "border-pink-500 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
            : "border-pink-200 text-gray-700 hover:border-pink-300 bg-white"
        }`}
      >
        <span className="flex items-center gap-2.5 text-base font-bold">
          <LazyIcon name="Filter" className="w-5 h-5" />
          <span>
            {selectedExpertiseCount > 0
              ? `${selectedExpertiseCount} Expertise Filter${
                  selectedExpertiseCount > 1 ? "s" : ""
                }`
              : "Filter by Expertise"}
          </span>
        </span>
        {selectedExpertiseCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearFilters();
            }}
            className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
            aria-label="Clear expertise filters"
          >
            <LazyIcon name="X" className="w-5 h-5" />
          </button>
        )}
      </button>

      {/* Results Count */}
      <div className="text-sm text-pink-800 font-medium">
        Showing {filteredProfilesCount}{" "}
        {filteredProfilesCount === 1 ? "profile" : "profiles"}
      </div>
    </div>
  );
}
