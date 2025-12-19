import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '../../domain/entities/User';
import { container } from '../../infrastructure/config/container';

export interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await container.auth.getCurrentUser();
        setUser(profile);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await container.auth.login(username, password);
      if (result.success && result.user) {
        setUser(result.user);
        return true;
      } else {
        setError(result.error || 'Error al iniciar sesión');
        setUser(null);
        return false;
      }
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión');
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await container.auth.logout();
    setUser(null);
    setError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await container.auth.getCurrentUser();
    setUser(profile);
    return profile;
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

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
