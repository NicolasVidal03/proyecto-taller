import { Supplier } from '../entities/Supplier';

export interface CreateSupplierDTO {
  nit: string;
  name: string;
  phone?: string | null;
  countryId: number;
  address?: string | null;
  contactName?: string | null;
  userId?: number;
}

export interface UpdateSupplierDTO {
  nit?: string;
  name?: string;
  phone?: string | null;
  countryId?: number;
  address?: string | null;
  contactName?: string | null;
  userId?: number;
}

export interface ISupplierRepository {
  getAll(): Promise<Supplier[]>;
  getById(id: number): Promise<Supplier>;
  create(data: CreateSupplierDTO): Promise<Supplier>;
  update(id: number, data: UpdateSupplierDTO): Promise<Supplier>;
  updateState(id: number, state: boolean, userId?: number): Promise<void>;
  delete(id: number, userId?: number): Promise<void>;
}
