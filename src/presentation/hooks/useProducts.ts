import { useState, useCallback } from 'react';
import { Product } from '../../domain/entities/Product';
import { CreateProductDTO, UpdateProductDTO } from '../../domain/ports/IProductRepository';
import { container } from '../../infrastructure/config/container';

export interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: number) => Promise<Product | null>;
  createProduct: (data: CreateProductDTO) => Promise<Product | null>;
  updateProduct: (id: number, data: UpdateProductDTO) => Promise<Product | null>;
  updateProductState: (id: number, state: boolean) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.products.getAll();
      setProducts(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id: number): Promise<Product | null> => {
    setError(null);
    try {
      return await container.products.getById(id);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar producto');
      return null;
    }
  }, []);

  const createProduct = useCallback(async (data: CreateProductDTO): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newProduct = await container.products.create(data);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err: any) {
      setError(err?.message || 'Error al crear producto');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: number, data: UpdateProductDTO): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.products.update(id, data);
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar producto');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProductState = useCallback(async (id: number, state: boolean): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.products.updateState(id, state);
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar estado');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar producto');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    updateProductState,
    deleteProduct,
  };
};
