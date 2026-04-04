import { Search, Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProfiles from "../../../shared/hooks/useProfiles";

const MAX_QUICK_SEARCHES = 5;

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { profiles } = useProfiles();

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
    <div className="py-6 md:py-12 bg-gradient-to-b from-white to-gray-50 border border-pink-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leaders..."
              className="w-full pl-10 md:pl-12 pr-20 md:pr-24 py-3 md:py-4 text-sm md:text-lg border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 px-3 md:px-6 py-1.5 md:py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-md hover:from-pink-600 hover:to-rose-600 transition-all text-sm md:text-base cursor-pointer"
          >
            Search
          </button>
        </form>
        <p className="text-xs text-gray-600 mt-2">
          Try "India", "Software Engineer", or "Machine Learning"
        </p>

        {/* Quick Search Pills */}
        <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" />
            Popular:
          </span>
          {quickSearches.map((search) => (
            <button
              key={search.label}
              onClick={() => handleQuickSearch(search.query)}
              className="px-3 py-1.5 md:py-1.5 bg-white border border-pink-200 text-pink-700 text-xs md:text-sm rounded-full hover:bg-pink-50 hover:border-pink-300 transition-all cursor-pointer active:scale-95"
            >
              {search.label}
            </button>
          ))}
        </div>

        {/* Advanced Search Link */}
        <div className="mt-3 md:mt-4 text-center">
          <button
            onClick={() => navigate("/search")}
            className="text-xs md:text-sm text-gray-600 hover:text-pink-600 transition-colors cursor-pointer underline"
          >
            Advanced search with filters
          </button>
        </div>
      </div>
    </div>
  );
}
