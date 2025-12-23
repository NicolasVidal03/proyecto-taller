import { useState, useCallback, useEffect } from 'react';
import { User } from '../../domain/entities/User';
import { CreateUserDTO, UpdateUserDTO } from '../../domain/ports/IUserRepository';
import { container } from '../../infrastructure/config/container';
import { userStore } from '../stores/userStore';


export interface UserError {
  message: string;
  code?: string;
  field?: string;
}

export interface UseUsersReturn {
  // Estado
  users: User[];
  isLoading: boolean;
  error: UserError | null;
  
  // Acciones CRUD
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<User | null>;
  createUser: (data: CreateUserDTO) => Promise<User | null>;
  updateUser: (id: number, data: UpdateUserDTO) => Promise<User | null>;
  updateUserState: (id: number, state: boolean, currentUserId: number) => Promise<boolean>;
  resetUserPassword: (id: number) => Promise<boolean>;
  
  // Utilidades
  clearError: () => void;
}


function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const axiosError = err as { response?: { data?: { message?: string; error?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    return err.message;
  }
  if (typeof err === 'string') return err;
  return 'Error desconocido';
}

/**
 * Hook personalizado para gestionar usuarios
 * Sigue el patrón de Clean Architecture accediendo al servicio via container
 */
export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>(userStore.getUsers());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UserError | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Obtiene todos los usuarios
   */
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await userStore.fetch();
      // userStore will notify subscribers
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'FETCH_ERROR' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = userStore.subscribe(setUsers);
    return () => unsubscribe();
  }, []);

  /**
   * Obtiene un usuario por ID
   */
  const fetchUserById = useCallback(async (id: number): Promise<User | null> => {
    setError(null);
    try {
      // ensure we have latest users
      const list = await userStore.fetch();
      return list.find(u => u.id === id) ?? null;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'FETCH_BY_ID_ERROR' });
      return null;
    }
  }, []);

  /**
   * Crea un nuevo usuario
   */
  const createUser = useCallback(async (data: CreateUserDTO): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await userStore.create(data as any);
      return newUser;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'CREATE_ERROR' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualiza un usuario existente
   */
  const updateUser = useCallback(async (id: number, data: UpdateUserDTO): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await userStore.update(id, data as any);
      return updated;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'UPDATE_ERROR' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualiza el estado de un usuario (borrado lógico)
   */
  const updateUserState = useCallback(async (id: number, state: boolean, currentUserId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userStore.updateState(id, state, currentUserId);
      return res;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'UPDATE_STATE_ERROR' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  const resetUserPassword = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await userStore.resetPassword(id);
      return true;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'RESET_PASSWORD_ERROR' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    updateUserState,
    resetUserPassword,
    clearError,
  };
};
