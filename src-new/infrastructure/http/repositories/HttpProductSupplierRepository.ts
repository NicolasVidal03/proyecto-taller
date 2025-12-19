import { http } from '../httpClient';
import { ProductSupplier } from '../../../domain/entities/ProductSupplier';
import { IProductSupplierRepository, CreateProductSupplierDTO, UpdateProductSupplierDTO } from '../../../domain/ports/IProductSupplierRepository';

export class HttpProductSupplierRepository implements IProductSupplierRepository {
  async getAll(): Promise<ProductSupplier[]> {
    const res = await http.get('/product-suppliers');
    return res.data;
  }

  async getById(id: number): Promise<ProductSupplier> {
    const res = await http.get(`/product-suppliers/${id}`);
    return res.data;
  }

  async create(data: CreateProductSupplierDTO): Promise<ProductSupplier> {
    const res = await http.post('/product-suppliers', data);
    return res.data.productSupplier;
  }

  async update(id: number, data: UpdateProductSupplierDTO): Promise<ProductSupplier> {
    const res = await http.put(`/product-suppliers/${id}`, data);
    return res.data.productSupplier;
  }

  async delete(id: number): Promise<void> {
    await http.delete(`/product-suppliers/${id}`);
  }
}
