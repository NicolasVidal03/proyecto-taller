import { Product } from '../domain/entities/Product';
import { IProductRepository, CreateProductDTO, UpdateProductDTO, ProductFilters, PaginatedProducts } from '../domain/ports/IProductRepository';

export class ProductService {
  constructor(private productRepo: IProductRepository) {}

  async getAll(filters?: ProductFilters): Promise<PaginatedProducts> {
    return this.productRepo.getAll(filters);
  }

  async getById(id: number): Promise<Product> {
    return this.productRepo.getById(id);
  }

  async create(data: CreateProductDTO): Promise<Product> {
    return this.productRepo.create(data);
  }

  async update(id: number, data: UpdateProductDTO): Promise<Product> {
    return this.productRepo.update(id, data);
  }

  async updateState(id: number, userId: number): Promise<void> {
    return this.productRepo.updateState(id, userId);
  }

  async delete(id: number): Promise<void> {
    return this.productRepo.delete(id);
  }
}
