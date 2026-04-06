import { AreaService } from '@application/AreaService';
import { IAreaRepository, PaginatedAreas } from '@domain/ports/IAreaRepository';
import { Area, AreaPoint } from '@domain/entities/Area';

// ── Fixtures ──────────────────────────────────────────────────
const makeArea = (id: number, name: string): Area => ({ id, name, area: [], state: true });

const paginated = (areas: Area[]): PaginatedAreas => ({
  data: areas,
  total: areas.length,
  page: 1,
  size: areas.length || 10,
});

const makeRepo = (): jest.Mocked<IAreaRepository> => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});


describe('AreaService.listPaginated', () => {
  it('se devuelven la paginacion con los datos que se requieren', async () => {
    const repo = makeRepo();
    repo.getAll.mockResolvedValue(paginated([]));

    await new AreaService(repo).listPaginated(2, 20);

    expect(repo.getAll).toHaveBeenCalledWith(2, 20);
  });

  it('verifica que se usa page=1 y size=10 como valores por defecto', async () => {
    const repo = makeRepo();
    repo.getAll.mockResolvedValue(paginated([]));

    await new AreaService(repo).listPaginated();

    expect(repo.getAll).toHaveBeenCalledWith(1, 10);
  });
});


describe('AreaService.getAllCached', () => {
  it('consulta el repositorio en la primera llamada', async () => {
    const repo = makeRepo();
    repo.getAll.mockResolvedValue(paginated([makeArea(1, 'Norte')]));
    const service = new AreaService(repo);

    const result = await service.getAllCached();

    expect(repo.getAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
  });

  it('usa la caché en la segunda llamada sin consultar el repositorio', async () => {
    const repo = makeRepo();
    repo.getAll.mockResolvedValue(paginated([makeArea(1, 'Norte')]));
    const service = new AreaService(repo);

    await service.getAllCached();
    await service.getAllCached();

    expect(repo.getAll).toHaveBeenCalledTimes(1);
  });

  it('refresca la caché cuando ha expirado el TTL', async () => {
    const repo = makeRepo();
    repo.getAll.mockResolvedValue(paginated([makeArea(1, 'Norte')]));
    const service = new AreaService(repo);

    await service.getAllCached();

    (service as any).cacheTime = Date.now() - 6 * 60 * 1000;
    await service.getAllCached();

    expect(repo.getAll).toHaveBeenCalledTimes(2);
  });
});


describe('AreaService.getAllFresh', () => {
  it('invalida la caché y consulta el repositorio de nuevo', async () => {
    const repo = makeRepo();
    repo.getAll.mockResolvedValue(paginated([makeArea(1, 'Norte')]));
    const service = new AreaService(repo);

    await service.getAllCached(); 
    await service.getAllFresh();   

    expect(repo.getAll).toHaveBeenCalledTimes(2);
  });
});


describe('AreaService.getAreaMap', () => {
  it('retorna un mapa con las áreas del repositorio', async () => {
    const repo = makeRepo();
    repo.getAll.mockResolvedValue(paginated([makeArea(1, 'Norte'), makeArea(2, 'Sur')]));

    const map = await new AreaService(repo).getAreaMap();

    expect(map).toEqual({ 1: 'Norte', 2: 'Sur' });
  });
});


describe('AreaService.create', () => {
  it('llama al repositorio con nombre y puntos, y limpia la caché', async () => {
    const repo = makeRepo();
    const created = makeArea(3, 'Este');
    repo.create.mockResolvedValue(created);
    repo.getAll.mockResolvedValue(paginated([makeArea(1, 'Norte')]));
    const service = new AreaService(repo);
    const points: AreaPoint[] = [{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }, { lat: 2, lng: 0 }];

    await service.getAllCached();              
    const result = await service.create('Este', points);
    await service.getAllCached();            

    expect(result).toEqual(created);
    expect(repo.create).toHaveBeenCalledWith('Este', points);
    expect(repo.getAll).toHaveBeenCalledTimes(2);
  });
});


describe('AreaService.update', () => {
  it('llama al repositorio con id y patch, y limpia la caché', async () => {
    const repo = makeRepo();
    const updated = makeArea(1, 'Norte Actualizado');
    repo.update.mockResolvedValue(updated);
    repo.getAll.mockResolvedValue(paginated([makeArea(1, 'Norte')]));
    const service = new AreaService(repo);

    await service.getAllCached();
    const result = await service.update(1, { name: 'Norte Actualizado' });
    await service.getAllCached();

    expect(result).toEqual(updated);
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'Norte Actualizado' });
    expect(repo.getAll).toHaveBeenCalledTimes(2);
  });
});


describe('AreaService.delete', () => {
  it('llama al repositorio con el id correcto y limpia la caché', async () => {
    const repo = makeRepo();
    repo.delete.mockResolvedValue(undefined);
    repo.getAll.mockResolvedValue(paginated([makeArea(1, 'Norte')]));
    const service = new AreaService(repo);

    await service.getAllCached();
    await service.delete(1);
    await service.getAllCached();

    expect(repo.delete).toHaveBeenCalledWith(1);
    expect(repo.getAll).toHaveBeenCalledTimes(2);
  });
});


describe('AreaService.clearCache', () => {
  it('resetea cache y cacheTime a sus valores iniciales', async () => {
    const repo = makeRepo();
    repo.getAll.mockResolvedValue(paginated([makeArea(1, 'Norte')]));
    const service = new AreaService(repo);

    await service.getAllCached();
    service.clearCache();

    expect((service as any).cache).toBeNull();
    expect((service as any).cacheTime).toBe(0);
  });
});
