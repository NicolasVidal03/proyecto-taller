import { useState, useCallback, useMemo } from 'react';
import { Client } from '../../domain/entities/Client';
import { CreateClientDTO, UpdateClientDTO, ClientSearchParams } from '../../domain/ports/IClientRepository';
import { container } from '../../infrastructure/config/container';
import { extractErrorMessage, AppError } from './shared';

export interface UseClientsReturn {
  // Datos
  clients: Client[];
  clientMap: Map<number, Client>;
  total: number;
  currentPage: number;
  
  // Estado
  isLoading: boolean;
  error: AppError | null;
  
  // Operaciones
  fetchClients: () => Promise<void>;
  createClient: (data: CreateClientDTO) => Promise<Client | null>;
  updateClient: (id: number, data: UpdateClientDTO) => Promise<Client | null>;
  deleteClient: (id: number) => Promise<boolean>;
  searchClients: (params: ClientSearchParams) => Promise<Client[]>;
  
  // Utilidades
  getClientName: (id: number | null | undefined) => string;
  clearError: () => void;
}

export const useClients = (): UseClientsReturn => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Mapa de clientes para búsqueda rápida
  const clientMap = useMemo(() => {
    return new Map(clients.map(c => [c.id, c]));
  }, [clients]);

  const getClientName = useCallback((id: number | null | undefined): string => {
    if (id == null) return 'Sin cliente';
    const client = clientMap.get(id);
    return client ? `${client.name} ${client.lastName}` : 'Desconocido';
  }, [clientMap]);

  const clearError = useCallback(() => setError(null), []);

  // ========== CRUD ==========

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await container.clients.listPaginated();
      setClients(result);
      setTotal(result.length);
      setCurrentPage(1);
    } catch (err) {
      setError({ message: extractErrorMessage(err), code: 'FETCH_ERROR' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createClient = useCallback(async (data: CreateClientDTO): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newClient = await container.clients.create(data);
      setClients(prev => [...prev, newClient]);
      setTotal(prev => prev + 1);
      return newClient;
    } catch (err) {
      setError({ message: extractErrorMessage(err), code: 'CREATE_ERROR' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateClient = useCallback(async (id: number, data: UpdateClientDTO): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedClient = await container.clients.update(id, data);
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      return updatedClient;
    } catch (err) {
      setError({ message: extractErrorMessage(err), code: 'UPDATE_ERROR' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteClient = useCallback(async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await container.clients.softDelete(id);
      setClients(prev => prev.filter(c => c.id !== id));
      setTotal(prev => prev - 1);
      return true;
    } catch (err) {
      setError({ message: extractErrorMessage(err), code: 'DELETE_ERROR' });
      return false;
    }
  }, []);

  // ========== Búsqueda ==========

  const searchClients = useCallback(async (params: ClientSearchParams): Promise<Client[]> => {
    try {
      return await container.clients.search(params);
    } catch (err) {
      console.error('Error buscando clientes:', extractErrorMessage(err));
      return [];
    }
  }, []);

  return {
    clients,
    clientMap,
    total,
    currentPage,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    getClientName,
    clearError,
  };
};
