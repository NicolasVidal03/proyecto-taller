import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { User } from '../../../domain/entities/User';

export type UserFormValues = {
  username: string;
  ci: string;
  names: string;
  lastName: string;
  secondLastName?: string | null;
  branchId: number;
  role: string;
  password?: string;
};

type AssignableRole = 'admin' | 'prevendedor' | 'transportista' | 'super_admin';

const ROLE_OPTIONS: Array<{ value: AssignableRole; label: string }> = [
  { value: 'admin', label: 'Administrador' },
  { value: 'prevendedor', label: 'Prevendedor' },
  { value: 'transportista', label: 'Transportista' },
];

const defaultRole: AssignableRole = 'prevendedor';

type FormState = {
  username: string;
  ciMain: string;
  ciExt: string; 
  names: string;
  lastName: string;
  secondLastName: string;
  branchId: string;
  role: AssignableRole;
  password: string;
  confirmPassword: string;
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
  ciMain: '',
  ciExt: '',
  names: '',
  lastName: '',
  secondLastName: '',
  branchId: '',
  role: defaultRole,
  password: '',
  confirmPassword: '',
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
      const rawCi = initialUser.ci ?? '';
      const [mainPart, extPart] = rawCi.includes('-') ? rawCi.split('-', 2) : [rawCi, ''];
      setForm({
        username: initialUser.userName,
        ciMain: mainPart,
        ciExt: extPart,
        names: initialUser.names,
        lastName: initialUser.lastName,
        secondLastName: initialUser.secondLastName ?? '',
        branchId: initialUser.branchId != null ? String(initialUser.branchId) : '',
        role: initialUser.role === 'super_admin' ? defaultRole : (initialUser.role as AssignableRole),
        password: '',
        confirmPassword: '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, mode, initialUser]);

  const title = mode === 'create' ? 'Crear usuario' : 'Editar usuario';
  const submitLabel = mode === 'create' ? 'Crear' : 'Guardar cambios';

  const filteredRoles = useMemo(() => {
    if (isSuperAdmin) return ROLE_OPTIONS;
    if (isAdmin) return ROLE_OPTIONS.filter(r => r.value === 'prevendedor' || r.value === 'transportista');
    return [] as typeof ROLE_OPTIONS;
  }, [isSuperAdmin, isAdmin]);

  const displayedRoles = filteredRoles.length ? filteredRoles : ROLE_OPTIONS;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target as HTMLInputElement;
    let nextValue = value;
    // Force uppercase for name fields and CI extension
    if (name === 'names' || name === 'lastName' || name === 'secondLastName') {
      // Allow only letters and spaces, convert to uppercase
      nextValue = value.replace(/[^A-Za-z\s]/g, '').toUpperCase();
    }
    if (name === 'ciMain') {
      // Allow only digits and limit to 7 characters
      nextValue = value.replace(/\D/g, '').slice(0, 7);
    }
    if (name === 'ciExt') {
      // Allow only digit(s) and letters, limit to 2 chars (one digit + one letter)
      nextValue = value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 2).toUpperCase();
    }
    setForm(prev => ({ ...prev, [name]: nextValue }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!form.username.trim()) nextErrors.username = 'El usuario es obligatorio';
    if (!form.ciMain.trim()) nextErrors.ciMain = 'La cédula (CI) es obligatoria';
    // ciMain must be digits only and max 7
    if (form.ciMain && !/^\d{1,7}$/.test(form.ciMain)) nextErrors.ciMain = 'CI inválida (solo hasta 7 dígitos)';
    if (!form.names.trim()) nextErrors.names = 'El nombre es obligatorio';
    if (!form.lastName.trim()) nextErrors.lastName = 'El apellido es obligatorio';
    if (!form.branchId.trim()) nextErrors.branchId = 'La sucursal es obligatoria';
    if (!form.secondLastName.trim()) nextErrors.secondLastName = 'El segundo apellido es obligatorio';
    const branchNumber = Number(form.branchId);
    if (form.branchId.trim() && Number.isNaN(branchNumber)) {
      nextErrors.branchId = 'La sucursal debe ser numérica';
    }
    if (!form.role) nextErrors.role = 'Selecciona un rol';
    if (mode === 'create' && !form.password.trim()) {
      nextErrors.password = 'La contraseña es obligatoria';
    }
    if (mode === 'create') {
      if (!form.confirmPassword.trim()) {
        nextErrors.confirmPassword = 'Confirma la contraseña';
      } else if (form.password.trim() !== form.confirmPassword.trim()) {
        nextErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    // validate ciExt if provided: must be exactly one digit and one letter, e.g. '1B'
    if (form.ciExt.trim()) {
      const re = /^\d[a-zA-Z]$/;
      if (!re.test(form.ciExt.trim())) nextErrors.ciExt = 'Formato de ext inválido (ej: 1B)';
    }

    // Names / last names must contain only letters and spaces
    const nameRe = /^[A-Z\s]+$/;
    if (form.names && !nameRe.test(form.names)) nextErrors.names = 'El nombre sólo puede contener letras';
    if (form.lastName && !nameRe.test(form.lastName)) nextErrors.lastName = 'El apellido sólo puede contener letras';
    if (form.secondLastName && !nameRe.test(form.secondLastName)) nextErrors.secondLastName = 'El segundo apellido sólo puede contener letras';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    const branchNumber = Number(form.branchId);
    // compose CI: main + optional '-' + ext
    const main = form.ciMain.trim();
    const ext = form.ciExt.trim();
    const composedCi = ext ? `${main}-${ext}` : main;
    onSubmit({
      username: form.username.trim(),
      ci: composedCi,
      names: form.names.trim(),
      lastName: form.lastName.trim(),
      secondLastName: form.secondLastName.trim() || null,
      branchId: branchNumber,
      role: form.role,
      password: form.password.trim() || undefined,
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
            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="col-span-2">
                <label htmlFor="ciMain" className="block text-sm font-medium text-lead-700">Cédula (CI)</label>
                <input
                  id="ciMain"
                  name="ciMain"
                  value={form.ciMain}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.ciMain ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                  placeholder="876543"
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="ciExt" className="block text-sm font-medium text-lead-700">Ext (opcional)</label>
                <input
                  id="ciExt"
                  name="ciExt"
                  value={form.ciExt}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.ciExt ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                  placeholder="1b"
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="mt-1 flex flex-col gap-1">
              {errors.ciMain ? <p className="text-xs text-red-600">{errors.ciMain}</p> : null}
              {errors.ciExt ? <p className="text-xs text-red-600">{errors.ciExt}</p> : null}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="names" className="block text-sm font-medium text-lead-700">Nombres</label>
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
              <label htmlFor="lastName" className="block text-sm font-medium text-lead-700">Primer Apellido</label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.lastName ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                placeholder="Pérez"
                disabled={submitting}
              />
              {errors.lastName ? <p className="mt-1 text-xs text-red-600">{errors.lastName}</p> : null}
            </div>
          </div>
          <div>
            <label htmlFor="secondLastName" className="block text-sm font-medium text-lead-700">Segundo Apellido</label>
            <input
              id="secondLastName"
              name="secondLastName"
              value={form.secondLastName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.secondLastName ? 'border-red-500' : 'border-lead-300 bg-white'}`}
              placeholder="Fernández"
                disabled={submitting || mode === 'edit'}
            />
            {errors.secondLastName ? <p className="mt-1 text-xs text-red-600">{errors.secondLastName}</p> : null}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="branchId" className="block text-sm font-medium text-lead-700">Sucursal</label>
              <input
                id="branchId"
                name="branchId"
                value={form.branchId}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.branchId ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                placeholder="1"
                disabled={submitting}
              />
              {errors.branchId ? <p className="mt-1 text-xs text-red-600">{errors.branchId}</p> : null}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-lead-700">Rol</label>
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

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-lead-700">Usuario</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.username ? 'border-red-500' : 'border-lead-300 bg-white'}`}
              placeholder="usuario.unico"
              disabled={submitting || mode === 'edit'}
            />
            {errors.username ? <p className="mt-1 text-xs text-red-600">{errors.username}</p> : null}
          </div>
          {mode === 'create' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-lead-700">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.password ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                placeholder="••••••••"
                disabled={submitting}
              />
              {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password}</p> : null}
            </div>
          )}

          {mode === 'create' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-lead-700">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.confirmPassword ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                placeholder="••••••••"
                disabled={submitting}
              />
              {errors.confirmPassword ? <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p> : null}
            </div>
          )}
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
