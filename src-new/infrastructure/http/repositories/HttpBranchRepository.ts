import { Branch } from '../../../domain/entities/Branch';
import { 
  IBranchRepository, 
  CreateBranchDTO, 
  UpdateBranchDTO 
} from '../../../domain/ports/IBranchRepository';

/**
 * Implementación Mock del repositorio de sucursales
 * NOTA: El backend actual no tiene endpoint de branches, por lo que usamos datos estáticos.
 */
export class HttpBranchRepository implements IBranchRepository {
  
  // Datos simulados para que el frontend funcione sin el endpoint
  private readonly mockBranches: Branch[] = [
    { id: 1, name: 'Sucursal Central', state: true },
    { id: 2, name: 'Sucursal Norte', state: true },
    { id: 3, name: 'Sucursal Sur', state: true },
    { id: 4, name: 'Sucursal Este', state: true },
  ];

  async getAll(): Promise<Branch[]> {
    // Simulamos delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockBranches;
  }

  async getById(id: number): Promise<Branch> {
    const branch = this.mockBranches.find(b => b.id === id);
    if (!branch) throw new Error('Sucursal no encontrada');
    return branch;
  }

  async create(data: CreateBranchDTO): Promise<Branch> {
    throw new Error('Creación de sucursales no implementada en backend');
  }

  async update(id: number, data: UpdateBranchDTO): Promise<Branch> {
    throw new Error('Actualización de sucursales no implementada en backend');
  }

  async updateState(id: number, state: boolean): Promise<Branch> {
    throw new Error('Eliminación de sucursales no implementada en backend');
  }
}
