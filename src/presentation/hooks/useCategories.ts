import { useState, useCallback, useMemo } from 'react';
import { Category } from '../../domain/entities/Category';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../../domain/ports/ICategoryRepository';
import { container } from '../../infrastructure/config/container';
import { extractErrorMessage } from './shared';

export interface UseCategoriesReturn {
  // Datos
  categories: Category[];
  categoryMap: Map<number, string>;
  
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // CRUD
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: number) => Promise<Category | null>;
  createCategory: (data: CreateCategoryDTO) => Promise<Category | null>;
  updateCategory: (id: number, data: UpdateCategoryDTO) => Promise<Category | null>;
  updateCategoryState: (id: number, userId: number) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
  
  // Utilidades
  getCategoryName: (id: number | null | undefined) => string;
  clearError: () => void;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapa de categorías para búsqueda rápida
  const categoryMap = useMemo(() => {
    return new Map(categories.map(c => [c.id, c.name]));
  }, [categories]);

  const getCategoryName = useCallback((id: number | null | undefined): string => {
    if (id == null) return 'Sin categoría';
    return categoryMap.get(id) ?? 'Desconocida';
  }, [categoryMap]);

  const clearError = useCallback(() => setError(null), []);

  // ========== CRUD ==========

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.categories.getAll();
      setCategories(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategoryById = useCallback(async (id: number): Promise<Category | null> => {
    setError(null);
    try {
      return await container.categories.getById(id);
    } catch (err) {
      setError(extractErrorMessage(err));
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
    } catch (err) {
      setError(extractErrorMessage(err));
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
    } catch (err) {
      setError(extractErrorMessage(err));
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
          return prev.filter(c => c.id !== id);
        }
        return prev.map(c => (c.id === id ? { ...c, state: true } : c));
      });
      return true;
    } catch (err) {
      setError(extractErrorMessage(err));
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
    } catch (err) {
      setError(extractErrorMessage(err));
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
    getCategoryName,
    clearError,
  };
};
