import { useState, useMemo, useEffect } from 'react';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

// Client-side pagination hook. Slices a full items array by page/pageSize.
// For server-side pagination, ignore `paginatedItems` and instead pass
// `currentPage`/`pageSize` straight into your API call params.
export function usePagination(items = [], initialPageSize = DEFAULT_PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp current page if the underlying item set shrinks (e.g. after filtering).
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }

  function changePageSize(size) {
    setPageSize(size);
    setCurrentPage(1);
  }

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    goToPage,
    changePageSize,
  };
}
