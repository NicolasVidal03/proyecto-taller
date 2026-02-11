import { useState, useCallback, useMemo } from 'react';
import { Country } from '../../domain/entities/Country';
import { container } from '../../infrastructure/config/container';
import { extractErrorMessage } from './shared';

export interface UseCountriesReturn {
  // Datos
  countries: Country[];
  countryMap: Map<number, string>;
  
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // Operaciones
  fetchCountries: () => Promise<void>;
  
  // Utilidades
  getCountryName: (id: number | null | undefined) => string;
  clearError: () => void;
}

export const useCountries = (): UseCountriesReturn => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapa de países para búsqueda rápida
  const countryMap = useMemo(() => {
    return new Map(countries.map(c => [c.id, c.name]));
  }, [countries]);

  const getCountryName = useCallback((id: number | null | undefined): string => {
    if (id == null) return 'Sin país';
    return countryMap.get(id) ?? 'Desconocido';
  }, [countryMap]);

  const clearError = useCallback(() => setError(null), []);

  const fetchCountries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.countries.getAll();
      setCountries(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    countries,
    countryMap,
    isLoading,
    error,
    fetchCountries,
    getCountryName,
    clearError,
  };
};
