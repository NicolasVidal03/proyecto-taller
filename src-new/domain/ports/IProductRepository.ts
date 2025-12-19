import { Product } from '../entities/Product';

export interface CreateProductDTO {
  name: string;
  categoryId: number;
  barcode?: string | null;
  internalCode?: string | null;
  presentation?: string | null;
  color?: string | null;
  urlImage?: string | null;
  salePrices?: any | null;
  referenceBuyPrice?: number | null;
}

export interface UpdateProductDTO {
  name?: string;
  categoryId?: number;
  barcode?: string | null;
  internalCode?: string | null;
  presentation?: string | null;
  color?: string | null;
  urlImage?: string | null;
  salePrices?: any | null;
  referenceBuyPrice?: number | null;
}

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: number): Promise<Product>;
  create(data: CreateProductDTO): Promise<Product>;
  update(id: number, data: UpdateProductDTO): Promise<Product>;
  delete(id: number): Promise<void>;
}
