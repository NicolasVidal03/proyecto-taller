import { Branch } from '../domain/entities/Branch';
import { 
  IBranchRepository, 
  CreateBranchDTO, 
  UpdateBranchDTO 
} from '../domain/ports/IBranchRepository';

/**
 * BranchService - Application Layer
 * Caso de uso para gestión de sucursales
 */
export class BranchService {
  constructor(private readonly branchRepo: IBranchRepository) {}

  /**
   * Obtiene todas las sucursales
   */
  async getAll(): Promise<Branch[]> {
    return this.branchRepo.getAll();
  }

  /**
   * Obtiene una sucursal por ID
   */
  async getById(id: number): Promise<Branch> {
    return this.branchRepo.getById(id);
  }

  /**
   * Crea una nueva sucursal
   */
  async create(data: CreateBranchDTO): Promise<Branch> {
    return this.branchRepo.create(data);
  }

  /**
   * Actualiza una sucursal existente
   */
  async update(id: number, data: UpdateBranchDTO): Promise<Branch> {
    return this.branchRepo.update(id, data);
  }

  /**
   * Actualiza el estado de una sucursal (borrado lógico)
   */
  async updateState(id: number, state: boolean): Promise<Branch> {
    return this.branchRepo.updateState(id, state);
  }
}
