export interface ProductPriceInfo {
  priceTypeId: number;
  priceTypeName?: string;
  price: number;
}

export interface ProductBranch {
  productId: number;
  branchId: number;
  hasStock: boolean;
  stockQty: number | null;
  updatedAt?: string;
  
  productName?: string;
  productBarcode?: string | null;
  productPrices?: ProductPriceInfo[];
}


export interface ProductWithBranchInfo {
  id: number;
  name: string;
  barcode: string | null;
  internalCode: string | null;
  presentationId: number | null;
  colorId: number | null;
  prices: ProductPriceInfo[];
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


export interface PaginatedBranchProducts {
  data: ProductWithBranchInfo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}


export interface BranchProductsFilters {
  search?: string;
  page?: number;
  limit?: number;
  onlyAvailable?: boolean;
  categoryId?: number;
  brandId?: number;
}
