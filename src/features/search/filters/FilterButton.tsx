import LazyIcon from "../../../shared/ui/display/LazyIcon";

interface FilterButtonProps {
  activeFilterCount: number;
  isOpen: boolean;
  onClick: () => void;
  onClear: () => void;
}

export default function FilterButton({
  activeFilterCount,
  onClick,
  onClear,
}: FilterButtonProps) {
  return (
    <div className="w-full md:w-auto relative">
      <button
        onClick={onClick}
        className={`w-full px-4 py-2.5 border-2 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white flex items-center justify-between transition-all cursor-pointer ${
          activeFilterCount > 0
            ? "border-pink-500 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
            : "border-pink-200 text-gray-700 hover:border-pink-300"
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <LazyIcon name="Filter" className="w-4 h-4" />
          {activeFilterCount > 0
            ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}`
            : "Filter by Expertise"}
        </span>
        {activeFilterCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Clear all filters"
          >
            <LazyIcon name="X" className="w-4 h-4" />
          </button>
        )}
      </button>
    </div>
  );
}
