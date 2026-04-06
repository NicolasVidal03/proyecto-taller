import { ClientService } from '@application/ClientService';
import { IClientRepository, CreateClientDTO, UpdateClientDTO, ClientSearchParams } from '@domain/ports/IClientRepository';
import { Client } from '@domain/entities/Client';

const mockClient = (): Client => ({ id: 1, name: 'Ana', lastName: 'Pérez' } as unknown as Client);

const makeClientRepo = (): jest.Mocked<IClientRepository> => ({
  getAll: jest.fn(), 
  getById: jest.fn(), 
  create: jest.fn(),
  update: jest.fn(), 
  softDelete: jest.fn(), 
  search: jest.fn(),
});

describe('ClientService', () => {
  it('listPaginated retorna la lista de clientes', async () => {
    const repo = makeClientRepo();
    repo.getAll.mockResolvedValue([mockClient()]);
    expect(await new ClientService(repo).listPaginated()).toHaveLength(1);
  });

  it('getById encuentra al id correcto', async () => {
    const repo = makeClientRepo();
    repo.getById.mockResolvedValue(mockClient());
    await new ClientService(repo).getById(1);
    expect(repo.getById).toHaveBeenCalledWith(1);
  });

  it('create funciona con el DTO', async () => {
    const repo = makeClientRepo();
    repo.create.mockResolvedValue(mockClient());
    const dto: CreateClientDTO = { name: 'Ana', lastName: 'Pérez', secondLastName: '', phone: '123' };
    await new ClientService(repo).create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  it('update elige al correcto y funciona con el DTO', async () => {
    const repo = makeClientRepo();
    repo.update.mockResolvedValue(mockClient());
    const dto: UpdateClientDTO = { id: 1, name: 'Beatriz' };
    await new ClientService(repo).update(1, dto);
    expect(repo.update).toHaveBeenCalledWith(1, dto);
  });

  it('softDelete elimina el id correcto', async () => {
    const repo = makeClientRepo();
    repo.softDelete.mockResolvedValue(undefined);
    await new ClientService(repo).softDelete(1);
    expect(repo.softDelete).toHaveBeenCalledWith(1);
  });

  it('search utiliza los parámetros de búsqueda correctamente', async () => {
    const repo = makeClientRepo();
    repo.search.mockResolvedValue([mockClient()]);
    const params: ClientSearchParams = { search: 'An', limit: 5 };
    const result = await new ClientService(repo).search(params);
    expect(repo.search).toHaveBeenCalledWith(params);
    expect(result).toHaveLength(1);
  });
});
