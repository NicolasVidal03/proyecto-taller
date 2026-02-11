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

  getByBranch(branchId: number): Promise<ProductBranch[]>;
  getByBranchPaginated(branchId: number, filters?: BranchProductsFilters): Promise<PaginatedBranchProducts>;
  setStock(productId: number, branchId: number, data: UpdateStockDTO): Promise<UpdateStockResponse>;
}
