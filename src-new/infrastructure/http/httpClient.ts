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
