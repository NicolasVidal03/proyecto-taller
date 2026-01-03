export interface ProductBranch {
  productId: number;
  branchId: number;
  hasStock: boolean;
  stockQty: number | null;
  updatedAt?: string;
  
  // Datos del producto para lectura
  productName?: string;
  productBarcode?: string | null;
  productSalePrice?: Record<string, number>;
}

/**
 * Producto con información de sucursal (respuesta del endpoint paginado)
 */
export interface ProductWithBranchInfo {
  id: number;
  name: string;
  barcode: string | null;
  internalCode: string | null;
  presentationId: number | null;
  colorId: number | null;
  salePrice: Record<string, number>;
  brand: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  branch: {
    branchId: number;
    hasStock: boolean;
    stockQty: number | null;
  };
}

/**
 * Respuesta paginada de productos por sucursal
 */
export interface PaginatedBranchProducts {
  data: ProductWithBranchInfo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Filtros para consulta de productos por sucursal
 */
export interface BranchProductsFilters {
  search?: string;
  page?: number;
  limit?: number;
  onlyAvailable?: boolean;
  categoryId?: number;
  brandId?: number;
}
