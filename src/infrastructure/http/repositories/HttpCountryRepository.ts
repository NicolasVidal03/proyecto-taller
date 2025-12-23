import { http } from '../httpClient';
import { Country } from '../../../domain/entities/Country';
import { ICountryRepository } from '../../../domain/ports/ICountryRepository';

export class HttpCountryRepository implements ICountryRepository {
  async getAll(): Promise<Country[]> {
    const res = await http.get('/countries');
    return res.data;
  }
}
