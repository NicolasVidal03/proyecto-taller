import { useState, useCallback } from 'react';

export interface EntityModalState<T> {
  isOpen: boolean;
  mode: 'create' | 'edit';
  entity: T | null;
  isSubmitting: boolean;
}

export interface UseEntityModalReturn<T> {
  modalState: EntityModalState<T>;
  openCreate: () => void;
  openEdit: (entity: T) => void;
  close: () => void;
  setSubmitting: (submitting: boolean) => void;
}

export function useEntityModal<T>(): UseEntityModalReturn<T> {
  const [modalState, setModalState] = useState<EntityModalState<T>>({
    isOpen: false,
    mode: 'create',
    entity: null,
    isSubmitting: false,
  });

  const openCreate = useCallback(() => {
    setModalState({
      isOpen: true,
      mode: 'create',
      entity: null,
      isSubmitting: false,
    });
  }, []);

  const openEdit = useCallback((entity: T) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      entity,
      isSubmitting: false,
    });
  }, []);

  const close = useCallback(() => {
    setModalState(prev => {
      if (prev.isSubmitting) return prev;
      return {
        isOpen: false,
        mode: 'create',
        entity: null,
        isSubmitting: false,
      };
    });
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setModalState(prev => ({ ...prev, isSubmitting: submitting }));
  }, []);

  return {
    modalState,
    openCreate,
    openEdit,
    close,
    setSubmitting,
  };
}
