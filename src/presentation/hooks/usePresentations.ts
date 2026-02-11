import { useState, useCallback, useMemo } from 'react';
import { Presentation } from '../../domain/entities/Presentation';
import { CreatePresentationDTO, UpdatePresentationDTO } from '../../domain/ports/IPresentationRepository';
import { container } from '../../infrastructure/config/container';
import { extractErrorMessage } from './shared';

export interface UsePresentationsReturn {
  // Datos
  presentations: Presentation[];
  presentationMap: Map<number, string>;
  
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // CRUD
  fetchPresentations: () => Promise<void>;
  fetchPresentationById: (id: number) => Promise<Presentation | null>;
  createPresentation: (data: CreatePresentationDTO) => Promise<Presentation | null>;
  updatePresentation: (id: number, data: UpdatePresentationDTO) => Promise<Presentation | null>;
  updatePresentationState: (id: number, userId: number) => Promise<boolean>;
  deletePresentation: (id: number) => Promise<boolean>;
  
  // Utilidades
  getPresentationName: (id: number | null | undefined) => string;
  clearError: () => void;
}

export const usePresentations = (): UsePresentationsReturn => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapa de presentaciones para búsqueda rápida
  const presentationMap = useMemo(() => {
    return new Map(presentations.map(p => [p.id, p.name]));
  }, [presentations]);

  const getPresentationName = useCallback((id: number | null | undefined): string => {
    if (id == null) return 'Sin presentación';
    return presentationMap.get(id) ?? 'Desconocida';
  }, [presentationMap]);

  const clearError = useCallback(() => setError(null), []);

  // ========== CRUD ==========

  const fetchPresentations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.presentations.getAll();
      setPresentations(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPresentationById = useCallback(async (id: number): Promise<Presentation | null> => {
    setError(null);
    try {
      return await container.presentations.getById(id);
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    }
  }, []);

  const createPresentation = useCallback(async (data: CreatePresentationDTO): Promise<Presentation | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newPresentation = await container.presentations.create(data);
      setPresentations(prev => [...prev, newPresentation]);
      return newPresentation;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePresentation = useCallback(async (id: number, data: UpdatePresentationDTO): Promise<Presentation | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.presentations.update(id, data);
      setPresentations(prev => prev.map(p => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePresentationState = useCallback(async (id: number, userId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.presentations.updateState(id, userId);
      setPresentations(prev => {
        const found = prev.find(p => p.id === id);
        if (!found) return prev;
        if (found.state) {
          return prev.filter(p => p.id !== id);
        }
        return prev.map(p => (p.id === id ? { ...p, state: true } : p));
      });
      return true;
    } catch (err) {
      setError(extractErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePresentation = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.presentations.delete(id);
      setPresentations(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(extractErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    presentations,
    presentationMap,
    isLoading,
    error,
    fetchPresentations,
    fetchPresentationById,
    createPresentation,
    updatePresentation,
    updatePresentationState,
    deletePresentation,
    getPresentationName,
    clearError,
  };
};
