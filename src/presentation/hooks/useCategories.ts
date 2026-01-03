import { useState, useCallback, useMemo } from 'react';
import { Category } from '../../domain/entities/Category';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../../domain/ports/ICategoryRepository';
import { container } from '../../infrastructure/config/container';

export interface UseCategoriesReturn {
  categories: Category[];
  categoryMap: Map<number, string>;
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: number) => Promise<Category | null>;
  createCategory: (data: CreateCategoryDTO) => Promise<Category | null>;
  updateCategory: (id: number, data: UpdateCategoryDTO) => Promise<Category | null>;
  updateCategoryState: (id: number, userId: number) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
  clearError: () => void;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.categories.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar categorías');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategoryById = useCallback(async (id: number): Promise<Category | null> => {
    setError(null);
    try {
      return await container.categories.getById(id);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar categoría');
      return null;
    }
  }, []);

  const createCategory = useCallback(async (data: CreateCategoryDTO): Promise<Category | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newCategory = await container.categories.create(data);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err: any) {
      setError(err?.message || 'Error al crear categoría');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: number, data: UpdateCategoryDTO): Promise<Category | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.categories.update(id, data);
      setCategories(prev => prev.map(c => (c.id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar categoría');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCategoryState = useCallback(async (id: number, userId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.categories.updateState(id, userId);
      setCategories(prev => {
        const found = prev.find(c => c.id === id);
        if (!found) return prev;
        if (found.state) {
          // Deactivating -> remove from list
          return prev.filter(c => c.id !== id);
        }
        // Activating -> mark as active
        return prev.map(c => (c.id === id ? { ...c, state: true } : c));
      });
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar estado');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.categories.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar categoría');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    categories,
    categoryMap,
    isLoading,
    error,
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    updateCategoryState,
    deleteCategory,
    clearError,
  };
};
