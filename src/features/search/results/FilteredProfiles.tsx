import EmptyProfiles from "./EmptyProfiles";
import ProfileList from "../components/ProfileList";
import type { UserProfile } from "../../../types/UserProfile";
import { useState, useEffect, useMemo } from "react";
import Pagination from "../../../components/ui/Pagination";

interface FilteredProfilesProps {
  filteredProfiles: UserProfile[];
  onClearFilters: () => void;
  profilesPerPage?: number;
  isFiltered: boolean;
}

const DEFAULT_PROFILES_PER_PAGE = 10;

export default function FilteredProfiles({
  filteredProfiles,
  onClearFilters,
  profilesPerPage = DEFAULT_PROFILES_PER_PAGE,
  isFiltered,
}: FilteredProfilesProps) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProfiles]);

  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const startIndex = (currentPage - 1) * profilesPerPage;
  const endIndex = startIndex + profilesPerPage;
  const paginatedProfiles = useMemo(
    () => filteredProfiles.slice(startIndex, endIndex),
    [filteredProfiles, startIndex, endIndex],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <div className="py-4">
      {filteredProfiles.length === 0 ? (
        <EmptyProfiles
          {...(isFiltered ? { onClearFilters } : {})}
          message={
            isFiltered ? "No profiles match your search." : "No profiles exist."
          }
        />
      ) : (
        <ProfileList filteredProfiles={paginatedProfiles} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
