// Utilidades de error
export { extractErrorMessage, createAppError } from './errorUtils';
export type { AppError } from './errorUtils';

// Hook de estado asíncrono
export { useAsyncState } from './useAsyncState';
export type { AsyncState, UseAsyncStateReturn } from './useAsyncState';

// Hook de paginación
export { usePagination } from './usePagination';
export type { 
  PaginationState, 
  PaginatedData, 
  CacheEntry,
  UsePaginationOptions,
  UsePaginationReturn 
} from './usePagination';

// Hook de operaciones CRUD
export { useCrudOperations } from './useCrudOperations';
export type {
  CrudOperations,
  CrudCallbacks,
  UseCrudOperationsConfig,
  UseCrudOperationsReturn
} from './useCrudOperations';

// Hook de modal para entidades
export { useEntityModal } from './useEntityModal';
export type { EntityModalState, UseEntityModalReturn } from './useEntityModal';

// Hook de diálogo de confirmación
export { useConfirmDialog } from './useConfirmDialog';
export type { ConfirmDialogState, UseConfirmDialogReturn } from './useConfirmDialog';

// Hook de paginación de listas locales
export { useListPagination } from './useListPagination';
export type { UseListPaginationOptions, UseListPaginationReturn } from './useListPagination';
