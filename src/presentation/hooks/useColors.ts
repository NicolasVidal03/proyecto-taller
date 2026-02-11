import { useState, useCallback, useMemo } from 'react';
import { Color } from '../../domain/entities/Color';
import { CreateColorDTO, UpdateColorDTO } from '../../domain/ports/IColorRepository';
import { container } from '../../infrastructure/config/container';
import { extractErrorMessage } from './shared';

export interface UseColorsReturn {
  // Datos
  colors: Color[];
  colorMap: Map<number, string>;
  
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // CRUD
  fetchColors: () => Promise<void>;
  fetchColorById: (id: number) => Promise<Color | null>;
  createColor: (data: CreateColorDTO) => Promise<Color | null>;
  updateColor: (id: number, data: UpdateColorDTO) => Promise<Color | null>;
  updateColorState: (id: number, userId: number) => Promise<boolean>;
  deleteColor: (id: number) => Promise<boolean>;
  
  // Utilidades
  getColorName: (id: number | null | undefined) => string;
  clearError: () => void;
}

export const useColors = (): UseColorsReturn => {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapa de colores para búsqueda rápida
  const colorMap = useMemo(() => {
    return new Map(colors.map(c => [c.id, c.name]));
  }, [colors]);

  const getColorName = useCallback((id: number | null | undefined): string => {
    if (id == null) return 'Sin color';
    return colorMap.get(id) ?? 'Desconocido';
  }, [colorMap]);

  const clearError = useCallback(() => setError(null), []);

  // ========== CRUD ==========

  const fetchColors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.colors.getAll();
      setColors(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchColorById = useCallback(async (id: number): Promise<Color | null> => {
    setError(null);
    try {
      return await container.colors.getById(id);
    } catch (err) {
      setError(extractErrorMessage(err));
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
    } catch (err) {
      setError(extractErrorMessage(err));
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
    } catch (err) {
      setError(extractErrorMessage(err));
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

  const deleteColor = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.colors.delete(id);
      setColors(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      setError(extractErrorMessage(err));
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
    getColorName,
    clearError,
  };
};
