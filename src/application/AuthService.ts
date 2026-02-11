import { User } from '../domain/entities/User';

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface IAuthRepository {
  login(username: string, password: string): Promise<{ user: User }>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
}

export class AuthService {
  constructor(private authRepo: IAuthRepository) {}

  async login(username: string, password: string): Promise<LoginResult> {
    try {
      const result = await this.authRepo.login(username, password);
      return { success: true, user: result.user };
    } catch (err: any) {
      return { 
        success: false, 
        error: err?.response?.data?.error || err?.message || 'Error al iniciar sesión' 
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authRepo.logout();
    } catch {
     
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.authRepo.getMe();
    } catch {
      return null;
    }
  }
}
