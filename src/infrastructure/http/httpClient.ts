import axios, { AxiosError } from 'axios';
import { env } from '../config/env';

export const http = axios.create({ 
  baseURL: env.apiBaseUrl,
  // withCredentials: true // Deshabilitado porque usamos JWT en headers
});

// Interceptor para inyectar el token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('auth_token_expires_at');
    if (expiresAt && Number(expiresAt) <= Date.now()) {
      // Token expirado: limpiar sesión y redirigir al login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token_expires_at');
      try {
        // Redirigir a login para que el usuario re-autentique
        window.location.href = '/login';
      } catch (e) {
        // ignore during SSR or tests
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
      // Opcional: Limpiar storage y redirigir si es 401
      // localStorage.removeItem('auth_token');
      // localStorage.removeItem('auth_user');
    }
    return Promise.reject(error);
  }
);
