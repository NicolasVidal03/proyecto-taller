import React, { useMemo } from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
  className = '',
}) => {
  
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

 
  if (totalItems === 0) {
    return null;
  }

  const buttonBase = 'inline-flex items-center justify-center min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
  const buttonInactive = 'text-lead-600 bg-white border border-lead-200 hover:bg-lead-50 hover:border-lead-300';
  const buttonActive = 'text-white bg-brand-600 border border-brand-600 shadow-md';

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      <p className="text-sm text-lead-500">
        Mostrando <span className="font-semibold text-lead-700">{startItem.toLocaleString()}</span> a{' '}
        <span className="font-semibold text-lead-700">{endItem.toLocaleString()}</span> de{' '}
        <span className="font-semibold text-lead-700">{totalItems.toLocaleString()}</span> resultados
      </p>

      <nav className="flex items-center gap-1" aria-label="Paginación">
       
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || isLoading}
          className={`${buttonBase} ${buttonInactive}`}
          aria-label="Primera página"
          title="Primera página"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

      
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className={`${buttonBase} ${buttonInactive}`}
          aria-label="Página anterior"
          title="Página anterior"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers[0] > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                disabled={isLoading}
                className={`${buttonBase} ${buttonInactive}`}
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="px-2 text-lead-400">...</span>
              )}
            </>
          )}

          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`${buttonBase} ${pageNum === currentPage ? buttonActive : buttonInactive}`}
              aria-current={pageNum === currentPage ? 'page' : undefined}
            >
              {pageNum}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-2 text-lead-400">...</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                disabled={isLoading}
                className={`${buttonBase} ${buttonInactive}`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

    
        <span className="sm:hidden px-3 text-sm text-lead-600">
          {currentPage} / {totalPages}
        </span>

      
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className={`${buttonBase} ${buttonInactive}`}
          aria-label="Página siguiente"
          title="Página siguiente"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

       
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || isLoading}
          className={`${buttonBase} ${buttonInactive}`}
          aria-label="Última página"
          title="Última página"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
