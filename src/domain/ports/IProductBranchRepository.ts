import { ProductBranch, PaginatedBranchProducts, BranchProductsFilters } from '../entities/ProductBranch';

export interface UpdateStockDTO {
  hasStock: boolean;
  stockQty?: number | null;
}

export interface UpdateStockResponse {
  message: string;
  productId: number;
  branchId: number;
  hasStock: boolean;
  stockQty: number | null;
  deleted: boolean;
}

export interface IProductBranchRepository {
  /**
   * @deprecated Usar getByBranchPaginated para grandes volúmenes
   */
  getByBranch(branchId: number): Promise<ProductBranch[]>;
  
  /**
   * Obtiene productos paginados con filtros para una sucursal.
   * Optimizado para grandes volúmenes (~30.000 productos).
   */
  getByBranchPaginated(branchId: number, filters?: BranchProductsFilters): Promise<PaginatedBranchProducts>;
  
  /**
   * Actualiza el stock de un producto en una sucursal.
   * Si hasStock=false, elimina la relación para mantener la tabla pequeña.
   */
  setStock(productId: number, branchId: number, data: UpdateStockDTO): Promise<UpdateStockResponse>;
}
