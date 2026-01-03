import { useState, useCallback, useMemo } from 'react';
import { Color } from '../../domain/entities/Color';
import { CreateColorDTO, UpdateColorDTO } from '../../domain/ports/IColorRepository';
import { container } from '../../infrastructure/config/container';

export interface UseColorsReturn {
  colors: Color[];
  colorMap: Map<number, string>;
  isLoading: boolean;
  error: string | null;
  fetchColors: () => Promise<void>;
  fetchColorById: (id: number) => Promise<Color | null>;
  createColor: (data: CreateColorDTO) => Promise<Color | null>;
  updateColor: (id: number, data: UpdateColorDTO) => Promise<Color | null>;
  updateColorState: (id: number, userId: number) => Promise<boolean>;
  deleteColor: (id: number) => Promise<boolean>;
  clearError: () => void;
}

export const useColors = (): UseColorsReturn => {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorMap = useMemo(() => {
    const map = new Map<number, string>();
    colors.forEach(c => map.set(c.id, c.name));
    return map;
  }, [colors]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchColors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.colors.getAll();
      setColors(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar colores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchColorById = useCallback(async (id: number): Promise<Color | null> => {
    setError(null);
    try {
      return await container.colors.getById(id);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar color');
      return null;
    }
  }, []);

  const createColor = useCallback(async (data: CreateColorDTO): Promise<Color | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newColor = await container.colors.create(data);
      setColors(prev => [...prev, newColor]);
      return newColor;
    } catch (err: any) {
      setError(err?.message || 'Error al crear color');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateColor = useCallback(async (id: number, data: UpdateColorDTO): Promise<Color | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.colors.update(id, data);
      setColors(prev => prev.map(c => (c.id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar color');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateColorState = useCallback(async (id: number, userId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.colors.updateState(id, userId);
      setColors(prev => {
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

  const deleteColor = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.colors.delete(id);
      setColors(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar color');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    colors,
    colorMap,
    isLoading,
    error,
    fetchColors,
    fetchColorById,
    createColor,
    updateColor,
    updateColorState,
    deleteColor,
    clearError,
  };
};
