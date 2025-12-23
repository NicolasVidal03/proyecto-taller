import { http } from '../httpClient';
import { User } from '../../../domain/entities/User';
import { IAuthRepository } from '../../../application/AuthService';

export class HttpAuthRepository implements IAuthRepository {
  async login(username: string, password: string): Promise<{ user: User }> {
    // El backend devuelve { token, user }
    const res = await http.post<{
      token: { accessToken: string; expiresIn?: number } | string;
      user: User;
    }>('/login', { userName: username, password });

    const { token, user } = res.data;

    // token puede ser un string (legacy) o un objeto { accessToken, expiresIn }
    const accessToken = typeof token === 'string' ? token : token.accessToken;
    const expiresIn = typeof token === 'string' ? undefined : token.expiresIn;

    // Persistir sesión en cliente
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
    // Limpiar sesión local
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token_expires_at');
    
    // Opcional: Avisar al backend si existiera endpoint, pero por ahora es stateless JWT
    // await http.post('/auth/logout'); 
  }

  async getMe(): Promise<User> {
    // Como no hay endpoint /auth/me, recuperamos del storage local
    const storedUser = localStorage.getItem('auth_user');
    if (!storedUser) {
      throw new Error('No hay sesión activa');
    }
    return JSON.parse(storedUser) as User;
    
    // Si en el futuro existe el endpoint:
    // const res = await http.get('/auth/me');
    // return res.data;
  }
}
