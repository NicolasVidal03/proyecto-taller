import { ActivityService } from '@application/ActivityService';
import { IActivityRepository } from '@domain/ports/IActivityRepository';
import { Activity } from '@domain/entities/Activity';

const mockActivity = (): Activity => ({ id: 1 } as unknown as Activity);

const makeActivityRepo = (): jest.Mocked<IActivityRepository> => ({
    getActivityByUserAndDate: jest.fn(),
});

describe('ActivityService', () => {
    it('getActivityByUserAndDate busca según userId, date y role prevendedor', async () => {
        const repo = makeActivityRepo();
        repo.getActivityByUserAndDate.mockResolvedValue(mockActivity());

        const result = await new ActivityService(repo).getActivityByUserAndDate(1, '2024-01-01', 'prevendedor');

        expect(repo.getActivityByUserAndDate).toHaveBeenCalledWith(1, '2024-01-01', 'prevendedor');
        expect(result).toEqual(mockActivity());
    });

    it('getActivityByUserAndDate busca según userId, date y role transportista', async () => {
        const repo = makeActivityRepo();
        repo.getActivityByUserAndDate.mockResolvedValue(mockActivity());

        const result = await new ActivityService(repo).getActivityByUserAndDate(1, '2024-01-01', 'transportista');

        expect(repo.getActivityByUserAndDate).toHaveBeenCalledWith(1, '2024-01-01', 'transportista');
        expect(result).toEqual(mockActivity());
    });
});