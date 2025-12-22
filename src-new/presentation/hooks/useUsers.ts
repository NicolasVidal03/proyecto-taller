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
  const [users, setUsers] = useState<User[]>([]);
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
      const data = await container.users.getAll();
      setUsers(data);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'FETCH_ERROR' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtiene un usuario por ID
   */
  const fetchUserById = useCallback(async (id: number): Promise<User | null> => {
    setError(null);
    try {
      return await container.users.getById(id);
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

  /**
   * Actualiza un usuario existente
   */
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

  /**
   * Actualiza el estado de un usuario (borrado lógico)
   */
  const updateUserState = useCallback(async (id: number, state: boolean, currentUserId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.users.updateState(id, state, currentUserId);
      if (state) {
        // Reactivar: como no devuelve el usuario, recargamos o asumimos éxito
        // Para simplificar, recargamos la lista o actualizamos localmente si tuviéramos el objeto completo
        // Pero aquí solo tenemos ID. Mejor recargar lista o no hacer nada si es void.
        // Sin embargo, el backend devuelve 204.
        // Vamos a filtrar localmente si es desactivación.
        // Si es reactivación, necesitaríamos los datos, así que mejor fetchUsers.
        await fetchUsers(); 
      } else {
        // Desactivar: remover de lista de activos
        setUsers(prev => prev.filter(u => u.id !== id));
      }
      return true;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'UPDATE_STATE_ERROR' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    updateUserState,
    clearError,
  };
};
