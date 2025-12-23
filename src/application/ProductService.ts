import { Product } from '../domain/entities/Product';
import { IProductRepository, CreateProductDTO, UpdateProductDTO } from '../domain/ports/IProductRepository';

export class ProductService {
  constructor(private productRepo: IProductRepository) {}

  async getAll(): Promise<Product[]> {
    return this.productRepo.getAll();
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

  async updateState(id: number, state: boolean): Promise<Product> {
    return this.productRepo.update(id, { state } as any);
  }

  async delete(id: number): Promise<void> {
    return this.productRepo.delete(id);
  }
}
