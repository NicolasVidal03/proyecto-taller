import { useState, useCallback } from 'react';
import { User } from '../../domain/entities/User';
import { CreateUserDTO, UpdateUserDTO } from '../../domain/ports/IUserRepository';
import { container } from '../../infrastructure/config/container';


export interface UserError {
  message: string;
  code?: string;
  field?: string;
}

export interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: UserError | null;
  
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<User | null>;
  createUser: (data: CreateUserDTO) => Promise<User | null>;
  updateUser: (id: number, data: UpdateUserDTO) => Promise<User | null>;
  updateUserState: (id: number, state: boolean, currentUserId: number) => Promise<boolean>;
  resetUserPassword: (id: number) => Promise<boolean>;
  updateUserPassword: (id: number, newPassword: string) => Promise<boolean>;
  
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


export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UserError | null>(null);

  const clearError = useCallback(() => setError(null), []);

  
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.users.getAll();
      setUsers(data);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'FETCH_ERROR' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserById = useCallback(async (id: number): Promise<User | null> => {
    setError(null);
    try {
      const allUsers = await container.users.getAll();
      return allUsers.find(u => u.id === id) ?? null;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'FETCH_BY_ID_ERROR' });
      return null;
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserDTO): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await container.users.create(data);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'CREATE_ERROR' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: number, data: UpdateUserDTO): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.users.update(id, data);
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
      return updated;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'UPDATE_ERROR' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

 
  const updateUserState = useCallback(async (id: number, state: boolean, currentUserId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.users.updateState(id, state, currentUserId);
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'UPDATE_STATE_ERROR' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetUserPassword = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.users.resetPassword(id);
      return true;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'RESET_PASSWORD_ERROR' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserPassword = useCallback(async (id: number, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.users.updatePassword(id, newPassword);
      return true;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'UPDATE_PASSWORD_ERROR' });
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
    updateUserPassword,
    clearError,
  };
};
