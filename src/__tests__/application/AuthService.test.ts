import { AuthService, IAuthRepository } from "@application/AuthService";
import { User } from "@domain/entities";

// ── Fixtures ──────────────────────────────────────────────────
const user: User = {
  id: 1, userName: 'jdoe', ci: '12345678',
  names: 'Fernando', lastName: 'Fernandez', secondLastName: 'Villegas',
  role: 'administrador', branchId: null, email: 'j@example.com', isFirstLogin: false,
};

const makeRepo = (): jest.Mocked<IAuthRepository> => ({
  login: jest.fn(),
  logout: jest.fn(),
  getMe: jest.fn(),
  updateUser: jest.fn(),
});


describe('AuthService.login', () => {
  it('retorna success:true con el usuario cuando el repositorio resuelve', async () => {
    const repo = makeRepo();
    repo.login.mockResolvedValue({ user });

    const result = await new AuthService(repo).login('jdoe', 'pass');

    expect(result).toEqual({ success: true, user });
  });

  it('retorna success:false con el mensaje de error de la API (response.data.error)', async () => {
    const repo = makeRepo();
    repo.login.mockRejectedValue({ response: { data: { error: 'Credenciales inválidas' } } });

    const result = await new AuthService(repo).login('jdoe', 'wrong');

    expect(result).toEqual({ success: false, error: 'Credenciales inválidas' });
  });

  it('retorna el err.message si no hay response.data.error', async () => {
    const repo = makeRepo();
    repo.login.mockRejectedValue(new Error('Network Error'));

    const result = await new AuthService(repo).login('jdoe', 'pass');

    expect(result).toEqual({ success: false, error: 'Network Error' });
  });

  it('retorna mensaje genérico si el error no tiene estructura conocida', async () => {
    const repo = makeRepo();
    repo.login.mockRejectedValue({});

    const result = await new AuthService(repo).login('jdoe', 'pass');

    expect(result).toEqual({ success: false, error: 'Error al iniciar sesión' });
  });
});



describe('AuthService.logout', () => {
  it('llama al repositorio y resuelve sin error', async () => {
    const repo = makeRepo();
    repo.logout.mockResolvedValue(undefined);

    await expect(new AuthService(repo).logout()).resolves.toBeUndefined();
    expect(repo.logout).toHaveBeenCalledTimes(1);
  });
});


describe('AuthService.getCurrentUser', () => {
  it('retorna el usuario cuando el repositorio resuelve', async () => {
    const repo = makeRepo();
    repo.getMe.mockResolvedValue(user);

    expect(await new AuthService(repo).getCurrentUser()).toEqual(user);
  });

  it('retorna null cuando el repositorio rechaza', async () => {
    const repo = makeRepo();
    repo.getMe.mockRejectedValue(new Error('Unauthorized'));

    expect(await new AuthService(repo).getCurrentUser()).toBeNull();
  });
});


describe('AuthService.updateUser', () => {
  it('actualliza el repositorio con el argumento correcto', async () => {
    const repo = makeRepo();
    repo.updateUser.mockResolvedValue(undefined);

    await new AuthService(repo).updateUser('newPassword');

    expect(repo.updateUser).toHaveBeenCalledWith('newPassword');
  });
});
