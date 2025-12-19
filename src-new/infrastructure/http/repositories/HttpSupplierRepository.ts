import { http } from '../httpClient';
import { Supplier } from '../../../domain/entities/Supplier';
import { ISupplierRepository, CreateSupplierDTO, UpdateSupplierDTO } from '../../../domain/ports/ISupplierRepository';

export class HttpSupplierRepository implements ISupplierRepository {
  async getAll(): Promise<Supplier[]> {
    const res = await http.get('/suppliers');
    return res.data;
  }

  async getById(id: number): Promise<Supplier> {
    const res = await http.get(`/suppliers/${id}`);
    return res.data;
  }

  async create(data: CreateSupplierDTO): Promise<Supplier> {
    const res = await http.post('/suppliers', data);
    return res.data.supplier;
  }

  async update(id: number, data: UpdateSupplierDTO): Promise<Supplier> {
    const res = await http.put(`/suppliers/${id}`, data);
    return res.data.supplier;
  }

  async delete(id: number): Promise<void> {
    await http.delete(`/suppliers/${id}`);
  }
}
