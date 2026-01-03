import { useState, useCallback, useEffect } from 'react';
import { HttpAreaRepository } from '../../infrastructure/http/repositories/HttpAreaRepository';
import { Area, AreaPoint } from '../../domain/entities/Area';
import { areaPolygonsOverlap } from '../../domain/utils/geometry';

const areaRepository = new HttpAreaRepository();

interface OverlapResult {
  overlaps: boolean;
  overlappingAreaName?: string;
}

interface UseAreasReturn {
  // Estado
  areas: Area[];
  selectedArea: Area | null;
  loading: boolean;
  error: string | null;

  // Acciones
  fetchAreas: () => Promise<void>;
  selectArea: (area: Area | null) => void;
  createArea: (name: string, area: AreaPoint[]) => Promise<Area | null>;
  updateArea: (id: number, name: string, area: AreaPoint[]) => Promise<Area | null>;
  deleteArea: (id: number) => Promise<boolean>;
  clearError: () => void;

  // Validación de solapamiento
  checkOverlap: (polygon: AreaPoint[], excludeId?: number) => OverlapResult;
}

/**
 * Hook para gestión de Áreas (MySQL)
 * 
 * Maneja el estado de las áreas y proporciona métodos para CRUD
 */
export function useAreas(): UseAreasReturn {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await areaRepository.getAll();
      setAreas(result.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar las áreas');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectArea = useCallback((area: Area | null) => {
    setSelectedArea(area);
  }, []);

  const createArea = useCallback(async (
    name: string,
    area: AreaPoint[]
  ): Promise<Area | null> => {
    setLoading(true);
    setError(null);
    try {
      const created = await areaRepository.create(name, area);
      // Agregar al estado local
      setAreas(prev => [...prev, created]);
      return created;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al crear el área';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateArea = useCallback(async (
    id: number,
    name: string,
    area: AreaPoint[]
  ): Promise<Area | null> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await areaRepository.update(id, { name, area });
      // Actualizar en el estado local
      setAreas(prev => prev.map(a =>
        a.id === id ? updated : a
      ));
      // Si es el área seleccionada, actualizarla
      setSelectedArea(prev =>
        prev?.id === id ? updated : prev
      );
      return updated;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al actualizar el área';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteArea = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await areaRepository.delete(id);
      // Eliminar del estado local
      setAreas(prev => prev.filter(a => a.id !== id));
      // Si es el área seleccionada, deseleccionarla
      setSelectedArea(prev =>
        prev?.id === id ? null : prev
      );
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al eliminar el área';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Verifica si un polígono se solapa con algún área existente
   * @param polygon Polígono a verificar
   * @param excludeId ID del área a excluir (para edición)
   * @returns Resultado con flag de solapamiento y nombre del área si aplica
   */
  const checkOverlap = useCallback((
    polygon: AreaPoint[],
    excludeId?: number
  ): OverlapResult => {
    if (polygon.length < 3) {
      return { overlaps: false };
    }

    for (const existingArea of areas) {
      // Excluir el área que se está editando
      if (excludeId && existingArea.id === excludeId) continue;
      
      // Verificar que el área existente tenga polígono válido
      if (!existingArea.area || existingArea.area.length < 3) continue;
      
      // Verificar solapamiento
      if (areaPolygonsOverlap(polygon, existingArea.area)) {
        return {
          overlaps: true,
          overlappingAreaName: existingArea.name,
        };
      }
    }

    return { overlaps: false };
  }, [areas]);

  // Cargar áreas al montar
  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return {
    areas,
    selectedArea,
    loading,
    error,
    fetchAreas,
    selectArea,
    createArea,
    updateArea,
    deleteArea,
    clearError,
    checkOverlap,
  };
}

// Alias para compatibilidad
export const useAreasGeoJSON = useAreas;
