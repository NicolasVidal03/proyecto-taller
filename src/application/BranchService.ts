import { Branch } from '../domain/entities/Branch';
import { 
  IBranchRepository, 
  CreateBranchDTO, 
  UpdateBranchDTO 
} from '../domain/ports/IBranchRepository';

export class BranchService {
  constructor(private readonly branchRepo: IBranchRepository) {}
  async getAll(): Promise<Branch[]> {
    return this.branchRepo.getAll();
  }

  async getById(id: number): Promise<Branch> {
    return this.branchRepo.getById(id);
  }

  async create(data: CreateBranchDTO): Promise<Branch> {
    return this.branchRepo.create(data);
  }

  async update(id: number, data: UpdateBranchDTO): Promise<Branch> {
    return this.branchRepo.update(id, data);
  }
  
  async updateState(id: number, state: boolean): Promise<Branch> {
    return this.branchRepo.updateState(id, state);
  }
}
