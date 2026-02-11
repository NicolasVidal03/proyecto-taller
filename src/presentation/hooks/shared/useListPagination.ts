import { useState, useMemo, useEffect } from 'react';

export interface UseListPaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

export interface UseListPaginationReturn<T> {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  paginatedItems: T[];
  totalItems: number;
  resetToFirstPage: () => void;
}

export function useListPagination<T>(
  items: T[],
  options: UseListPaginationOptions = {}
): UseListPaginationReturn<T> {
  const { pageSize = 10, initialPage = 1 } = options;
  const [page, setPage] = useState(initialPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);


  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const resetToFirstPage = () => setPage(1);

  return {
    page,
    setPage,
    totalPages,
    paginatedItems,
    totalItems,
    resetToFirstPage,
  };
}
