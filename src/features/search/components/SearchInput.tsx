import LazyIcon from "../../../shared/ui/display/LazyIcon";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
  const placeholder = "Search by name, expertise, company...";
  return (
    <div className="w-full relative">
      <div className="relative">
        <LazyIcon
          name="Search"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5 md:w-5 md:h-5 pointer-events-none"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 md:py-3 text-base border-2 border-pink-200 rounded-lg outline-pink-500 focus:border-pink-500 bg-white transition-all placeholder:text-gray-400"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors p-1 rounded-full hover:bg-pink-50 cursor-pointer"
            aria-label="Clear search"
          >
            <LazyIcon name="X" className="w-5 h-5" />
          </button>
        )}
      </div>
      <p className="text-xs text-gray-600 mt-2">
        Try "India", "Software Engineer", or "Machine Learning"
      </p>
    </div>
  );
}
