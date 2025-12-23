import { useState, useCallback } from 'react';
import { ProductSupplier } from '../../domain/entities/ProductSupplier';
import { CreateProductSupplierDTO, UpdateProductSupplierDTO } from '../../domain/ports/IProductSupplierRepository';
import { container } from '../../infrastructure/config/container';

export interface UseProductSuppliersReturn {
  productSuppliers: ProductSupplier[];
  isLoading: boolean;
  error: string | null;
  fetchProductSuppliers: () => Promise<void>;
  fetchProductSupplierById: (id: number) => Promise<ProductSupplier | null>;
  createProductSupplier: (data: CreateProductSupplierDTO) => Promise<ProductSupplier | null>;
  updateProductSupplier: (id: number, data: UpdateProductSupplierDTO) => Promise<ProductSupplier | null>;
  updateProductSupplierState: (id: number, state: boolean) => Promise<boolean>;
  deleteProductSupplier: (id: number) => Promise<boolean>;
}

export const useProductSuppliers = (): UseProductSuppliersReturn => {
  const [productSuppliers, setProductSuppliers] = useState<ProductSupplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.productSuppliers.getAll();
      setProductSuppliers(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar relaciones producto-proveedor');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProductSupplierById = useCallback(async (id: number): Promise<ProductSupplier | null> => {
    setError(null);
    try {
      return await container.productSuppliers.getById(id);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar relación');
      return null;
    }
  }, []);

  const createProductSupplier = useCallback(async (data: CreateProductSupplierDTO): Promise<ProductSupplier | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newPS = await container.productSuppliers.create(data);
      setProductSuppliers(prev => [...prev, newPS]);
      return newPS;
    } catch (err: any) {
      setError(err?.message || 'Error al crear relación');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProductSupplier = useCallback(async (id: number, data: UpdateProductSupplierDTO): Promise<ProductSupplier | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.productSuppliers.update(id, data);
      setProductSuppliers(prev => prev.map(ps => (ps.id === id ? updated : ps)));
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar relación');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProductSupplierState = useCallback(async (id: number, state: boolean): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.productSuppliers.updateState(id, state);
      setProductSuppliers(prev => prev.map(ps => (ps.id === id ? updated : ps)));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar estado');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProductSupplier = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.productSuppliers.delete(id);
      setProductSuppliers(prev => prev.filter(ps => ps.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar relación');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    productSuppliers,
    isLoading,
    error,
    fetchProductSuppliers,
    fetchProductSupplierById,
    createProductSupplier,
    updateProductSupplier,
    updateProductSupplierState,
    deleteProductSupplier,
  };
};
