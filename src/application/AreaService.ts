import { IAreaRepository, PaginatedAreas } from '../domain/ports/IAreaRepository';
import { Area, AreaPoint } from '../domain/entities/Area';
import { AreaMap, createAreaMap } from '../presentation/utils/areaHelpers';

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
     
      const result = await this.repository.getAll(1, 10);
      this.cache = result.data;
      this.cacheTime = now;
      return this.cache;
    } catch (error) {
      // Fallback con 5 áreas mock si el backend falla
      console.warn('Backend de áreas falló, usando fallback mock', error);
      const fallback: Area[] = [
        { id: 1, name: 'Zona Norte', state: true },
        { id: 2, name: 'Zona Sur', state: true },
        { id: 3, name: 'Zona Este', state: true },
        { id: 4, name: 'Zona Oeste', state: true },
        { id: 5, name: 'Centro', state: true },
      ];
      this.cache = fallback;
      this.cacheTime = now;
      return fallback;
    }
  }

  /** Obtener todas las áreas sin cache (fuerza recarga) */
  async getAllFresh(): Promise<Area[]> {
    this.clearCache();
    return this.getAllCached();
  }

  async getAreaMap(): Promise<AreaMap> {
    const areas = await this.getAllCached();
    return createAreaMap(areas);
  }

  /** Crear un área nueva */
  async create(name: string, area: AreaPoint[]): Promise<Area> {
    const created = await this.repository.create(name, area);
    this.clearCache(); // Limpiar cache para que se recarguen las áreas
    return created;
  }

  /** Actualizar un área */
  async update(id: number, patch: { name?: string; area?: AreaPoint[] }): Promise<Area> {
    const updated = await this.repository.update(id, patch);
    this.clearCache();
    return updated;
  }

  /** Eliminar un área */
  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
    this.clearCache();
  }

  clearCache(): void {
    this.cache = null;
    this.cacheTime = 0;
  }
}
