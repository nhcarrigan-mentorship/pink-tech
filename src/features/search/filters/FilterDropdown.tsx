import LazyIcon from "../../../components/ui/LazyIcon";

interface FilterDropdownProps {
  isOpen: boolean;
  allExpertise: string[];
  selectedExpertise: string[];
  onToggleExpertise: (expertise: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  filteredProfilesCount?: number;
}

export default function FilterDropdown({
  isOpen,
  allExpertise,
  selectedExpertise,
  onToggleExpertise,
  onClearAll,
  onClose,
  filteredProfilesCount,
}: FilterDropdownProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 md:left-auto md:w-96 mt-2 bg-white border-2 border-pink-200 rounded-lg shadow-xl z-20 max-h-[70vh] md:max-h-96 overflow-hidden flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LazyIcon name="Filter" className="w-4 h-4 text-pink-600" />
            <h3 className="text-base font-bold text-gray-900">
              Expertise Areas
            </h3>
          </div>
          {selectedExpertise.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-bold">
                {selectedExpertise.length}
              </span>
              <button
                onClick={onClearAll}
                className="text-xs text-pink-600 hover:text-pink-700 font-medium cursor-pointer underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Checkbox List */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-3 md:p-4 space-y-1.5">
          {allExpertise.map((exp) => {
            const isSelected = selectedExpertise.includes(exp);
            return (
              <label
                key={exp}
                className={`flex items-center gap-3 p-3 md:p-2.5 rounded-lg cursor-pointer transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-400 shadow-sm"
                    : "hover:bg-pink-50 border-2 border-transparent"
                }`}
              >
                {/* Custom Checkbox */}
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleExpertise(exp)}
                    className="w-5 h-5 md:w-4 md:h-4 text-pink-600 border-2 border-pink-300 outline-pink-500 cursor-pointer transition-all"
                  />
                </div>
                {/* Label Text */}
                <span
                  className={`text-base md:text-sm flex-1 leading-tight transition-colors ${
                    isSelected
                      ? "text-pink-800 font-semibold"
                      : "text-gray-700 font-medium"
                  }`}
                >
                  {exp}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Footer - Fixed with Apply Button */}
      <div className="flex-shrink-0 border-t-2 border-pink-200 p-3 md:p-3 bg-gradient-to-br from-pink-50 to-rose-50">
        <button
          onClick={onClose}
          className="w-full px-4 py-3.5 md:py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all cursor-pointer text-base md:text-sm shadow-lg active:scale-[0.98]"
        >
          {selectedExpertise.length > 0 && filteredProfilesCount !== undefined
            ? `Show ${filteredProfilesCount} Result${filteredProfilesCount !== 1 ? "s" : ""}`
            : "Apply Filters"}
        </button>
      </div>
    </div>
  );
}
