import { useState, useCallback } from 'react';
import { ProductWithBranchInfo, PaginatedBranchProducts, BranchProductsFilters } from '../../domain/entities/ProductBranch';
import { UpdateStockDTO, UpdateStockResponse } from '../../domain/ports/IProductBranchRepository';
import { container } from '../../infrastructure/config/container';

export interface UseInventoryReturn {
  inventory: ProductWithBranchInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  fetchInventory: (branchId: number, filters?: BranchProductsFilters) => Promise<void>;
  setStock: (productId: number, branchId: number, data: UpdateStockDTO) => Promise<UpdateStockResponse | null>;
  clearError: () => void;
}

export const useInventory = (): UseInventoryReturn => {
  const [inventory, setInventory] = useState<ProductWithBranchInfo[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async (branchId: number, filters?: BranchProductsFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await container.productBranches.getByBranchPaginated(branchId, filters);
      setInventory(result.data);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      setError(err?.message || 'Error al cargar inventario');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setStock = useCallback(async (
    productId: number,
    branchId: number,
    data: UpdateStockDTO
  ): Promise<UpdateStockResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await container.productBranches.setStock(productId, branchId, data);
      
      // Actualizar el item en la lista local
      setInventory(prev => prev.map(item => {
        if (item.id === productId) {
          return {
            ...item,
            branch: {
              ...item.branch,
              hasStock: result.hasStock,
              stockQty: result.stockQty,
            }
          };
        }
        return item;
      }));
      
      return result;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar stock');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    inventory,
    pagination,
    isLoading,
    error,
    fetchInventory,
    setStock,
    clearError,
  };
};
