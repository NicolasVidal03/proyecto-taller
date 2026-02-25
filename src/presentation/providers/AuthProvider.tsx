import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '../../domain/entities/User';
import { container } from '../../infrastructure/config/container';
import ForcePasswordChangeModal from '../components/auth/ForcePasswordChangeModal';

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

  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [passwordChangeSubmitting, setPasswordChangeSubmitting] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await container.auth.getCurrentUser();
        setUser(profile);
        if (profile && profile.isFirstLogin) {
          setShowPasswordChangeModal(true);
        }
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
        if (result.user.isFirstLogin) {
          setShowPasswordChangeModal(true);
        }
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
    setShowPasswordChangeModal(false);
    setPasswordChangeError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await container.auth.getCurrentUser();
    setUser(profile);
    return profile;
  }, []);

  const handlePasswordChange = useCallback(async (currentPassword: string, newPassword: string) => {
    setPasswordChangeSubmitting(true);
    setPasswordChangeError(null);
    try {
      await container.user.changeFirstLoginPassword(currentPassword, newPassword);
      if (user) {
        setUser(prev => {
          if (!prev) return prev;
          const updated = { ...prev, isFirstLogin: false };
          // localStorage.setItem("auth_user", JSON.stringify(updated));
          container.auth.updateUser(JSON.stringify(updated))
          return updated;
        });
      }
      setShowPasswordChangeModal(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Error al cambiar la contraseña';
      setPasswordChangeError(message);
    } finally {
      setPasswordChangeSubmitting(false);
    }
  }, [user]);



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

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ForcePasswordChangeModal
        open={showPasswordChangeModal && isAuthenticated}
        submitting={passwordChangeSubmitting}
        error={passwordChangeError}
        onSubmit={handlePasswordChange}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
