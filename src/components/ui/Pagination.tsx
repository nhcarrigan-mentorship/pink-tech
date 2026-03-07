interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex items-center justify-center gap-1 md:gap-2 mt-4 ${className}`}
    >
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg font-medium text-sm transition-all cursor-pointer ${
            index + 1 === currentPage
              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
              : "bg-white border border-pink-200 text-pink-600 hover:bg-pink-50"
          }`}
          aria-label={`Go to page ${index + 1}`}
          aria-current={index + 1 === currentPage ? "page" : undefined}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
