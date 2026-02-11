import { IAreaRepository, PaginatedAreas } from '../domain/ports/IAreaRepository';
import { Area, AreaPoint } from '../domain/entities/Area';
import { AreaMap, createAreaMap } from '../presentation/utils/areaHelpers';

export class AreaService {
  private cache: Area[] | null = null;
  private cacheTime: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; 

  constructor(private repository: IAreaRepository) {}

  async listPaginated(page: number = 1, size: number = 10): Promise<PaginatedAreas> {
    return this.repository.getAll(page, size);
  }

  async getAllCached(): Promise<Area[]> {
    const now = Date.now();
    if (this.cache && now - this.cacheTime < this.cacheDuration) {
      return this.cache;
    }

    const result = await this.repository.getAll(1, 100);
    this.cache = result.data;
    this.cacheTime = now;
    return this.cache;
  }


  async getAllFresh(): Promise<Area[]> {
    this.clearCache();
    return this.getAllCached();
  }

  async getAreaMap(): Promise<AreaMap> {
    const areas = await this.getAllCached();
    return createAreaMap(areas);
  }


  async create(name: string, area: AreaPoint[]): Promise<Area> {
    const created = await this.repository.create(name, area);
    this.clearCache();
    return created;
  }


  async update(id: number, patch: { name?: string; area?: AreaPoint[] }): Promise<Area> {
    const updated = await this.repository.update(id, patch);
    this.clearCache();
    return updated;
  }

  
  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
    this.clearCache();
  }

  clearCache(): void {
    this.cache = null;
    this.cacheTime = 0;
  }
}
