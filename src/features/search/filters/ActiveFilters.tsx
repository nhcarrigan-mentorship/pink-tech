import LazyIcon from "../../../components/ui/LazyIcon";

interface ActiveFiltersProps {
  selectedExpertise: string[];
  onRemoveFilter: (expertise: string) => void;
}

export default function ActiveFilters({
  selectedExpertise,
  onRemoveFilter,
}: ActiveFiltersProps) {
  if (selectedExpertise.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-pink-800">Active filters:</span>
      {selectedExpertise.map((exp) => (
        <button
          key={exp}
          onClick={() => onRemoveFilter(exp)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-pink-500 text-pink-700 rounded-full text-xs font-medium hover:bg-pink-50 transition-colors cursor-pointer group"
        >
          <span>{exp}</span>
          <LazyIcon name="X" className="w-3 h-3 group-hover:text-pink-900" />
        </button>
      ))}
    </div>
  );
}
