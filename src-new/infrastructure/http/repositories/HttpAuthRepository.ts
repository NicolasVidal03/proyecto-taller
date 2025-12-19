import { http } from '../httpClient';
import { User } from '../../../domain/entities/User';
import { IAuthRepository } from '../../../application/AuthService';

export class HttpAuthRepository implements IAuthRepository {
  async login(username: string, password: string): Promise<{ user: User }> {
    const res = await http.post('/auth/login', { username, password });
    return { user: res.data.user };
  }

  async logout(): Promise<void> {
    await http.post('/auth/logout');
  }

  async getMe(): Promise<User> {
    const res = await http.get('/auth/me');
    return res.data;
  }
}
