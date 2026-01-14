import { useState, useCallback, useEffect } from 'react';
import { Area, AreaPoint } from '../../domain/entities/Area';
import { AreaMap as AreaMapType, createAreaMap } from '../utils/areaHelpers';
import { container } from '../../infrastructure/config/container';
import { areaPolygonsOverlap } from '../../domain/utils/geometry';

export const useAreasSimple = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaMap, setAreaMap] = useState<AreaMapType>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchAreas = useCallback(async () => {
    setIsLoading(true);
    try {
      const allAreas = await container.areas.getAllCached();
      setAreas(allAreas);
      setAreaMap(createAreaMap(allAreas));
    } catch (err) {
      console.error('Error cargando áreas', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAreas = useCallback(async () => {
    setIsLoading(true);
    try {
      const allAreas = await container.areas.getAllFresh();
      setAreas(allAreas);
      setAreaMap(createAreaMap(allAreas));
    } catch (err) {
      console.error('Error recargando áreas', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return { areas, areaMap, isLoading, fetchAreas, refreshAreas };
};

interface OverlapResult {
  overlaps: boolean;
  overlappingAreaName?: string;
}

interface UseAreasReturn {
  areas: Area[];
  selectedArea: Area | null;
  loading: boolean;
  error: string | null;
  fetchAreas: () => Promise<void>;
  selectArea: (area: Area | null) => void;
  createArea: (name: string, area: AreaPoint[]) => Promise<Area | null>;
  updateArea: (id: number, name: string, area: AreaPoint[]) => Promise<Area | null>;
  deleteArea: (id: number) => Promise<boolean>;
  clearError: () => void;
  checkOverlap: (polygon: AreaPoint[], excludeId?: number) => OverlapResult;
}

export function useAreas(): UseAreasReturn {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {

      const allAreas = await container.areas.getAllFresh();
      setAreas(allAreas);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar las áreas');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectArea = useCallback((area: Area | null) => {
    setSelectedArea(area);
  }, []);

  const createArea = useCallback(async (name: string, area: AreaPoint[]): Promise<Area | null> => {
    setLoading(true);
    setError(null);
    try {
      const created = await container.areas.create(name, area);
      setAreas(prev => [...prev, created]);
      return created;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al crear el área');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateArea = useCallback(async (id: number, name: string, area: AreaPoint[]): Promise<Area | null> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await container.areas.update(id, { name, area });
      setAreas(prev => prev.map(a => (a.id === id ? updated : a)));
      setSelectedArea(prev => (prev?.id === id ? updated : prev));
      return updated;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al actualizar el área');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteArea = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await container.areas.delete(id);
      setAreas(prev => prev.filter(a => a.id !== id));
      setSelectedArea(prev => (prev?.id === id ? null : prev));
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al eliminar el área');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const checkOverlap = useCallback((polygon: AreaPoint[], excludeId?: number): OverlapResult => {
    if (polygon.length < 3) return { overlaps: false };

    for (const existingArea of areas) {
      if (excludeId && existingArea.id === excludeId) continue;
      if (!existingArea.area || existingArea.area.length < 3) continue;

      if (areaPolygonsOverlap(polygon, existingArea.area)) {
        return { overlaps: true, overlappingAreaName: existingArea.name };
      }
    }
    return { overlaps: false };
  }, [areas]);

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
