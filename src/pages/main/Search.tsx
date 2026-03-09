import { useMemo, useState, useRef } from "react";
import CallToAction from "../../components/layout/CallToAction";
import SearchHeader from "../../features/search/components/SearchHeader";
import FilteredProfiles from "../../features/search/results/FilteredProfiles";
import ProfileSearchBar from "../../features/search/components/ProfileSearchBar";
import MobileFilterModal from "../../features/search/responsive/MobileFilterModal";
import { useProfilesContext } from "../../hooks/useProfilesContext";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { useSearchParams } from "react-router-dom";

export default function Search() {
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";

  const { profiles, loading, error, refetch } = useProfilesContext();

  function resetPage() {
    setSearchParams(
      (prev) => {
        prev.delete("page");
        return prev;
      },
      { replace: true },
    );
  }

  function handleSearch(value: string) {
    setSearchParams(
      (prev) => {
        if (value) prev.set("q", value);
        else prev.delete("q");
        return prev;
      },
      { replace: true },
    );
    resetPage();
  }

  function handleSetSelectedExpertise(
    value: string[] | ((prev: string[]) => string[]),
  ) {
    setSelectedExpertise(value);
    resetPage();
  }

  // Get all unique expertise areas
  const allExpertise = useMemo(() => {
    const expertiseSet = new Set<string>();
    profiles.forEach(
      (profile) =>
        profile?.expertise &&
        profile.expertise.forEach((expertise) => {
          expertiseSet.add(expertise);
        }),
    );
    return Array.from(expertiseSet).sort();
  }, [profiles]);

  // Filter profiles based on search and expertise
  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const matchesSearch =
        search != null
          ? profile?.displayName.toLowerCase().includes(search.toLowerCase()) ||
            (profile?.role &&
              profile?.role.toLowerCase().includes(search.toLowerCase())) ||
            (profile?.company &&
              profile?.company.toLowerCase().includes(search.toLowerCase())) ||
            (profile?.bio &&
              profile?.bio.toLowerCase().includes(search.toLowerCase()))
          : true;

      const matchesExpertise =
        selectedExpertise.length === 0 ||
        (profile?.expertise &&
          profile?.expertise.some((exp) => selectedExpertise.includes(exp)));

      return matchesSearch && matchesExpertise;
    });
  }, [search, selectedExpertise, profiles]);

  // Toggle expertise filter
  const toggleExpertise = (expertise: string) => {
    handleSetSelectedExpertise((prev) =>
      prev.includes(expertise)
        ? prev.filter((e) => e !== expertise)
        : [...prev, expertise],
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchParams("");
    setSelectedExpertise([]);
    resetPage();
  };

  let content;

  if (error) {
    content = (
      <ErrorState
        heading="Unable to Load Profiles"
        message="An error occurred while loading profiles. Please try again later."
        onRetry={refetch}
      />
    );
  } else if (loading) {
    content = <LoadingState message="Loading profiles..." />;
  } else {
    content = (
      <FilteredProfiles
        filteredProfiles={filteredProfiles}
        onClearFilters={clearAllFilters}
        isFiltered={search != "" || selectedExpertise.length > 0}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SearchHeader />

      <ProfileSearchBar
        search={search ?? ""}
        onSearch={handleSearch}
        allExpertise={allExpertise}
        selectedExpertise={selectedExpertise}
        setSelectedExpertise={handleSetSelectedExpertise}
        filteredProfiles={filteredProfiles}
        onOpenMobileFilter={() => setShowMobileFilter(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {content}
      </div>

      <div ref={ctaRef}>
        <CallToAction />
      </div>

      <MobileFilterModal
        isOpen={showMobileFilter}
        onClose={() => setShowMobileFilter(false)}
        searchQuery={search ?? ""}
        setSearchQuery={handleSearch}
        allExpertise={allExpertise}
        selectedExpertise={selectedExpertise}
        toggleExpertise={toggleExpertise}
        clearAllFilters={clearAllFilters}
        filteredProfilesCount={filteredProfiles.length}
      />
    </div>
  );
}
