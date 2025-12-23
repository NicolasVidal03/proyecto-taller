import { useState, useCallback } from 'react';
import { Supplier } from '../../domain/entities/Supplier';
import { CreateSupplierDTO, UpdateSupplierDTO } from '../../domain/ports/ISupplierRepository';
import { container } from '../../infrastructure/config/container';

export interface UseSuppliersReturn {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  fetchSuppliers: () => Promise<void>;
  fetchSupplierById: (id: number) => Promise<Supplier | null>;
  createSupplier: (data: CreateSupplierDTO, userId?: number) => Promise<Supplier | null>;
  updateSupplier: (id: number, data: UpdateSupplierDTO, userId?: number) => Promise<Supplier | null>;
  updateSupplierState: (id: number, state: boolean, userId?: number) => Promise<boolean>;
  deleteSupplier: (id: number) => Promise<boolean>;
}

export const useSuppliers = (): UseSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.suppliers.getAll();
      setSuppliers(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar proveedores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSupplierById = useCallback(async (id: number): Promise<Supplier | null> => {
    setError(null);
    try {
      return await container.suppliers.getById(id);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar proveedor');
      return null;
    }
  }, []);

  const createSupplier = useCallback(async (data: CreateSupplierDTO, userId?: number): Promise<Supplier | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newSupplier = await container.suppliers.create({ ...data, userId });
      setSuppliers(prev => [...prev, newSupplier]);
      return newSupplier;
    } catch (err: any) {
      setError(err?.message || 'Error al crear proveedor');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSupplier = useCallback(async (id: number, data: UpdateSupplierDTO, userId?: number): Promise<Supplier | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.suppliers.update(id, { ...data, userId });
      setSuppliers(prev => prev.map(s => (s.id === id ? updated : s)));
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar proveedor');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSupplierState = useCallback(async (id: number, state: boolean, userId?: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.suppliers.updateState(id, state);
      setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, state } : s)));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar estado');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSupplier = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.suppliers.delete(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar proveedor');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    suppliers,
    isLoading,
    error,
    fetchSuppliers,
    fetchSupplierById,
    createSupplier,
    updateSupplier,
    updateSupplierState,
    deleteSupplier,
  };
};
