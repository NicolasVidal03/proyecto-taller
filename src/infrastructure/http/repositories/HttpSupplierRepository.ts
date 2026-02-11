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
    const res = await http.post('/suppliers', { ...data, user_id: data.userId });
    return res.data.supplier;
  }

  async update(id: number, data: UpdateSupplierDTO): Promise<Supplier> {
    const res = await http.patch(`/suppliers/${id}`, { ...data, user_id: data.userId });
    return res.data.supplier || res.data;
  }

  async updateState(id: number, state: boolean, userId?: number): Promise<void> {
    await http.patch(`/suppliers/${id}/state`, { state, user_id: userId });
  }

  async delete(id: number, userId?: number): Promise<void> {
    await http.patch(`/suppliers/${id}/state`, { state: false, user_id: userId });
  }
}
