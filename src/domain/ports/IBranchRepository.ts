import { Branch } from '../entities/Branch';

/**
 * DTO para crear una nueva sucursal
 */
export interface CreateBranchDTO {
  name: string;
}

/**
 * DTO para actualizar una sucursal existente
 */
export interface UpdateBranchDTO {
  name?: string;
}

/**
 * Puerto del repositorio de sucursales
 * Define el contrato que debe implementar cualquier adaptador de infraestructura
 */
export interface IBranchRepository {
  /**
   * Obtiene todas las sucursales activas
   */
  getAll(): Promise<Branch[]>;

  /**
   * Obtiene una sucursal por su ID
   */
  getById(id: number): Promise<Branch>;

  /**
   * Crea una nueva sucursal
   */
  create(data: CreateBranchDTO): Promise<Branch>;

  /**
   * Actualiza una sucursal existente
   */
  update(id: number, data: UpdateBranchDTO): Promise<Branch>;

  /**
   * Actualiza el estado (activo/inactivo) de una sucursal (borrado lógico)
   */
  updateState(id: number, state: boolean): Promise<Branch>;
}
