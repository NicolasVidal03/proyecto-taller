import { IProductBranchRepository, UpdateStockDTO, UpdateStockResponse } from '../domain/ports/IProductBranchRepository';
import { ProductBranch, PaginatedBranchProducts, BranchProductsFilters } from '../domain/entities/ProductBranch';

export class ProductBranchService {
  constructor(private readonly repository: IProductBranchRepository) {}

  async getByBranchPaginated(branchId: number, filters?: BranchProductsFilters): Promise<PaginatedBranchProducts> {
    return this.repository.getByBranchPaginated(branchId, filters);
  }

  async setStock(productId: number, branchId: number, data: UpdateStockDTO): Promise<UpdateStockResponse> {
    return this.repository.setStock(productId, branchId, data);
  }
}
