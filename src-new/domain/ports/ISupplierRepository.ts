import { Supplier } from '../entities/Supplier';

export interface CreateSupplierDTO {
  nit: string;
  name: string;
  phone?: string | null;
  country?: string | null;
  address?: string | null;
  contactName?: string | null;
}

export interface UpdateSupplierDTO {
  nit?: string;
  name?: string;
  phone?: string | null;
  country?: string | null;
  address?: string | null;
  contactName?: string | null;
}

export interface ISupplierRepository {
  getAll(): Promise<Supplier[]>;
  getById(id: number): Promise<Supplier>;
  create(data: CreateSupplierDTO): Promise<Supplier>;
  update(id: number, data: UpdateSupplierDTO): Promise<Supplier>;
  delete(id: number): Promise<void>;
}
