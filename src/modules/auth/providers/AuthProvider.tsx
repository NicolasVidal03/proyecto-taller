import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearToken, getToken, setToken } from '@modules/auth/services/tokenStorage';
import { setStaticToken } from '@shared/api/httpClient';
import { AuthUser } from '@shared/types/auth';
import { getMe, login as authenticate } from '@modules/auth/api/authApi';
import { ENV } from '@shared/config/env';
// Auth0 removed: use backend local login only

export type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  error: string | null;
  login: (ci: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const auth0Enabled = false;
  const auth0 = null;

  const bootstrap = useCallback(async () => {
    const storedToken = getToken();
    if (!storedToken) {
      setStaticToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    setStaticToken(storedToken);
    try {
      const profile = await getMe();
      setUser(profile);
    } catch (err) {
      console.warn('No se pudo validar la sesión existente', err);
      clearToken();
      setStaticToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticate(username, password);
      setToken(response.access_token);
      setStaticToken(response.access_token);
      try {
        const profile = await getMe();
        setUser(profile);
      } catch (profileError) {
        console.warn('No se pudo cargar el perfil después del login', profileError);
        setUser(response.user);
      }
    } catch (err: any) {
      const message = err?.response?.data?.error || 'No se pudo iniciar sesión';
      setError(message);
      clearToken();
      setStaticToken(null);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setStaticToken(null);
    setUser(null);
    setError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getMe();
      setUser(profile);
      return profile;
    } catch (err) {
      console.warn('No se pudo refrescar el perfil', err);
      return null;
    }
  }, []);

  const isAuthenticated = Boolean(user);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      error,
      login,
      logout,
      refreshProfile,
    }),
    [isLoading, isAuthenticated, user, error, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
