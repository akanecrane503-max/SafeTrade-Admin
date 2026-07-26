import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) {
  if (totalPages <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  function getPageNumbers() {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return pages;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-3">
      <p className="text-sm text-slate-500 order-2 sm:order-1">
        Showing <span className="text-slate-300 font-medium">{startItem}</span>–
        <span className="text-slate-300 font-medium">{endItem}</span> of{' '}
        <span className="text-slate-300 font-medium">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-600 text-sm">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
