import { ProductBranch, PaginatedBranchProducts, BranchProductsFilters } from '../../../domain/entities/ProductBranch';
import { IProductBranchRepository, UpdateStockDTO, UpdateStockResponse } from '../../../domain/ports/IProductBranchRepository';
import { http } from '../httpClient';

export class HttpProductBranchRepository implements IProductBranchRepository {
  /**
   * @deprecated Usar getByBranchPaginated para grandes volúmenes
   */
  async getByBranch(branchId: number): Promise<ProductBranch[]> {
    // Ahora el endpoint devuelve paginado, convertimos para compatibilidad
    const response = await http.get<PaginatedBranchProducts>(`/branches/${branchId}/products?limit=100`);
    return response.data.data.map(item => ({
      productId: item.id,
      branchId: item.branch.branchId,
      hasStock: item.branch.hasStock,
      stockQty: item.branch.stockQty,
      productName: item.name,
      productBarcode: item.barcode,
      productSalePrice: item.salePrice,
    }));
  }

  /**
   * Obtiene productos paginados con filtros para una sucursal.
   * Optimizado para grandes volúmenes (~30.000 productos).
   */
  async getByBranchPaginated(branchId: number, filters?: BranchProductsFilters): Promise<PaginatedBranchProducts> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.onlyAvailable !== undefined) params.append('onlyAvailable', String(filters.onlyAvailable));
    if (filters?.categoryId) params.append('categoryId', String(filters.categoryId));
    if (filters?.brandId) params.append('brandId', String(filters.brandId));
    
    const queryString = params.toString();
    const url = queryString ? `/branches/${branchId}/products?${queryString}` : `/branches/${branchId}/products`;
    
    const response = await http.get<PaginatedBranchProducts>(url);
    return response.data;
  }

  async setStock(productId: number, branchId: number, data: UpdateStockDTO): Promise<UpdateStockResponse> {
    const response = await http.put<UpdateStockResponse>(
      `/products/${productId}/branches/${branchId}/stock`,
      {
        has_stock: data.hasStock,
        stock_qty: data.stockQty,
      }
    );
    return response.data;
  }
}
