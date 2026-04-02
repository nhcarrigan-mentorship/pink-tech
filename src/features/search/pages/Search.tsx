import { useMemo, useState, useRef } from "react";
import CallToAction from "../../../components/layout/CallToAction";

import SearchHeader from "../components/SearchHeader";
import FilteredProfiles from "../results/FilteredProfiles";
import ProfileSearchBar from "../components/ProfileSearchBar";
import MobileFilterModal from "../responsive/MobileFilterModal";
import { useProfilesContext } from "../../../hooks/useProfilesContext";
import LoadingState from "../../../components/ui/LoadingState";

import ErrorState from "../../../components/ui/ErrorState";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../../../contexts/AuthContext";

export default function Search() {
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const selectedExpertise = searchParams.getAll("expertise");
  const { profiles, loading, error, refetch } = useProfilesContext();
  const { isAuthenticated } = useAuth();

  function handleSearch(value: string) {
    setSearchParams(
      (prev) => {
        if (value) prev.set("q", value);
        else prev.delete("q");
        return prev;
      },
      { replace: true },
    );
  }

  // Update the URL's search params when user picks or removes expertise filters
  function handleSetSelectedExpertise(expertise: string[]) {
    setSearchParams(
      (prev) => {
        prev.delete("expertise");
        expertise.forEach((exp) => {
          prev.append("expertise", exp);
        });
        prev.delete("page");
        return prev;
      },
      { replace: true },
    );
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
            (profile?.location &&
              profile?.location.toLowerCase().includes(search.toLowerCase())) ||
            (profile?.expertise &&
              profile?.expertise.some((exp) =>
                exp.toLowerCase().includes(search.toLowerCase()),
              ))
          : true;

      // Check expertise that match selected expertise
      const matchesExpertise =
        selectedExpertise.length === 0 ||
        (selectedExpertise &&
          profile?.expertise?.some((exp) =>
            selectedExpertise.some(
              (sel) => sel.toLowerCase() === exp.toLowerCase(),
            ),
          ));

      return matchesSearch && matchesExpertise;
    });
  }, [search, selectedExpertise, profiles]);

  // Add/removes expertise filter
  const toggleExpertise = (expertise: string) => {
    const next = selectedExpertise.includes(expertise)
      ? selectedExpertise.filter((e) => e !== expertise)
      : [...selectedExpertise, expertise];
    handleSetSelectedExpertise(next);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchParams((prev) => {
      prev.delete("page");
      prev.delete("q");
      prev.delete("expertise");
      return prev;
    });
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

      {!isAuthenticated && (
        <div ref={ctaRef}>
          <CallToAction />
        </div>
      )}

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
