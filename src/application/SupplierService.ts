import { Supplier } from '../domain/entities/Supplier';
import { ISupplierRepository, CreateSupplierDTO, UpdateSupplierDTO } from '../domain/ports/ISupplierRepository';

export class SupplierService {
  constructor(private supplierRepo: ISupplierRepository) {}

  async getAll(): Promise<Supplier[]> {
    return this.supplierRepo.getAll();
  }

  async getById(id: number): Promise<Supplier> {
    return this.supplierRepo.getById(id);
  }

  async create(data: CreateSupplierDTO): Promise<Supplier> {
    return this.supplierRepo.create(data);
  }

  async update(id: number, data: UpdateSupplierDTO): Promise<Supplier> {
    return this.supplierRepo.update(id, data);
  }

  async updateState(id: number, state: boolean, userId?: number): Promise<Supplier> {
    return this.supplierRepo.update(id, { state } as any);
  }

  async delete(id: number): Promise<void> {
    return this.supplierRepo.delete(id);
  }
}
