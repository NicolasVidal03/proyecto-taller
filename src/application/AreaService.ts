import { IAreaRepository, PaginatedAreas } from '../domain/ports/IAreaRepository';
import { Area, AreaMap, createAreaMap } from '../domain/entities/Area';

export class AreaService {
  private cache: Area[] | null = null;
  private cacheTime: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutos

  constructor(private repository: IAreaRepository) {}

  async listPaginated(page: number = 1, size: number = 10): Promise<PaginatedAreas> {
    return this.repository.getAll(page, size);
  }

  async getAllCached(): Promise<Area[]> {
    const now = Date.now();
    if (this.cache && now - this.cacheTime < this.cacheDuration) {
      return this.cache;
    }

    try {
      // Cargar todas las áreas (primeras 100 para cachear)
      const result = await this.repository.getAll(1, 100);
      this.cache = result.data;
      this.cacheTime = now;
      return this.cache;
    } catch (error) {
      // Fallback con 5 áreas mock si el backend falla
      console.warn('Backend de áreas falló, usando fallback mock', error);
      const fallback: Area[] = [
        { id: 1, name: 'Zona Norte', status: true },
        { id: 2, name: 'Zona Sur', status: true },
        { id: 3, name: 'Zona Este', status: true },
        { id: 4, name: 'Zona Oeste', status: true },
        { id: 5, name: 'Centro', status: true },
      ];
      this.cache = fallback;
      this.cacheTime = now;
      return fallback;
    }
  }

  async getAreaMap(): Promise<AreaMap> {
    const areas = await this.getAllCached();
    return createAreaMap(areas);
  }

  clearCache(): void {
    this.cache = null;
    this.cacheTime = 0;
  }
}
