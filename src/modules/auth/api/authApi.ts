import { http } from '@shared/api/httpClient';
import { AuthLoginResponse, AuthUser } from '@shared/types/auth';

type MeResponse = AuthUser & { auth_user_id?: string };

export async function login(username: string, password: string): Promise<AuthLoginResponse> {
  const res = await http.post('/auth/login', { username, password });
  return res.data;
}

export async function getMe(): Promise<MeResponse> {
  const res = await http.get('/auth/me');
  return res.data;
}
