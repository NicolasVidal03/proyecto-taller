import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from '@presentation/hooks/useDebounce';
import { useListPagination } from '@presentation/hooks/shared/useListPagination';
import { useEntityModal } from '@presentation/hooks/shared/useEntityModal';
import { useConfirmDialog } from '@presentation/hooks/shared/useConfirmDialog';


describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('retorna el valor inicial sin esperar', () => {
    const { result } = renderHook(() => useDebounce('hola', 500));
    expect(result.current).toBe('hola');
  });

  it('no actualiza el valor antes de que pase el delay', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebounce(v, 500),
      { initialProps: { v: 'hola' } }
    );
    rerender({ v: 'mundo' });
    act(() => { jest.advanceTimersByTime(400); });
    expect(result.current).toBe('hola');
  });

  it('actualiza el valor exactamente al cumplirse el delay', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebounce(v, 500),
      { initialProps: { v: 'hola' } }
    );
    rerender({ v: 'mundo' });
    act(() => { jest.advanceTimersByTime(500); });
    expect(result.current).toBe('mundo');
  });

  it('cancela el timer anterior si el valor cambia antes del delay', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebounce(v, 500),
      { initialProps: { v: 'a' } }
    );
    rerender({ v: 'b' });
    act(() => { jest.advanceTimersByTime(300); });
    rerender({ v: 'c' });
    act(() => { jest.advanceTimersByTime(500); });
    expect(result.current).toBe('c');
  });

  it('usa 500ms como delay por defecto', () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: number }) => useDebounce(v),
      { initialProps: { v: 1 } }
    );
    rerender({ v: 2 });
    act(() => { jest.advanceTimersByTime(499); });
    expect(result.current).toBe(1);
    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current).toBe(2);
  });
});




const items25 = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

describe('useListPagination', () => {
  it('inicializa en la página 1 con los primeros N items', () => {
    const { result } = renderHook(() => useListPagination(items25, { pageSize: 10 }));
    expect(result.current.page).toBe(1);
    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.paginatedItems[0].id).toBe(1);
  });

  it('calcula el total de páginas correctamente', () => {
    const { result } = renderHook(() => useListPagination(items25, { pageSize: 10 }));
    expect(result.current.totalPages).toBe(3);
  });

  it('totalItems refleja el tamaño total del array', () => {
    const { result } = renderHook(() => useListPagination(items25, { pageSize: 10 }));
    expect(result.current.totalItems).toBe(25);
  });

  it('setPage navega a la página indicada', () => {
    const { result } = renderHook(() => useListPagination(items25, { pageSize: 10 }));
    act(() => { result.current.setPage(2); });
    expect(result.current.page).toBe(2);
    expect(result.current.paginatedItems[0].id).toBe(11);
  });

  it('la última página puede tener menos items que pageSize', () => {
    const { result } = renderHook(() => useListPagination(items25, { pageSize: 10 }));
    act(() => { result.current.setPage(3); });
    expect(result.current.paginatedItems).toHaveLength(5);
  });

  it('resetToFirstPage vuelve a la página 1', () => {
    const { result } = renderHook(() => useListPagination(items25, { pageSize: 10 }));
    act(() => { result.current.setPage(3); });
    act(() => { result.current.resetToFirstPage(); });
    expect(result.current.page).toBe(1);
  });

  it('ajusta la página automáticamente si supera totalPages al cambiar items', async () => {
    const { result, rerender } = renderHook(
      ({ list }: { list: typeof items25 }) => useListPagination(list, { pageSize: 10 }),
      { initialProps: { list: items25 } }
    );
    act(() => { result.current.setPage(3); });
    rerender({ list: items25.slice(0, 5) });
    await waitFor(() => { expect(result.current.page).toBe(1); });
  });

  it('funciona correctamente con array vacío', () => {
    const { result } = renderHook(() => useListPagination([]));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedItems).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });
});




type TestEntity = { id: number; name: string };

