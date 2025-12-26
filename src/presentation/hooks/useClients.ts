import { useState, useCallback } from 'react';
import { Client } from '../../domain/entities/Client';
import { CreateClientDTO, UpdateClientDTO } from '../../domain/ports/IClientRepository';
import { container } from '../../infrastructure/config/container';

export interface ClientError {
  message: string;
  code?: string;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    return err.message;
  }
  if (typeof err === 'string') return err;
  return 'Error desconocido';
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ClientError | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const clearError = useCallback(() => setError(null), []);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await container.clients.listPaginated();
      setClients(result);
      setTotal(result.length);
      setCurrentPage(1);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'FETCH_ERROR' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createClient = useCallback(async (data: CreateClientDTO): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newClient = await container.clients.create(data);
      return newClient;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'CREATE_ERROR' });
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
      const message = extractErrorMessage(err);
      setError({ message, code: 'UPDATE_ERROR' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateClientArea = useCallback(async (id: number, areaId: number): Promise<boolean> => {
    setError(null);
    try {
      await container.clients.updateArea(id, areaId);
      // Actualizar en la lista local
      setClients(prev => prev.map(c => c.id === id ? { ...c, areaId } : c));
      return true;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'UPDATE_AREA_ERROR' });
      return false;
    }
  }, []);

  const deleteClient = useCallback(async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await container.clients.softDelete(id);
      // Actualizar en la lista local (soft delete cambia estado o elimina?)
      // Asumiendo soft delete que cambia estado, recargamos o actualizamos
      // Si el backend devuelve void, asumimos éxito.
      // Si es soft delete real (cambia status a false), deberíamos actualizar el objeto en local.
      // Pero como no retorna el objeto actualizado, lo mejor es refetch o actualizar manualmente si sabemos la lógica.
      // Si el backend hace toggle, necesitamos saber el nuevo estado.
      // Revisando ClientController.softDelete: devuelve { message: "Eliminado" } si ok.
      // Asumiremos que lo quita de la lista o lo marca inactivo.
      // Si queremos mostrar inactivos, actualizamos el status.
      // Vamos a hacer refetch para estar seguros o actualizar localmente invirtiendo el status si tuvieramos el cliente.
      // Como solo tenemos ID, busquemos el cliente actual para invertir su status visualmente.
      setClients(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, status: !c.status }; // Toggle optimista
        }
        return c;
      }));
      return true;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'DELETE_ERROR' });
      return false;
    }
  }, []);

  return {
    clients,
    isLoading,
    error,
    total,
    currentPage,
    fetchClients,
    createClient,
    updateClient,
    updateClientArea,
    deleteClient,
    clearError,
  };
};
