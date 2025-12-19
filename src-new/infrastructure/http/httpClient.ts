import axios, { AxiosError } from 'axios';
import { env } from '../config/env';

export const http = axios.create({ 
  baseURL: env.apiBaseUrl,
  withCredentials: true
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
