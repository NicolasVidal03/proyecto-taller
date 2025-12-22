import { useState, useCallback } from 'react';
import { Country } from '../../domain/entities/Country';
import { container } from '../../infrastructure/config/container';

export interface UseCountriesReturn {
  countries: Country[];
  countryMap: Record<number, string>;
  isLoading: boolean;
  error: string | null;
  fetchCountries: () => Promise<void>;
}

export const useCountries = (): UseCountriesReturn => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryMap, setCountryMap] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.countries.getAll();
      setCountries(data);
      
      // Crear diccionario id -> nombre
      const map: Record<number, string> = {};
      data.forEach(c => {
        map[c.id] = c.name;
      });
      setCountryMap(map);
      
    } catch (err: any) {
      setError(err?.message || 'Error al cargar países');
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
  };
};
