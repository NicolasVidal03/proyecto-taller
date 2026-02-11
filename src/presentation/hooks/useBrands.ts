import { useState, useCallback, useMemo } from 'react';
import { Brand } from '../../domain/entities/Brand';
import { CreateBrandDTO, UpdateBrandDTO } from '../../domain/ports/IBrandRepository';
import { container } from '../../infrastructure/config/container';
import { extractErrorMessage } from './shared';

export interface UseBrandsReturn {
  // Datos
  brands: Brand[];
  brandMap: Map<number, string>;
  
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // CRUD
  fetchBrands: () => Promise<void>;
  fetchBrandById: (id: number) => Promise<Brand | null>;
  createBrand: (data: CreateBrandDTO) => Promise<Brand | null>;
  updateBrand: (id: number, data: UpdateBrandDTO) => Promise<Brand | null>;
  updateBrandState: (id: number, userId: number) => Promise<boolean>;
  
  // Utilidades
  getBrandName: (id: number | null | undefined) => string;
  clearError: () => void;
}

export const useBrands = (): UseBrandsReturn => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapa de marcas para búsqueda rápida
  const brandMap = useMemo(() => {
    return new Map(brands.map(b => [b.id, b.name]));
  }, [brands]);

  const getBrandName = useCallback((id: number | null | undefined): string => {
    if (id == null) return 'Sin marca';
    return brandMap.get(id) ?? 'Desconocida';
  }, [brandMap]);

  const clearError = useCallback(() => setError(null), []);

  // ========== CRUD ==========

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.brands.getAll();
      setBrands(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBrandById = useCallback(async (id: number): Promise<Brand | null> => {
    setError(null);
    try {
      return await container.brands.getById(id);
    } catch (err) {
      setError(extractErrorMessage(err));
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
    } catch (err) {
      setError(extractErrorMessage(err));
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
    } catch (err) {
      setError(extractErrorMessage(err));
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
          return prev.filter(b => b.id !== id);
        }
        return prev.map(b => (b.id === id ? { ...b, state: true } : b));
      });
      return true;
    } catch (err) {
      setError(extractErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
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
    getBrandName,
    clearError,
  };
};
