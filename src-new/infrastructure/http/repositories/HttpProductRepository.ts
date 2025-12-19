import { http } from '../httpClient';
import { Product } from '../../../domain/entities/Product';
import { IProductRepository, CreateProductDTO, UpdateProductDTO } from '../../../domain/ports/IProductRepository';

export class HttpProductRepository implements IProductRepository {
  async getAll(): Promise<Product[]> {
    const res = await http.get('/products');
    return res.data;
  }

  async getById(id: number): Promise<Product> {
    const res = await http.get(`/products/${id}`);
    return res.data;
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const res = await http.post('/products', data);
    return res.data.product;
  }

  async update(id: number, data: UpdateProductDTO): Promise<Product> {
    const res = await http.put(`/products/${id}`, data);
    return res.data.product;
  }

  async delete(id: number): Promise<void> {
    await http.delete(`/products/${id}`);
  }
}
