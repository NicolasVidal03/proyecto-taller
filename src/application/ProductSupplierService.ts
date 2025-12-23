import { ProductSupplier } from '../domain/entities/ProductSupplier';
import { IProductSupplierRepository, CreateProductSupplierDTO, UpdateProductSupplierDTO } from '../domain/ports/IProductSupplierRepository';

export class ProductSupplierService {
  constructor(private psRepo: IProductSupplierRepository) {}

  async getAll(): Promise<ProductSupplier[]> {
    return this.psRepo.getAll();
  }

  async getById(id: number): Promise<ProductSupplier> {
    return this.psRepo.getById(id);
  }

  async create(data: CreateProductSupplierDTO): Promise<ProductSupplier> {
    return this.psRepo.create(data);
  }

  async update(id: number, data: UpdateProductSupplierDTO): Promise<ProductSupplier> {
    return this.psRepo.update(id, data);
  }

  async updateState(id: number, state: boolean): Promise<ProductSupplier> {
    return this.psRepo.update(id, { state } as any);
  }

  async delete(id: number): Promise<void> {
    return this.psRepo.delete(id);
  }
}
