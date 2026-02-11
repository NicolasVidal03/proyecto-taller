import { useState, useCallback } from 'react';

export interface ConfirmDialogState<T> {
  isOpen: boolean;
  entity: T | null;
  isLoading: boolean;
}

export interface UseConfirmDialogReturn<T> {
  dialogState: ConfirmDialogState<T>;
  busyId: number | null;
  openConfirm: (entity: T) => void;
  closeConfirm: () => void;
  executeWithLoading: (action: () => Promise<void>, entityId: number) => Promise<void>;
}

export function useConfirmDialog<T extends { id: number }>(): UseConfirmDialogReturn<T> {
  const [dialogState, setDialogState] = useState<ConfirmDialogState<T>>({
    isOpen: false,
    entity: null,
    isLoading: false,
  });

  const [busyId, setBusyId] = useState<number | null>(null);

  const openConfirm = useCallback((entity: T) => {
    setDialogState({
      isOpen: true,
      entity,
      isLoading: false,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setDialogState(prev => {
      if (prev.isLoading) return prev;
      return {
        isOpen: false,
        entity: null,
        isLoading: false,
      };
    });
  }, []);

  const executeWithLoading = useCallback(async (action: () => Promise<void>, entityId: number) => {
    setDialogState(prev => ({ ...prev, isLoading: true }));
    setBusyId(entityId);
    try {
      await action();
      setDialogState({
        isOpen: false,
        entity: null,
        isLoading: false,
      });
    } finally {
      setDialogState(prev => ({ ...prev, isLoading: false }));
      setBusyId(null);
    }
  }, []);

  return {
    dialogState,
    busyId,
    openConfirm,
    closeConfirm,
    executeWithLoading,
  };
}
