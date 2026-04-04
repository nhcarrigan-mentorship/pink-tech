import EmptyProfiles from "./EmptyProfiles";
import ProfileList from "../components/ProfileList";
import type { UserProfile } from "../../../shared/types/UserProfile";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Pagination from "../../../shared/ui/display/Pagination";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page") ?? 1));

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

  function handlePageChange(page: number) {
    setSearchParams(
      (prev) => {
        if (page === 1) {
          prev.delete("page");
        } else {
          prev.set("page", String(page));
        }
        return prev;
      },
      { replace: false },
    );
  }

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
        onPageChange={handlePageChange}
      />
    </div>
  );
}
