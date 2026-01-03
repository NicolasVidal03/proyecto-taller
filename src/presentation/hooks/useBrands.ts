import { useState, useCallback } from 'react';
import { Brand } from '../../domain/entities/Brand';
import { CreateBrandDTO, UpdateBrandDTO } from '../../domain/ports/IBrandRepository';
import { container } from '../../infrastructure/config/container';

export interface UseBrandsReturn {
  brands: Brand[];
  brandMap: Map<number, string>;
  isLoading: boolean;
  error: string | null;
  fetchBrands: () => Promise<void>;
  fetchBrandById: (id: number) => Promise<Brand | null>;
  createBrand: (data: CreateBrandDTO) => Promise<Brand | null>;
  updateBrand: (id: number, data: UpdateBrandDTO) => Promise<Brand | null>;
  updateBrandState: (id: number, userId: number) => Promise<boolean>;
  clearError: () => void;
}

export const useBrands = (): UseBrandsReturn => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brandMap = new Map(brands.map(b => [b.id, b.name]));

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.brands.getAll();
      setBrands(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar marcas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBrandById = useCallback(async (id: number): Promise<Brand | null> => {
    setError(null);
    try {
      return await container.brands.getById(id);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar marca');
      return null;
    }
  }, []);

  const createBrand = useCallback(async (data: CreateBrandDTO): Promise<Brand | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newBrand = await container.brands.create(data);
      setBrands(prev => [newBrand, ...prev]);
      return newBrand;
    } catch (err: any) {
      setError(err?.message || 'Error al crear marca');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBrand = useCallback(async (id: number, data: UpdateBrandDTO): Promise<Brand | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.brands.update(id, data);
      setBrands(prev => prev.map(b => (b.id === id ? updated : b)));
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar marca');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBrandState = useCallback(async (id: number, userId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.brands.updateState(id, userId);
      setBrands(prev => {
        const found = prev.find(b => b.id === id);
        if (!found) return prev;
        if (found.state) {
          // Deactivating -> remove from list
          return prev.filter(b => b.id !== id);
        }
        // Activating -> mark as active
        return prev.map(b => (b.id === id ? { ...b, state: true } : b));
      });
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar estado');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    brands,
    brandMap,
    isLoading,
    error,
    fetchBrands,
    fetchBrandById,
    createBrand,
    updateBrand,
    updateBrandState,
    clearError,
  };
};
