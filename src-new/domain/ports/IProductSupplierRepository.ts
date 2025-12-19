import { ProductSupplier } from '../entities/ProductSupplier';

export interface CreateProductSupplierDTO {
  productId: number;
  supplierId: number;
  agreedBuyPrice: number;
}

export interface UpdateProductSupplierDTO {
  productId?: number;
  supplierId?: number;
  agreedBuyPrice?: number;
}

export interface IProductSupplierRepository {
  getAll(): Promise<ProductSupplier[]>;
  getById(id: number): Promise<ProductSupplier>;
  create(data: CreateProductSupplierDTO): Promise<ProductSupplier>;
  update(id: number, data: UpdateProductSupplierDTO): Promise<ProductSupplier>;
  delete(id: number): Promise<void>;
}
