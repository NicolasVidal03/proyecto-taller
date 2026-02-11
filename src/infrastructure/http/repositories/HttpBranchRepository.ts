import { http } from '../httpClient';
import { Branch } from '../../../domain/entities/Branch';
import {
  IBranchRepository,
  CreateBranchDTO,
  UpdateBranchDTO,
} from '../../../domain/ports/IBranchRepository';

export class HttpBranchRepository implements IBranchRepository {
  private readonly basePath = '/branches';

  async getAll(): Promise<Branch[]> {
    const response = await http.get<Branch[]>(this.basePath);
    return response.data;
  }

  async getById(id: number): Promise<Branch> {
    const response = await http.get<Branch>(`${this.basePath}/${id}`);
    return response.data;
  }

  async create(data: CreateBranchDTO): Promise<Branch> {
    const response = await http.post<Branch>(this.basePath, data);
    return response.data;
  }

  async update(id: number, data: UpdateBranchDTO): Promise<Branch> {
    const response = await http.put<Branch>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async updateState(id: number, state: boolean): Promise<Branch> {
    await http.patch(`${this.basePath}/${id}/state`, { state });
    return this.getById(id);
  }
}
