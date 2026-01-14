import axios, { AxiosError } from 'axios';
import { env } from '../config/env';

export const http = axios.create({ 
  baseURL: env.apiBaseUrl,
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('auth_token_expires_at');
    if (expiresAt && Number(expiresAt) <= Date.now()) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token_expires_at');
      try {
        window.location.href = '/login';
      } catch (e) {
      }
      throw new axios.Cancel('Token expired');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('Sesión expirada o inválida');
    }
    return Promise.reject(error);
  }
);
