import { RouteService } from '@application/RouteService';
import { IRouteRepository, CreateRouteDTO } from '@domain/ports/IRouteRepository';
import { Route } from '@domain/entities/Route';

const mockRoute = (): Route => ({ id: 1 } as Route);

const makeRouteRepo = (): jest.Mocked<IRouteRepository> => ({
    create: jest.fn(),
    getRoutes: jest.fn(),
});

describe('RouteService', () => {
    it('create usa el DTO y retorna la ruta creada', async () => {
        const repo = makeRouteRepo();
        repo.create.mockResolvedValue(mockRoute());
        const dto: CreateRouteDTO = { assignedIdUser: 1, assignedIdArea: 2, assignedDate: '2024-01-01' };

        const result = await new RouteService(repo).create(dto);

        expect(repo.create).toHaveBeenCalledWith(dto);
        expect(result.id).toBe(1);
    });

    it('getRoutes retorna todas las rutas', async () => {
        const repo = makeRouteRepo();
        repo.getRoutes.mockResolvedValue([mockRoute(), mockRoute()]);

        const result = await new RouteService(repo).getRoutes();

        expect(result).toHaveLength(2);
    });
});