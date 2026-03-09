import { Search, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useProfilesContext } from "../../../hooks/useProfilesContext";

const MAX_QUICK_SEARCHES = 5;

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { profiles } = useProfilesContext();

  const quickSearches = useMemo(() => {
    const counts = new Map<string, number>();
    profiles.forEach((profile) => {
      profile.expertise?.forEach((exp) => {
        counts.set(exp, (counts.get(exp) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_QUICK_SEARCHES)
      .map(([label]) => ({ label, query: label }));
  }, [profiles]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/search");
    }
  };

  const handleQuickSearch = (searchQuery: string) => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, expertise, company, or role..."
              className="w-full pl-12 pr-4 py-4 text-base md:text-lg border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-md hover:from-pink-600 hover:to-rose-600 transition-all text-sm md:text-base cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Quick Search Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Popular:
          </span>
          {quickSearches.map((search) => (
            <button
              key={search.label}
              onClick={() => handleQuickSearch(search.query)}
              className="px-3 py-1.5 bg-white border border-pink-200 text-pink-700 text-sm rounded-full hover:bg-pink-50 hover:border-pink-300 transition-all cursor-pointer"
            >
              {search.label}
            </button>
          ))}
        </div>

        {/* Advanced Search Link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/search")}
            className="text-sm text-gray-600 hover:text-pink-600 transition-colors cursor-pointer underline"
          >
            Advanced search with filters
          </button>
        </div>
      </div>
    </div>
  );
}
