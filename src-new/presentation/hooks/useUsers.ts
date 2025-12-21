import { useState, useCallback } from 'react';
import { User } from '../../domain/entities/User';
import { CreateUserDTO, UpdateUserDTO } from '../../domain/ports/IUserRepository';
import { container } from '../../infrastructure/config/container';

export interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<User | null>;
  createUser: (data: CreateUserDTO) => Promise<User | null>;
  updateUser: (id: number, data: UpdateUserDTO) => Promise<User | null>;
  updateUserState: (id: number, state: boolean) => Promise<boolean>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.users.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserById = useCallback(async (id: number): Promise<User | null> => {
    setError(null);
    try {
      return await container.users.getById(id);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar usuario');
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
    } catch (err: any) {
      setError(err?.message || 'Error al crear usuario');
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
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar usuario');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserState = useCallback(async (id: number, state: boolean): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.users.updateState(id, state);
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar estado');
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
  };
};
