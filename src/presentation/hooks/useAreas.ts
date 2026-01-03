import { useState, useCallback, useEffect } from 'react';
import { Area, AreaMap, createAreaMap } from '../../domain/entities/Area';
import { container } from '../../infrastructure/config/container';

/**
 * Hook simple para áreas con cache
 * Para selección de áreas en formularios
 */
export const useAreasSimple = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaMap, setAreaMap] = useState<AreaMap>({});
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

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return {
    areas,
    areaMap,
    isLoading,
    fetchAreas,
  };
};

// Re-exportar el hook con CRUD completo
export { useAreas } from './useAreasGeoJSON';
