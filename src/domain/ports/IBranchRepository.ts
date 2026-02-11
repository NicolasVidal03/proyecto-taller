import { Branch } from '../entities/Branch';

export interface CreateBranchDTO {
  name: string;
}

export interface UpdateBranchDTO {
  name?: string;
}


export interface IBranchRepository {
  getAll(): Promise<Branch[]>;
  getById(id: number): Promise<Branch>;
  create(data: CreateBranchDTO): Promise<Branch>;
  update(id: number, data: UpdateBranchDTO): Promise<Branch>;
  updateState(id: number, state: boolean): Promise<Branch>;
}
