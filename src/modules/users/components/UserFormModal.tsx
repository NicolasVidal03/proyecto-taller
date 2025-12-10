import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@modules/auth/providers/AuthProvider';
import { AssignableRole, ROLE_OPTIONS, User } from '@shared/types/user';
import { UserFormValues } from '@modules/users/api/usersApi';

const defaultRole: AssignableRole = ROLE_OPTIONS[0]?.value ?? 'admin';

type FormState = {
  username: string;
  ci: string;
  names: string;
  last_name: string;
  second_last_name: string;
  branch_id: string;
  email: string;
  role: AssignableRole;
  auth_password?: string;
};

type UserFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialUser?: User | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
};

const emptyForm: FormState = {
  username: '',
  ci: '',
  names: '',
  last_name: '',
  second_last_name: '',
  branch_id: '',
  email: '',
  role: defaultRole,
};

const UserFormModal: React.FC<UserFormModalProps> = ({ open, mode, initialUser, submitting, onClose, onSubmit }) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const auth = useAuth();
  const isSuperAdmin = auth.user?.role === 'super_admin';
  const isAdmin = auth.user?.role === 'admin';

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialUser) {
      //console.log('initialUser en modal:', initialUser);
      setForm({
        username: initialUser.username,
        ci: (initialUser as any).ci ?? '',
        names: initialUser.names,
        last_name: initialUser.last_name,
        second_last_name: initialUser.second_last_name ?? '',
        branch_id: initialUser.branch_id != null ? String(initialUser.branch_id) : '',
        role: initialUser.role === 'super_admin' ? defaultRole : initialUser.role,
        email: (initialUser as any).email ?? '',
        auth_password: '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, mode, initialUser]);

  const title = mode === 'create' ? 'Crear usuario' : 'Editar usuario';
  const submitLabel = mode === 'create' ? 'Crear' : 'Guardar cambios';

  // filter available roles based on current user's role
  const filteredRoles = useMemo(() => {
    if (isSuperAdmin) return ROLE_OPTIONS;
    if (isAdmin) return ROLE_OPTIONS.filter(r => r.value === 'prevendedor' || r.value === 'transportista');
    return [] as typeof ROLE_OPTIONS;
  }, [isSuperAdmin, isAdmin]);

  // if no roles available for the current user, fallback to assignable roles (prevents empty select)
  const displayedRoles = filteredRoles.length ? filteredRoles : ROLE_OPTIONS;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!form.username.trim()) nextErrors.username = 'El usuario es obligatorio';
    // CI is optional but prefer to be set
    if (!form.ci.trim()) nextErrors.ci = 'La cédula (CI) es obligatoria';
    if (!form.names.trim()) nextErrors.names = 'El nombre es obligatorio';
    if (!form.last_name.trim()) nextErrors.last_name = 'El apellido es obligatorio';
    if (!form.branch_id.trim()) nextErrors.branch_id = 'La sucursal es obligatoria';
    const branchNumber = Number(form.branch_id);
    if (form.branch_id.trim() && Number.isNaN(branchNumber)) {
      nextErrors.branch_id = 'La sucursal debe ser numérica';
    }
    if (!form.role) nextErrors.role = 'Selecciona un rol';
    // email required and must be valid
    if (!form.email.trim()) nextErrors.email = 'El email es obligatorio';
    else if (!/[^@\s]+@[^@\s]+\.[^@\s]+/.test(form.email.trim())) nextErrors.email = 'Email inválido';
    // if current user is super_admin and creating, require system password (username is the main 'username' field)
    if (isSuperAdmin && mode === 'create') {
      if (!form.auth_password || !form.auth_password.trim()) nextErrors.auth_password = 'La contraseña es obligatoria para super_admin';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    const branchNumber = Number(form.branch_id);
    onSubmit({
      username: form.username.trim(),
      ci: form.ci.trim() || undefined,
      email: form.email.trim(),
      names: form.names.trim(),
      last_name: form.last_name.trim(),
      second_last_name: form.second_last_name.trim() ? form.second_last_name.trim() : undefined,
      branch_id: branchNumber,
      role: form.role,
      auth_password: form.auth_password?.trim() || undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="mx-4 my-10 w-full max-w-lg overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
          <button type="button" onClick={onClose} className="text-brand-100 hover:text-white transition-colors" disabled={submitting}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-lead-700">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.username ? 'border-red-500' : 'border-lead-300 bg-white'}`}
              placeholder="usuario.unico"
              disabled={submitting}
            />
            {errors.username ? <p className="mt-1 text-xs text-red-600">{errors.username}</p> : null}
          </div>
          <div>
            <label htmlFor="ci" className="block text-sm font-medium text-lead-700">Cédula (CI)</label>
            <input
              id="ci"
              name="ci"
              value={form.ci}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.ci ? 'border-red-500' : 'border-lead-300 bg-white'}`}
              placeholder="12345678"
              disabled={submitting}
            />
            {errors.ci ? <p className="mt-1 text-xs text-red-600">{errors.ci}</p> : null}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-lead-700">Email</label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.email ? 'border-red-500' : 'border-lead-300 bg-white'}`}
              placeholder="usuario@ejemplo.com"
              disabled={submitting}
            />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="names" className="block text-sm font-medium text-lead-700">
                Nombres
              </label>
              <input
                id="names"
                name="names"
                value={form.names}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.names ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                placeholder="Juan Carlos"
                disabled={submitting}
              />
              {errors.names ? <p className="mt-1 text-xs text-red-600">{errors.names}</p> : null}
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-lead-700">
                Apellido paterno
              </label>
              <input
                id="last_name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.last_name ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                placeholder="Pérez"
                disabled={submitting}
              />
              {errors.last_name ? <p className="mt-1 text-xs text-red-600">{errors.last_name}</p> : null}
            </div>
          </div>
          <div>
            <label htmlFor="second_last_name" className="block text-sm font-medium text-lead-700">
              Apellido materno (opcional)
            </label>
            <input
              id="second_last_name"
              name="second_last_name"
              value={form.second_last_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
              placeholder="Fernández"
              disabled={submitting}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="branch_id" className="block text-sm font-medium text-lead-700">
                Sucursal ID
              </label>
              <input
                id="branch_id"
                name="branch_id"
                value={form.branch_id}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.branch_id ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                placeholder="1"
                disabled={submitting}
              />
              {errors.branch_id ? <p className="mt-1 text-xs text-red-600">{errors.branch_id}</p> : null}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-lead-700">
                Rol
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.role ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                disabled={submitting}
              >
                {displayedRoles.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role ? <p className="mt-1 text-xs text-red-600">{errors.role}</p> : null}
            </div>
          </div>
          {/* Auth credentials for super_admin only */}
          {/** show if current user is super_admin */}
          {isSuperAdmin ? (
            <div className="rounded-lg bg-lead-100 p-4 border border-lead-200">
                <p className="mb-2 text-sm font-semibold text-lead-700">Credenciales del sistema</p>
                <div>
                  <label htmlFor="auth_password" className="block text-xs font-medium text-lead-600">
                    Contraseña
                  </label>
                  <input
                    id="auth_password"
                    name="auth_password"
                    type="password"
                    value={form.auth_password ?? ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.auth_password ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                    placeholder="Contraseña temporal"
                    disabled={submitting}
                  />
                  {errors.auth_password ? <p className="mt-1 text-xs text-red-600">{errors.auth_password}</p> : null}
                </div>
              </div>
          ) : null}
          <div className="flex justify-end gap-3 pt-4 border-t border-lead-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-lead-300 px-4 py-2 text-sm font-medium text-lead-700 hover:bg-lead-100 transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-60 transition-all"
              disabled={submitting}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
