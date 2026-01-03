import { useState, useCallback, useMemo } from 'react';
import { Presentation } from '../../domain/entities/Presentation';
import { CreatePresentationDTO, UpdatePresentationDTO } from '../../domain/ports/IPresentationRepository';
import { container } from '../../infrastructure/config/container';

export interface UsePresentationsReturn {
  presentations: Presentation[];
  presentationMap: Map<number, string>;
  isLoading: boolean;
  error: string | null;
  fetchPresentations: () => Promise<void>;
  fetchPresentationById: (id: number) => Promise<Presentation | null>;
  createPresentation: (data: CreatePresentationDTO) => Promise<Presentation | null>;
  updatePresentation: (id: number, data: UpdatePresentationDTO) => Promise<Presentation | null>;
  updatePresentationState: (id: number, userId: number) => Promise<boolean>;
  deletePresentation: (id: number) => Promise<boolean>;
  clearError: () => void;
}

export const usePresentations = (): UsePresentationsReturn => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presentationMap = useMemo(() => {
    const map = new Map<number, string>();
    presentations.forEach(p => map.set(p.id, p.name));
    return map;
  }, [presentations]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchPresentations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.presentations.getAll();
      setPresentations(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar presentaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPresentationById = useCallback(async (id: number): Promise<Presentation | null> => {
    setError(null);
    try {
      return await container.presentations.getById(id);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar presentación');
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
    } catch (err: any) {
      setError(err?.message || 'Error al crear presentación');
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
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar presentación');
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
          // Deactivating -> remove from list
          return prev.filter(p => p.id !== id);
        }
        // Activating -> mark as active
        return prev.map(p => (p.id === id ? { ...p, state: true } : p));
      });
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar estado');
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
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar presentación');
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
    clearError,
  };
};
