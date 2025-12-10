import React, { useCallback, useEffect, useMemo, useState } from 'react';
import UsersTable from '@modules/users/components/UsersTable';
import UserFormModal from '@modules/users/components/UserFormModal';
import {
  createUser,
  deactivateUser,
  // deleteUserHard removed - permanent deletes are not allowed
  getUsers,
  updateUser,
  UpdateUserPayload,
  UserFormValues,
} from '@modules/users/api/usersApi';
import AppLayout from '@shared/layouts/AppLayout';
import Loader from '@shared/components/Loader';
import ErrorMessage from '@shared/components/ErrorMessage';
import ConfirmDialog from '@shared/components/ConfirmDialog';
import { User } from '@shared/types/user';

type ConfirmAction = 'deactivate';
type RoleFilter = 'all' | 'admin' | 'prevendedor' | 'transportista';
type StatusFilter = 'all' | 'active' | 'inactive';

const ROLE_FILTERS: Array<{ value: RoleFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'admin', label: 'Administradores' },
  { value: 'prevendedor', label: 'Prevendedores' },
  { value: 'transportista', label: 'Transportistas' },
];

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<{ email?: string | null; password?: string | null } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>('deactivate');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('getUsers error', err);
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter(user => {
      const matchesSearch =
        term.length === 0 ||
        user.username.toLowerCase().includes(term) ||
        `${user.names} ${user.last_name}`.toLowerCase().includes(term) ||
        (user.second_last_name ?? '').toLowerCase().includes(term);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.state) ||
        (statusFilter === 'inactive' && !user.state);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchTerm, statusFilter, users]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(user => user.state).length;
    const inactive = total - active;
    const admins = users.filter(user => user.role === 'admin').length;
    const sellers = users.filter(user => user.role === 'prevendedor').length;
    const drivers = users.filter(user => user.role === 'transportista').length;
    return {
      cards: [
        { label: 'Total de usuarios', value: total, accent: 'from-brand-900 to-brand-600' },
        { label: 'Activos', value: active, accent: 'from-accent-500 to-accent-300' },
        { label: 'Inactivos', value: inactive, accent: 'from-slate-700 to-slate-500' },
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
    setMutationError(null);
    setSuccessMessage(null);
    setAuthInfo(null);
  };

  const openEditModal = (user: User) => {
    setFormMode('edit');
    setEditingUser(user);
    setFormOpen(true);
    setMutationError(null);
    setSuccessMessage(null);
    setAuthInfo(null);
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setFormOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (values: UserFormValues) => {
    setFormSubmitting(true);
    setMutationError(null);
    setSuccessMessage(null);
    setAuthInfo(null);
    try {
      if (formMode === 'create') {
        await createUser(values);
        setSuccessMessage('Usuario creado correctamente.');
      } else if (editingUser) {
        const updatePayload: UpdateUserPayload = {
          username: values.username,
          ci: values.ci?.trim() ?? undefined,
          email: values.email.trim(),
          names: values.names,
          last_name: values.last_name,
          second_last_name: values.second_last_name ?? null,
          branch_id: values.branch_id,
          role: values.role,
          auth_password: values.auth_password?.trim() || undefined,
        };
        const result = await updateUser(editingUser.id, updatePayload);
        if (result.auth0Email || result.auth0Password) {
          setAuthInfo({
            email: result.auth0Email ?? null,
            password: result.auth0Password ?? null,
          });
          setSuccessMessage('Usuario actualizado y sincronizado con Auth0.');
        } else {
          setSuccessMessage('Usuario actualizado correctamente.');
        }
      }
      setFormOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      console.error('user submit error', err);
      const message = err?.response?.data?.error || err?.message || 'No se pudo guardar el usuario';
      setMutationError(message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openConfirm = (user: User) => {
    setConfirmAction('deactivate');
    setTargetUser(user);
    setConfirmOpen(true);
    setMutationError(null);
    setSuccessMessage(null);
    setAuthInfo(null);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setTargetUser(null);
  };

  const executeConfirm = async () => {
    if (!targetUser) return;
    setConfirmLoading(true);
    setBusyUserId(targetUser.id);
    setMutationError(null);
    try {
      // only deactivate supported
      await deactivateUser(targetUser.id);
      await loadUsers();
      setConfirmOpen(false);
      setTargetUser(null);
    } catch (err: any) {
      console.error('user confirm error', err);
      const message = err?.response?.data?.error || err?.message || 'Acción no completada';
      setMutationError(message);
    } finally {
      setConfirmLoading(false);
      setBusyUserId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('active');
  };

  return (
    <AppLayout>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-10 px-6 py-8 lg:px-10 lg:py-12">
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
                <p className="max-w-xl text-sm text-white/80 md:text-base">
                  Gestiona el ciclo completo de tus colaboradores desde una sola vista. Cada actualización se refleja en el sistema de autenticación configurado.
                </p>
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      className="input flex-1 bg-lead-50 text-lead-800 placeholder:text-lead-400 border-transparent focus:bg-white transition-colors shadow-sm"
                      placeholder="Buscar por nombre, rol o usuario"
                      value={searchTerm}
                      onChange={event => setSearchTerm(event.target.value)}
                    />
                    <button 
                      type="button" 
                      className="rounded-xl border border-white/30 bg-white/10 px-6 py-2 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-white/20 hover:border-white/50" 
                      onClick={clearFilters}
                    >
                      Limpiar filtros
                    </button>
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
                  <div className="flex flex-wrap gap-2 text-xs text-white/70">
                    {STATUS_FILTERS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setStatusFilter(option.value)}
                        className={`rounded-full px-3 py-1 font-semibold tracking-wide transition ${
                          statusFilter === option.value ? 'bg-lead-50/90 text-brand-700' : 'bg-white/10 hover:bg-white/20'
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
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium uppercase tracking-[0.4em] text-white/70">Resumen</p>
                    <button type="button" onClick={openCreateModal} className="btn-primary text-sm shadow-lg">
                      Nuevo usuario
                    </button>
                  </div>
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

          <section className="grid gap-8 xl:grid-cols-[1.6fr,1fr]">
            <div className="card shadow-xl ring-1 ring-black/5">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-brand-900">Listado de usuarios</h3>
                  <p className="text-sm text-lead-500">{filteredUsers.length} usuario(s) coinciden con el filtro.</p>
                </div>
                <button type="button" className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md" onClick={openCreateModal}>
                  Crear usuario
                </button>
              </div>
              {error ? <ErrorMessage message={error} /> : null}
              {mutationError ? (
                <div className="mt-3">
                  <ErrorMessage message={mutationError} />
                </div>
              ) : null}
              {successMessage ? (
                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
                  <p className="font-medium">{successMessage}</p>
                  {authInfo?.email ? (
                    <p className="mt-2 text-xs">
                      Correo Auth0: <span className="font-semibold">{authInfo.email}</span>
                    </p>
                  ) : null}
                  {authInfo?.password ? (
                    <p className="mt-1 text-xs">
                      Contraseña temporal: <span className="font-semibold">{authInfo.password}</span>
                    </p>
                  ) : null}
                </div>
              ) : null}
              {loading ? (
                <Loader />
              ) : (
                <UsersTable
                  users={filteredUsers}
                  onEdit={openEditModal}
                  onDeactivate={openConfirm}
                  busyUserId={busyUserId}
                />
              )}
              {!loading && !filteredUsers.length && !error ? (
                <p className="mt-4 rounded-lg border border-dashed border-lead-300 bg-lead-50 px-4 py-8 text-center text-sm text-lead-600">
                  Ajusta los filtros o crea un nuevo usuario para comenzar.
                </p>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="card relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-600 text-white shadow-xl">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 55%), url(https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=800&q=60)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    mixBlendMode: 'overlay',
                  }}
                />
                <div className="relative space-y-4">
                  <p className="text-xs uppercase tracking-[0.45em] text-brand-200">Cobertura</p>
                  <h3 className="text-2xl font-bold">Asignación de zonas</h3>
                  <p className="text-sm text-brand-100">
                    Coordina la distribución entre prevendedores y transportistas para mantener rutas ágiles y clientes satisfechos.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="button" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition">
                      Asignar prevendedor
                    </button>
                    <button type="button" className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-accent-600 transition">
                      Asignar transportista
                    </button>
                  </div>
                </div>
              </div>

              <div className="card space-y-4 border border-lead-100 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-brand-900">Seguimiento rápido</h4>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Sincronizado</span>
                </div>
                <ul className="space-y-4 text-sm text-lead-600">
                  <li className="flex items-start justify-between gap-3 pb-3 border-b border-lead-50 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-lead-800">Actualiza roles críticos</p>
                      <p className="text-xs text-lead-500 mt-0.5">Auth0 refleja los cambios en segundos.</p>
                    </div>
                    <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">Prioridad alta</span>
                  </li>
                  <li className="flex items-start justify-between gap-3 pb-3 border-b border-lead-50 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-lead-800">Desactivaciones seguras</p>
                      <p className="text-xs text-lead-500 mt-0.5">Bloquea accesos sin perder historial.</p>
                    </div>
                    <span className="rounded-md bg-lead-100 px-2 py-1 text-xs font-medium text-lead-600">Checklist</span>
                  </li>
                  <li className="flex items-start justify-between gap-3 pb-3 border-b border-lead-50 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-lead-800">Revisa usuarios inactivos</p>
                      <p className="text-xs text-lead-500 mt-0.5">Filtra por estado y limpia Auth0.</p>
                    </div>
                    <span className="rounded-md bg-lead-100 px-2 py-1 text-xs font-medium text-lead-600">Mensual</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      <UserFormModal
        open={formOpen}
        mode={formMode}
        initialUser={editingUser}
        submitting={formSubmitting}
        onClose={closeForm}
        onSubmit={handleSubmit as (values: UserFormValues) => void}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={'Eliminar usuario'}
        description={'Esta acción desactiva el usuario (estado = 0). El registro se mantiene, pero dejará de aparecer en la lista.'}
        confirmLabel={'Eliminar'}
        onConfirm={executeConfirm}
        onCancel={closeConfirm}
        disabled={confirmLoading}
      />
    </AppLayout>
  );
};

export default UsersPage;
