import { Product, SalePrice } from '../entities/Product';

export interface CreateProductDTO {
  name: string;
  categoryId: number;
  brandId: number;
  userId: number;
  barcode?: string | null;
  internalCode?: string | null;
  presentationId?: number | null;
  colorId?: number | null;
  imageFile?: File;
  salePrice: SalePrice;
}

export interface UpdateProductDTO {
  name?: string;
  categoryId?: number;
  brandId?: number;
  barcode?: string | null;
  internalCode?: string | null;
  presentationId?: number | null;
  colorId?: number | null;
  imageFile?: File;
  salePrice?: SalePrice;
  user_id?: number;
}

export interface ProductFilters {
  categoryId?: number;
  brandId?: number;
  state?: boolean;
  search?: string;  // Búsqueda por nombre, barcode o código interno
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository {
  getAll(filters?: ProductFilters): Promise<PaginatedProducts>;
  getById(id: number): Promise<Product>;
  create(data: CreateProductDTO): Promise<Product>;
  update(id: number, data: UpdateProductDTO): Promise<Product>;
  updateState(id: number, userId: number): Promise<void>;
  delete(id: number): Promise<void>;
}
