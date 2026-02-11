import React, { useMemo, useEffect } from 'react';
import { useUsers } from '../../../hooks/useUsers';
import { useAuth } from '../../../providers/AuthProvider';
import { User } from '../../../../domain/entities/User';
import { Branch } from '../../../../domain/entities/Branch';
import { BranchMap } from '../../../utils/branchHelpers';
import UsersTable from '../UsersTable';
import UserFormModal, { UserFormValues } from '../UserFormModal';
import ConfirmDialog from '../../shared/ConfirmDialog';
import Loader from '../../shared/Loader';
import Pagination from '../../shared/Pagination';
import { useEntityModal, useConfirmDialog, useListPagination } from '../../../hooks/shared';

interface UsersSectionProps {
  searchTerm: string;
  roleFilter: string;
  branches: Branch[];
  branchMap: BranchMap;
  branchesLoading: boolean;
  onToast: (type: 'success' | 'error', message: string) => void;
}

export const UsersSection: React.FC<UsersSectionProps> = ({
  searchTerm,
  roleFilter,
  branches,
  branchMap,
  branchesLoading,
  onToast,
}) => {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    updateUserState,
    resetUserPassword,
    clearError,
  } = useUsers();

  const auth = useAuth();
  const modal = useEntityModal<User>();
  const confirm = useConfirmDialog<User>();
  const resetConfirm = useConfirmDialog<User>();

  const filteredUsers = useMemo(() => {
    const safeUsers: User[] = Array.isArray(users) ? users.filter(Boolean) : [];
    const term = searchTerm.trim().toLowerCase();
    const filtered = safeUsers.filter(user => {
      const matchesSearch =
        term.length === 0 ||
        (user.userName ?? '').toLowerCase().includes(term) ||
        `${user.names ?? ''} ${user.lastName ?? ''}`.toLowerCase().includes(term) ||
        (user.secondLastName ?? '').toLowerCase().includes(term);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
    return [...filtered].sort((a, b) => {
      const aLast = (a.lastName || '').toLowerCase();
      const bLast = (b.lastName || '').toLowerCase();
      if (aLast !== bLast) return aLast.localeCompare(bLast);
      const aSecond = (a.secondLastName || '').toLowerCase();
      const bSecond = (b.secondLastName || '').toLowerCase();
      if (aSecond !== bSecond) return aSecond.localeCompare(bSecond);
      return (a.names || '').toLowerCase().localeCompare((b.names || '').toLowerCase());
    });
  }, [roleFilter, searchTerm, users]);

  const pagination = useListPagination(filteredUsers, { pageSize: 10 });

  useEffect(() => {
    pagination.resetToFirstPage();
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (error) {
      onToast('error', error.message);
      clearError();
    }
  }, [error, onToast, clearError]);

  const handleSubmit = async (values: UserFormValues) => {
    if (!auth.user) return;
    modal.setSubmitting(true);
    try {
      if (modal.modalState.mode === 'create') {
        const result = await createUser({
          ci: values.ci,
          names: values.names,
          lastName: values.lastName,
          secondLastName: values.secondLastName ?? null,
          role: values.role,
          branchId: values.branchId,
          email: values.email,
        });
        if (result) {
          onToast('success', 'Usuario creado correctamente. Las credenciales se enviarán por correo.');
          modal.close();
        }
      } else if (modal.modalState.entity) {
        const result = await updateUser(modal.modalState.entity.id, {
          ci: values.ci,
          names: values.names,
          lastName: values.lastName,
          secondLastName: values.secondLastName ?? null,
          role: values.role,
          branchId: values.branchId,
          email: values.email || undefined,
        });
        if (result) {
          onToast('success', 'Usuario actualizado correctamente');
          modal.close();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el usuario';
      onToast('error', message);
    } finally {
      modal.setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirm.dialogState.entity || !auth.user) return;
    const user = confirm.dialogState.entity;

    await confirm.executeWithLoading(async () => {
      const success = await updateUserState(user.id, false, auth.user!.id);
      if (success) {
        onToast('success', `Usuario "${user.userName}" eliminado correctamente`);
      }
    }, user.id);
  };

  const handleResetPassword = async () => {
    if (!resetConfirm.dialogState.entity) return;
    const user = resetConfirm.dialogState.entity;

    await resetConfirm.executeWithLoading(async () => {
      const ok = await resetUserPassword(user.id);
      if (ok) {
        onToast('success', `Contraseña reseteada para ${user.userName}`);
      } else {
        throw new Error('No se pudo resetear la contraseña');
      }
    }, user.id);
  };

  const busyUserId = confirm.busyId ?? resetConfirm.busyId;

  return (
    <div className="card shadow-xl ring-1 ring-black/5">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-900">Listado de usuarios</h3>
          <p className="text-sm text-lead-500">{filteredUsers.length} usuario(s) coinciden con el filtro.</p>
        </div>
        <button
          type="button"
          className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2"
          onClick={modal.openCreate}
        >
          Crear usuario
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <UsersTable
            users={pagination.paginatedItems}
            branchMap={branchMap}
            currentUserRole={auth.user?.role || ''}
            onEdit={modal.openEdit}
            onDeactivate={confirm.openConfirm}
            onResetPassword={resetConfirm.openConfirm}
            showResetButton={true}
            busyUserId={busyUserId}
          />
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={10}
              onPageChange={pagination.setPage}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      <UserFormModal
        open={modal.modalState.isOpen}
        mode={modal.modalState.mode}
        initialUser={modal.modalState.entity}
        submitting={modal.modalState.isSubmitting}
        branches={branches}
        branchesLoading={branchesLoading}
        onClose={modal.close}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.dialogState.isOpen}
        title="Eliminar usuario"
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={confirm.closeConfirm}
        disabled={confirm.dialogState.isLoading}
      />

      <ConfirmDialog
        open={resetConfirm.dialogState.isOpen}
        title="Resetear contraseña"
        description={resetConfirm.dialogState.entity ? `¿Quieres resetear la contraseña de "${resetConfirm.dialogState.entity.userName}"?` : ''}
        confirmLabel="Sí"
        cancelLabel="No"
        onConfirm={handleResetPassword}
        onCancel={resetConfirm.closeConfirm}
        disabled={resetConfirm.dialogState.isLoading}
      />
    </div>
  );
};

export default UsersSection;
