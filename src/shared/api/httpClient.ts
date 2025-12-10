import axios, { AxiosError } from 'axios';
import { ENV } from '@shared/config/env';
import { getToken } from '@modules/auth/services/tokenStorage';

export const http = axios.create({ baseURL: ENV.API_BASE_URL });

let inMemoryToken: string | null = null;

export function setStaticToken(token: string | null) {
  inMemoryToken = token;
}

http.interceptors.request.use(config => {
  const token = inMemoryToken || getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('Sesión expirada');
    }
    return Promise.reject(error);
  }
);
