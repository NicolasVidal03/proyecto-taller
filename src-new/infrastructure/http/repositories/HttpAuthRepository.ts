import { http } from '../httpClient';
import { User } from '../../../domain/entities/User';
import { IAuthRepository } from '../../../application/AuthService';

export class HttpAuthRepository implements IAuthRepository {
  async login(username: string, password: string): Promise<{ user: User }> {
    // El backend devuelve { token, user }
    const res = await http.post<{ token: string; user: User }>('/login', { username, password });
    
    const { token, user } = res.data;
    
    // Persistir sesión en cliente
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    
    return { user };
  }

  async logout(): Promise<void> {
    // Limpiar sesión local
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
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
