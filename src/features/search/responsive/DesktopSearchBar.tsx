import { useEffect, useRef } from "react";
import ProfilesCount from "../components/ProfilesCount";
import SearchInput from "../components/SearchInput";
import ActiveFilters from "../filters/ActiveFilters";
import FilterButton from "../filters/FilterButton";
import FilterDropdown from "../filters/FilterDropdown";

interface DesktopSearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  allExpertise: string[];
  selectedExpertise: string[];
  toggleExpertise: (expertise: string) => void;
  clearAllFilters: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filteredProfilesCount: number;
}

export default function DesktopSearchBar({
  searchQuery,
  setSearchQuery,
  allExpertise,
  selectedExpertise,
  toggleExpertise,
  clearAllFilters,
  showFilters,
  setShowFilters,
  filteredProfilesCount,
}: DesktopSearchBarProps) {
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters, setShowFilters]);

  return (
    <div className="hidden md:flex flex-col gap-3 md:gap-4">
      {/* Search Bar */}
      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      {/* Filter Toggle Button */}
      <div className="w-full md:w-auto relative" ref={filterRef}>
        <FilterButton
          activeFilterCount={selectedExpertise.length}
          isOpen={showFilters}
          onClick={() => setShowFilters(!showFilters)}
          onClear={clearAllFilters}
        />

        {/* Filter Dropdown Panel */}
        <FilterDropdown
          isOpen={showFilters}
          allExpertise={allExpertise}
          selectedExpertise={selectedExpertise}
          onToggleExpertise={toggleExpertise}
          onClearAll={clearAllFilters}
          onClose={() => setShowFilters(false)}
          filteredProfilesCount={filteredProfilesCount}
        />
      </div>

      {/* Active Filters Display */}
      <ActiveFilters
        selectedExpertise={selectedExpertise}
        onRemoveFilter={toggleExpertise}
      />

      {/* Results Count */}
      <ProfilesCount count={filteredProfilesCount} />
    </div>
  );
}
