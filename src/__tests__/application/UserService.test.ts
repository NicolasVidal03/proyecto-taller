import { UserService } from '@application/UserService';
import { IUserRepository, CreateUserDTO, UpdateUserDTO } from '@domain/ports/IUserRepository';
import { User } from '@domain/entities/User';

const mockUser = (): User => ({
    id: 1, userName: 'ffer', ci: '12345678', names: 'Fernando',
    lastName: 'Fernandez', secondLastName: 'Villegas', role: 'admin',
    branchId: null, email: null, isFirstLogin: false,
});

const makeUserRepo = (): jest.Mocked<IUserRepository> => ({
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateState: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
    changeFirstLoginPassword: jest.fn(),
});

describe('UserService', () => {
    it('getAll retorna la lista de usuarios del repositorio', async () => {
        const repo = makeUserRepo();
        repo.getAll.mockResolvedValue([mockUser()]);
        expect(await new UserService(repo).getAll()).toHaveLength(1);
    });

    it('getById buscar por el id correctamente', async () => {
        const repo = makeUserRepo();
        repo.getById.mockResolvedValue(mockUser());
        const result = await new UserService(repo).getById(1);
        expect(repo.getById).toHaveBeenCalledWith(1);
        expect(result.id).toBe(1);
    });

    it('create manda el DTO al repositorio', async () => {
        const repo = makeUserRepo();
        repo.create.mockResolvedValue(mockUser());
        const dto: CreateUserDTO = { ci: '1', names: 'X', lastName: 'Y', secondLastName: null, role: 'admin', branchId: 1, email: 'a@b.com' };
        await new UserService(repo).create(dto);
        expect(repo.create).toHaveBeenCalledWith(dto);
    });

    it('update utiliza id y DTO', async () => {
        const repo = makeUserRepo();
        repo.update.mockResolvedValue(mockUser());
        const dto: UpdateUserDTO = { names: 'Jane' };
        await new UserService(repo).update(1, dto);
        expect(repo.update).toHaveBeenCalledWith(1, dto);
    });

    it('updateState manda id, state y currentUserId', async () => {
        const repo = makeUserRepo();
        repo.updateState.mockResolvedValue(undefined);
        await new UserService(repo).updateState(1, false, 99);
        expect(repo.updateState).toHaveBeenCalledWith(1, false, 99);
    });

    it('resetPassword usa el id y lo manda al repositorio', async () => {
        const repo = makeUserRepo();
        repo.resetPassword.mockResolvedValue(undefined);
        await new UserService(repo).resetPassword(1);
        expect(repo.resetPassword).toHaveBeenCalledWith(1);
    });

    it('updatePassword manda id y la nueva contraseña', async () => {
        const repo = makeUserRepo();
        repo.updatePassword.mockResolvedValue(undefined);
        await new UserService(repo).updatePassword(1, 'newPass');
        expect(repo.updatePassword).toHaveBeenCalledWith(1, 'newPass');
    });

    it('changeFirstLoginPassword retorna el mensaje del repositorio', async () => {
        const repo = makeUserRepo();
        repo.changeFirstLoginPassword.mockResolvedValue({ message: 'OK' });
        const result = await new UserService(repo).changeFirstLoginPassword('old', 'new');
        expect(result).toEqual({ message: 'OK' });
        expect(repo.changeFirstLoginPassword).toHaveBeenCalledWith('old', 'new');
    });
});