describe('useEntityModal', () => {
  it('estado inicial: cerrado, modo create, sin entidad', () => {
    const { result } = renderHook(() => useEntityModal<TestEntity>());
    expect(result.current.modalState).toEqual({
      isOpen: false, mode: 'create', entity: null, isSubmitting: false,
    });
  });

  it('openCreate abre el modal en modo create sin entidad', () => {
    const { result } = renderHook(() => useEntityModal<TestEntity>());
    act(() => { result.current.openCreate(); });
    expect(result.current.modalState.isOpen).toBe(true);
    expect(result.current.modalState.mode).toBe('create');
    expect(result.current.modalState.entity).toBeNull();
  });

  it('openEdit abre el modal en modo edit con la entidad correcta', () => {
    const { result } = renderHook(() => useEntityModal<TestEntity>());
    const entity: TestEntity = { id: 1, name: 'Test' };
    act(() => { result.current.openEdit(entity); });
    expect(result.current.modalState.isOpen).toBe(true);
    expect(result.current.modalState.mode).toBe('edit');
    expect(result.current.modalState.entity).toEqual(entity);
  });

  it('close cierra el modal y resetea el estado', () => {
    const { result } = renderHook(() => useEntityModal<TestEntity>());
    act(() => { result.current.openCreate(); });
    act(() => { result.current.close(); });
    expect(result.current.modalState.isOpen).toBe(false);
    expect(result.current.modalState.entity).toBeNull();
  });

  it('close NO cierra el modal si isSubmitting es true', () => {
    const { result } = renderHook(() => useEntityModal<TestEntity>());
    act(() => { result.current.openCreate(); });
    act(() => { result.current.setSubmitting(true); });
    act(() => { result.current.close(); });
    expect(result.current.modalState.isOpen).toBe(true);
  });

  it('setSubmitting actualiza el flag correctamente', () => {
    const { result } = renderHook(() => useEntityModal<TestEntity>());
    act(() => { result.current.setSubmitting(true); });
    expect(result.current.modalState.isSubmitting).toBe(true);
    act(() => { result.current.setSubmitting(false); });
    expect(result.current.modalState.isSubmitting).toBe(false);
  });
});




type Confirmable = { id: number; label: string };

describe('useConfirmDialog', () => {
  it('estado inicial: diálogo cerrado, sin entidad ni busyId', () => {
    const { result } = renderHook(() => useConfirmDialog<Confirmable>());
    expect(result.current.dialogState).toEqual({ isOpen: false, entity: null, isLoading: false });
    expect(result.current.busyId).toBeNull();
  });

  it('openConfirm abre el diálogo con la entidad correcta', () => {
    const { result } = renderHook(() => useConfirmDialog<Confirmable>());
    act(() => { result.current.openConfirm({ id: 5, label: 'X' }); });
    expect(result.current.dialogState.isOpen).toBe(true);
    expect(result.current.dialogState.entity).toEqual({ id: 5, label: 'X' });
  });

  it('closeConfirm cierra el diálogo cuando no está cargando', () => {
    const { result } = renderHook(() => useConfirmDialog<Confirmable>());
    act(() => { result.current.openConfirm({ id: 1, label: 'X' }); });
    act(() => { result.current.closeConfirm(); });
    expect(result.current.dialogState.isOpen).toBe(false);
    expect(result.current.dialogState.entity).toBeNull();
  });

  it('executeWithLoading ejecuta la acción, limpia busyId y cierra el diálogo', async () => {
    const { result } = renderHook(() => useConfirmDialog<Confirmable>());
    const action = jest.fn().mockResolvedValue(undefined);

    act(() => { result.current.openConfirm({ id: 3, label: 'Y' }); });
    await act(async () => { await result.current.executeWithLoading(action, 3); });

    expect(action).toHaveBeenCalledTimes(1);
    expect(result.current.dialogState.isOpen).toBe(false);
    expect(result.current.busyId).toBeNull();
  });

  it('closeConfirm NO cierra cuando isLoading es true', async () => {
    const { result } = renderHook(() => useConfirmDialog<Confirmable>());
    let resolveAction!: () => void;
    const action = jest.fn().mockReturnValue(
      new Promise<void>((res) => { resolveAction = res; })
    );

    act(() => { result.current.openConfirm({ id: 2, label: 'W' }); });
    act(() => { result.current.executeWithLoading(action, 2); }); // no await
    act(() => { result.current.closeConfirm(); });

    expect(result.current.dialogState.isOpen).toBe(true);

    await act(async () => { resolveAction(); }); // limpiar
  });
});
