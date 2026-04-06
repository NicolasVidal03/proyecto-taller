import { BranchService } from '@application/BranchService';
import { IBranchRepository, CreateBranchDTO, UpdateBranchDTO } from '@domain/ports/IBranchRepository';
import { Branch } from '@domain/entities/Branch';

const mockBranch = (): Branch => ({ id: 1, name: 'Cochabamba' } as Branch);

const makeBranchRepo = (): jest.Mocked<IBranchRepository> => ({
  getAll: jest.fn(), getById: jest.fn(), create: jest.fn(),
  update: jest.fn(), updateState: jest.fn(),
});


describe('BranchService', () => {
    it('getAll retorna todas las sucursales', async () => {
        const repo = makeBranchRepo();
        repo.getAll.mockResolvedValue([mockBranch()]);
        expect(await new BranchService(repo).getAll()).toHaveLength(1);
    });

    it('getById busca con el id correcto', async () => {
        const repo = makeBranchRepo();
        repo.getById.mockResolvedValue(mockBranch());
        await new BranchService(repo).getById(1);
        expect(repo.getById).toHaveBeenCalledWith(1);
    });

    it('create manda el DTO al repositorio', async () => {
        const repo = makeBranchRepo();
        repo.create.mockResolvedValue(mockBranch());
        const dto: CreateBranchDTO = { name: 'Nueva' };
        await new BranchService(repo).create(dto);
        expect(repo.create).toHaveBeenCalledWith(dto);
    });

    it('update usa id y DTO', async () => {
        const repo = makeBranchRepo();
        repo.update.mockResolvedValue(mockBranch());
        const dto: UpdateBranchDTO = { name: 'Editada' };
        await new BranchService(repo).update(1, dto);
        expect(repo.update).toHaveBeenCalledWith(1, dto);
    });

    it('updateState manda id y estado booleano', async () => {
        const repo = makeBranchRepo();
        repo.updateState.mockResolvedValue(mockBranch());
        await new BranchService(repo).updateState(1, false);
        expect(repo.updateState).toHaveBeenCalledWith(1, false);
    });
});