import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useBranches } from '../hooks/useBranches';
import { useAuth } from '../providers/AuthProvider';
import { User } from '../../domain/entities/User';
import { Branch } from '../../domain/entities/Branch';
import Loader from '../components/shared/Loader';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { ToastContainer, useToast } from '../components/shared/Toast';
import UsersTable from '../components/users/UsersTable';
import UserFormModal, { UserFormValues } from '../components/users/UserFormModal';
import BranchesTable from '../components/branches/BranchesTable';
import BranchFormModal, { BranchFormValues } from '../components/branches/BranchFormModal';

type RoleFilter = 'all' | 'admin' | 'prevendedor' | 'transportista';

const ROLE_FILTERS: Array<{ value: RoleFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'admin', label: 'Administradores' },
  { value: 'prevendedor', label: 'Prevendedores' },
  { value: 'transportista', label: 'Transportistas' },
];

export const UsersPage: React.FC = () => {
  // Hooks de datos
  const {
    users,
    isLoading: usersLoading,
    error: usersError,
    fetchUsers,
    createUser,
    updateUser,
    updateUserState,
    resetUserPassword,
    clearError: clearUsersError,
  } = useUsers();

  const {
    branches,
    branchMap,
    isLoading: branchesLoading,
    error: branchesError,
    fetchBranches,
    createBranch,
    updateBranch,
    updateBranchState,
  } = useBranches();

  // Toast para feedback visual
  const toast = useToast();

  // Estados UI
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetConfirmLoading, setResetConfirmLoading] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [activeSection, setActiveSection] = useState<'users' | 'branches'>('users');

  // Estado para sucursales
  const [branchFormOpen, setBranchFormOpen] = useState(false);
  const [branchFormMode, setBranchFormMode] = useState<'create' | 'edit'>('create');
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchSubmitting, setBranchSubmitting] = useState(false);
  const [branchConfirmOpen, setBranchConfirmOpen] = useState(false);
  const [branchConfirmLoading, setBranchConfirmLoading] = useState(false);
  const [targetBranch, setTargetBranch] = useState<Branch | null>(null);

  // Cargar datos al montar
  const loadData = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchBranches()]);
  }, [fetchUsers, fetchBranches]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mostrar errores como toast
  useEffect(() => {
    if (usersError) {
      toast.error(usersError.message);
      clearUsersError();
    }
  }, [usersError, toast, clearUsersError]);

  useEffect(() => {
    if (branchesError) {
      toast.error(`Error cargando sucursales: ${branchesError.message}`);
    }
  }, [branchesError, toast]);

  const auth = useAuth();
  const canResetPassword = auth.user?.role === 'admin' || auth.user?.role === 'super_admin';

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter(user => {
      const matchesSearch =
        term.length === 0 ||
        user.userName.toLowerCase().includes(term) ||
        `${user.names} ${user.lastName}`.toLowerCase().includes(term) ||
        (user.secondLastName ?? '').toLowerCase().includes(term);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, searchTerm, users]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(user => user.role === 'admin').length;
    const sellers = users.filter(user => user.role === 'prevendedor').length;
    const drivers = users.filter(user => user.role === 'transportista').length;
    return {
      cards: [
        { label: 'Total de usuarios', value: total, accent: 'from-brand-900 to-brand-600' },
        { label: 'Admins', value: admins, accent: 'from-brand-500 to-brand-300' },
      ],
      roleBreakdown: [
        { label: 'Prevendedores', value: sellers },
        { label: 'Transportistas', value: drivers },
      ],
    };
  }, [users]);

  const openCreateModal = () => {
    setFormMode('create');
    setEditingUser(null);
    setFormOpen(true);
  };

  const openBranchCreateModal = () => {
    setBranchFormMode('create');
    setEditingBranch(null);
    setBranchFormOpen(true);
  };

  const openEditModal = (user: User) => {
    setFormMode('edit');
    setEditingUser(user);
    setFormOpen(true);
  };

  const openBranchEditModal = (branch: Branch) => {
    setBranchFormMode('edit');
    setEditingBranch(branch);
    setBranchFormOpen(true);
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setFormOpen(false);
    setEditingUser(null);
  };

  const closeBranchForm = () => {
    if (branchSubmitting) return;
    setBranchFormOpen(false);
    setEditingBranch(null);
  };

  const handleSubmit = async (values: UserFormValues) => {
    setFormSubmitting(true);
    try {
      if (formMode === 'create') {
        const result = await createUser({
          username: values.username!,
          ci: values.ci,
          password: values.password || '',
          names: values.names,
          lastName: values.lastName,
          secondLastName: values.secondLastName ?? null,
          role: values.role,
          branchId: values.branchId,
        });
        if (result) {
          toast.success('Usuario creado correctamente');
          setFormOpen(false);
          setEditingUser(null);
        }
      } else if (editingUser) {
        const result = await updateUser(editingUser.id, {
          ci: values.ci,
          names: values.names,
          lastName: values.lastName,
          secondLastName: values.secondLastName ?? null,
          role: values.role,
          branchId: values.branchId,
          password: values.password,
        });
        if (result) {
          toast.success('Usuario actualizado correctamente');
          setFormOpen(false);
          setEditingUser(null);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el usuario';
      toast.error(message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openConfirm = (user: User) => {
    setTargetUser(user);
    setConfirmOpen(true);
  };

  const openBranchConfirm = (branch: Branch) => {
    setTargetBranch(branch);
    setBranchConfirmOpen(true);
  };

  const openResetConfirm = (user: User) => {
    setResetTargetUser(user);
    setResetConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setTargetUser(null);
  };

  const closeBranchConfirm = () => {
    if (branchConfirmLoading) return;
    setBranchConfirmOpen(false);
    setTargetBranch(null);
  };

  const executeConfirm = async () => {
    if (!targetUser || !auth.user) return;
    setConfirmLoading(true);
    setBusyUserId(targetUser.id);
    try {
      const success = await updateUserState(targetUser.id, false, auth.user.id);
      if (success) {
        toast.success(`Usuario "${targetUser.userName}" eliminado correctamente`);
      }
      setConfirmOpen(false);
      setTargetUser(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Acción no completada';
      toast.error(message);
    } finally {
      setConfirmLoading(false);
      setBusyUserId(null);
    }
  };

  const executeBranchConfirm = async () => {
    if (!targetBranch) return;
    setBranchConfirmLoading(true);
    try {
      const success = await updateBranchState(targetBranch.id, false);
      if (success) {
        toast.success(`Sucursal "${targetBranch.name}" eliminada correctamente`);
      }
      setBranchConfirmOpen(false);
      setTargetBranch(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Acción no completada';
      toast.error(message);
    } finally {
      setBranchConfirmLoading(false);
    }
  };

  const closeResetConfirm = () => {
    if (resetConfirmLoading) return;
    setResetConfirmOpen(false);
    setResetTargetUser(null);
  };

  const executeReset = async () => {
    if (!resetTargetUser) return;
    setResetConfirmLoading(true);
    setBusyUserId(resetTargetUser.id);
    try {
      const ok = await resetUserPassword(resetTargetUser.id);
      if (ok) {
        toast.success(`Contraseña reseteada para ${resetTargetUser.userName}`);
      } else {
        throw new Error('No se pudo resetear la contraseña');
      }
      setResetConfirmOpen(false);
      setResetTargetUser(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo resetear la contraseña';
      toast.error(message);
    } finally {
      setResetConfirmLoading(false);
      setBusyUserId(null);
    }
  };

  const handleBranchSubmit = async (values: BranchFormValues) => {
    setBranchSubmitting(true);
    try {
      if (branchFormMode === 'create') {
        const result = await createBranch({ name: values.name });
        if (result) {
          toast.success('Sucursal creada correctamente');
          setBranchFormOpen(false);
        }
      } else if (editingBranch) {
        const result = await updateBranch(editingBranch.id, { name: values.name });
        if (result) {
          toast.success('Sucursal actualizada correctamente');
          setBranchFormOpen(false);
          setEditingBranch(null);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la sucursal';
      toast.error(message);
    } finally {
      setBranchSubmitting(false);
    }
  };


  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-10 px-6 py-8 lg:px-10 lg:py-12">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
            />
            <div className="grid gap-10 px-8 py-10 md:px-12 lg:grid-cols-[2fr,1.2fr]">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Usuarios</p>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Gestiona usuarios y accesos centralizados
                </h2>
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      className="input-plain flex-1"
                      placeholder="Buscar por nombre, rol o usuario"
                      value={searchTerm}
                      onChange={event => setSearchTerm(event.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {ROLE_FILTERS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRoleFilter(option.value)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          roleFilter === option.value
                            ? 'bg-lead-50 text-brand-700 shadow-lg'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                <div className="relative space-y-5 rounded-[2rem] border border-white/20 bg-white/10 px-7 py-8 backdrop-blur">
                  <div className="grid grid-cols-2 gap-4">
                    {stats.cards.map(card => (
                      <div key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.accent} px-4 py-5 shadow-lg`}>
                        <p className="text-xs uppercase tracking-wide text-white/80">{card.label}</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 rounded-xl border border-white/20 bg-white/10 p-4 text-sm text-white/80">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/60">Roles operativos</p>
                    {stats.roleBreakdown.map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span>{item.label}</span>
                        <span className="font-semibold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Selector de sección */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow ${
                activeSection === 'users'
                  ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                  : 'bg-white/70 text-lead-600 hover:bg-white'
              }`}
              onClick={() => setActiveSection('users')}
            >
              Usuarios
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow ${
                activeSection === 'branches'
                  ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                  : 'bg-white/70 text-lead-600 hover:bg-white'
              }`}
              onClick={() => setActiveSection('branches')}
            >
              Sucursales
            </button>
          </div>

          {/* Main Content */}
          <section className="grid gap-8 xl:grid-cols-[1fr]">
            {activeSection === 'users' ? (
              <div className="card shadow-xl ring-1 ring-black/5">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">Listado de usuarios</h3>
                    <p className="text-sm text-lead-500">{filteredUsers.length} usuario(s) coinciden con el filtro.</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                    onClick={openCreateModal}
                  >
                    Crear usuario
                  </button>
                </div>
                {usersLoading ? (
                  <Loader />
                ) : (
                  <UsersTable
                    users={filteredUsers}
                    branchMap={branchMap}
                    onEdit={openEditModal}
                    onDeactivate={openConfirm}
                    onResetPassword={openResetConfirm}
                    showResetButton={true}
                    busyUserId={busyUserId}
                  />
                )}
              </div>
            ) : (
              <div className="card shadow-xl ring-1 ring-black/5">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">Listado de sucursales</h3>
                    <p className="text-sm text-lead-500">{branches.length} sucursal(es) registradas.</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2" 
                    onClick={openBranchCreateModal}
                  >
                    Crear sucursal
                  </button>
                </div>
                {branchesLoading ? (
                  <Loader />
                ) : (
                  <BranchesTable
                    branches={branches}
                    onEdit={openBranchEditModal}
                    onDelete={openBranchConfirm}
                  />
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <UserFormModal
        open={formOpen}
        mode={formMode}
        initialUser={editingUser}
        submitting={formSubmitting}
        branches={branches}
        branchesLoading={branchesLoading}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <BranchFormModal
        open={branchFormOpen}
        mode={branchFormMode}
        initialData={editingBranch}
        submitting={branchSubmitting}
        onClose={closeBranchForm}
        onSubmit={handleBranchSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar usuario"
        confirmLabel="Eliminar"
        onConfirm={executeConfirm}
        onCancel={closeConfirm}
        disabled={confirmLoading}
      />
      <ConfirmDialog
        open={resetConfirmOpen}
        title="Resetear contraseña"
        description={resetTargetUser ? `Quieres que resetees la contraseñá de "${resetTargetUser.userName}"` : ''}
        confirmLabel="Si"
        cancelLabel="No"
        onConfirm={executeReset}
        onCancel={closeResetConfirm}
        disabled={resetConfirmLoading}
      />

      <ConfirmDialog
        open={branchConfirmOpen}
        title="Eliminar sucursal"
        confirmLabel="Eliminar"
        onConfirm={executeBranchConfirm}
        onCancel={closeBranchConfirm}
        disabled={branchConfirmLoading}
      />

      {/* Sistema de notificaciones Toast */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};
