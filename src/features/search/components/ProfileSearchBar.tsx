import { useState } from "react";
import ActiveFilters from "../filters/ActiveFilters";
import DesktopSearchBar from "../responsive/DesktopSearchBar";
import MobileSearchBar from "../responsive/MobileSearchBar";

interface ProfileSearchBarProps {
  search: string;
  onSearch: (value: string) => void;
  allExpertise: string[];
  selectedExpertise: string[];
  setSelectedExpertise: (expertise: string[]) => void;
  filteredProfiles: any[];
  onOpenMobileFilter: () => void;
}

export default function ProfileSearchBar({
  search,
  onSearch,
  allExpertise,
  selectedExpertise,
  setSelectedExpertise,
  filteredProfiles,
  onOpenMobileFilter,
}: ProfileSearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleExpertise = (expertise: string) => {
    setSelectedExpertise(
      selectedExpertise.includes(expertise)
        ? selectedExpertise.filter((e) => e !== expertise)
        : [...selectedExpertise, expertise],
    );
  };

  const clearAllFilters = () => {
    onSearch("");
    setSelectedExpertise([]);
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 sticky top-14 md:top-16 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Mobile Search Bar */}
        <MobileSearchBar
          searchQuery={search}
          setSearchQuery={onSearch}
          selectedExpertiseCount={selectedExpertise.length}
          onFilterClick={onOpenMobileFilter}
          onClearFilters={clearAllFilters}
          filteredProfilesCount={filteredProfiles.length}
        />

        {/* Desktop Search Bar */}
        <DesktopSearchBar
          searchQuery={search}
          setSearchQuery={onSearch}
          allExpertise={allExpertise}
          selectedExpertise={selectedExpertise}
          toggleExpertise={toggleExpertise}
          clearAllFilters={clearAllFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filteredProfilesCount={filteredProfiles.length}
        />

        {/* Active Filters Display - Mobile Only */}
        {selectedExpertise.length > 0 && (
          <div className="md:hidden mt-4">
            <ActiveFilters
              selectedExpertise={selectedExpertise}
              onRemoveFilter={toggleExpertise}
            />
          </div>
        )}
      </div>
    </div>
  );
}
