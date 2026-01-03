import { http } from '../httpClient';
import { Area, AreaPoint } from '../../../domain/entities/Area';
import { IAreaRepository, PaginatedAreas } from '../../../domain/ports/IAreaRepository';

/**
 * Repositorio HTTP para Áreas (MySQL)
 * 
 * Endpoints:
 * - GET    /areas          → Area[]
 * - GET    /areas/:id      → Area
 * - POST   /areas          → Area
 * - PATCH  /areas/:id      → Area
 * - DELETE /areas/:id      → { message }
 */
export class HttpAreaRepository implements IAreaRepository {
  /**
   * Obtener todas las áreas (paginadas)
   */
  async getAll(page: number = 1, size: number = 100): Promise<PaginatedAreas> {
    const response = await http.get('/areas', { params: { page, size } });
    // Si la API devuelve un array simple, lo envolvemos en paginación
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.data.length,
        page: 1,
        size: response.data.length,
      };
    }
    return response.data;
  }

  /**
   * Obtener un área por ID
   */
  async getById(id: number): Promise<Area> {
    const response = await http.get(`/areas/${id}`);
    return response.data;
  }

  /**
   * Crear un área nueva
   */
  async create(name: string, area: AreaPoint[]): Promise<Area> {
    const response = await http.post('/areas', { name, area });
    return response.data;
  }

  /**
   * Actualizar un área
   */
  async update(
    id: number,
    patch: { name?: string; area?: AreaPoint[] }
  ): Promise<Area> {
    const response = await http.patch(`/areas/${id}`, patch);
    return response.data;
  }

  /**
   * Eliminar un área (soft delete)
   */
  async delete(id: number): Promise<void> {
    await http.delete(`/areas/${id}`);
  }
}

// Singleton para usar en toda la aplicación
export const areaRepository = new HttpAreaRepository();
