import { http } from '../httpClient';
import { Product } from '../../../domain/entities/Product';
import { IProductRepository, CreateProductDTO, UpdateProductDTO, ProductFilters, PaginatedProducts } from '../../../domain/ports/IProductRepository';

export class HttpProductRepository implements IProductRepository {
  async getAll(filters?: ProductFilters): Promise<PaginatedProducts> {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', String(filters.categoryId));
    if (filters?.brandId) params.append('brandId', String(filters.brandId));
    if (filters?.state !== undefined) params.append('state', String(filters.state));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    const res = await http.get(url);
    return res.data;
  }

  async getById(id: number): Promise<Product> {
    const res = await http.get(`/products/${id}`);
    return res.data;
  }

  async create(data: CreateProductDTO): Promise<Product> {
    if ((data as any).imageFile) {
      const formData = createFormData(data as any);
      const res = await http.post('/products', formData, {
      });
      return res.data;
    }

    const res = await http.post('/products', data);
    return res.data;
  }

  async update(id: number, data: UpdateProductDTO): Promise<Product> {
    if ((data as any).imageFile) {
      const formData = createFormData(data as any);
      const res = await http.patch(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    }

    const res = await http.patch(`/products/${id}`, data);
    return res.data;
  }

  async updateState(id: number, userId: number): Promise<void> {
    await http.patch(`/products/${id}/state`, { user_id: userId });
  }

  async delete(id: number): Promise<void> {
    await http.delete(`/products/${id}`);
  }
}

function createFormData(data: any): FormData {
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.categoryId !== undefined) formData.append('categoryId', String(data.categoryId));
  if (data.brandId !== undefined) formData.append('brandId', String(data.brandId));
  if (data.userId !== undefined) formData.append('userId', String(data.userId));
  if (data.barcode !== undefined) formData.append('barcode', data.barcode === null ? '' : data.barcode);
  if (data.internalCode !== undefined) formData.append('internalCode', data.internalCode === null ? '' : data.internalCode);
  if (data.presentationId !== undefined) formData.append('presentationId', data.presentationId === null ? '' : String(data.presentationId));
  if (data.colorId !== undefined) formData.append('colorId', data.colorId === null ? '' : String(data.colorId));
  if (data.prices) formData.append('prices', JSON.stringify(data.prices));
  if (data.imageFile) formData.append('image', data.imageFile);
  return formData;
}
