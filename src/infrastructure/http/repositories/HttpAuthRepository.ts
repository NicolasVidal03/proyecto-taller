import { http } from '../httpClient';
import { User } from '../../../domain/entities/User';
import { IAuthRepository } from '../../../application/AuthService';

export class HttpAuthRepository implements IAuthRepository {
  async login(username: string, password: string): Promise<{ user: User }> {
    const res = await http.post<{
      token: { accessToken: string; expiresIn?: number } | string;
      user: User;
    }>('/login', { userName: username, password });

    const { token, user } = res.data;
    const accessToken = typeof token === 'string' ? token : token.accessToken;
    const expiresIn = typeof token === 'string' ? undefined : token.expiresIn;

    if (accessToken) {
      localStorage.setItem('auth_token', accessToken);
    }
    localStorage.setItem('auth_user', JSON.stringify(user));
    if (expiresIn) {
      const expiresAt = Date.now() + expiresIn * 1000;
      localStorage.setItem('auth_token_expires_at', String(expiresAt));
    }

    return { user };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token_expires_at');
  }

  async getMe(): Promise<User> {
    const storedUser = localStorage.getItem('auth_user');
    if (!storedUser) {
      throw new Error('No hay sesión activa');
    }
    return JSON.parse(storedUser) as User;
  }

  async updateUser(user: string): Promise<void> {
    if (!user) {
      throw new Error('Error al actualizar usuario');
    }
    localStorage.setItem('auth_user', user)
  }
}
