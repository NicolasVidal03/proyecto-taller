import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../providers/AuthProvider';
import { User } from '../../../domain/entities/User';
import { Branch } from '../../../domain/entities/Branch';

export type UserFormValues = {
  ci: string;
  names: string;
  lastName: string;
  secondLastName?: string | null;
  branchId: number;
  role: string;
  email: string;
};

type AssignableRole = 'propietario' | 'administrador' | 'prevendedor' | 'transportista';

const ROLE_OPTIONS_PROPIETARIO: Array<{ value: AssignableRole; label: string }> = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'prevendedor', label: 'Prevendedor' },
  { value: 'transportista', label: 'Transportista' },
];

const ROLE_OPTIONS_ADMIN: Array<{ value: AssignableRole; label: string }> = [
  { value: 'prevendedor', label: 'Prevendedor' },
  { value: 'transportista', label: 'Transportista' },
];

const defaultRole: AssignableRole = 'prevendedor';

type FormState = {
  ciMain: string;
  ciExt: string; 
  names: string;
  lastName: string;
  secondLastName: string;
  branchId: string;
  role: AssignableRole;
  email: string;
};

type UserFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialUser?: User | null;
  submitting: boolean;
  branches: Branch[];
  branchesLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
};

const emptyForm: FormState = {
  ciMain: '',
  ciExt: '',
  names: '',
  lastName: '',
  secondLastName: '',
  branchId: '',
  role: defaultRole,
  email: '',
};

const UserFormModal: React.FC<UserFormModalProps> = ({ 
  open, 
  mode, 
  initialUser, 
  submitting, 
  branches,
  branchesLoading = false,
  onClose, 
  onSubmit 
}) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const auth = useAuth();
  const isPropietario = auth.user?.role === 'propietario';
  const isAdmin = auth.user?.role === 'administrador';

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialUser) {
      const rawCi = initialUser.ci ?? '';
      const [mainPart, extPart] = rawCi.includes('-') ? rawCi.split('-', 2) : [rawCi, ''];
      setForm({
        ciMain: mainPart,
        ciExt: extPart,
        names: initialUser.names,
        lastName: initialUser.lastName,
        secondLastName: initialUser.secondLastName ?? '',
        branchId: initialUser.branchId != null ? String(initialUser.branchId) : '',
        role: (initialUser.role === 'propietario') ? defaultRole : (initialUser.role as AssignableRole),
        email: initialUser.email ?? '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, mode, initialUser]);

  const title = mode === 'create' ? 'Crear usuario' : 'Editar usuario';
  const submitLabel = mode === 'create' ? 'Crear' : 'Guardar cambios';

  const filteredRoles = useMemo(() => {
    if (isPropietario) return ROLE_OPTIONS_PROPIETARIO;
    if (isAdmin) return ROLE_OPTIONS_ADMIN;
    return [] as typeof ROLE_OPTIONS_PROPIETARIO;
  }, [isPropietario, isAdmin]);

  const displayedRoles = filteredRoles.length ? filteredRoles : ROLE_OPTIONS_ADMIN;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target as HTMLInputElement;
    let nextValue = value;
   
    if (name === 'names' || name === 'lastName' || name === 'secondLastName') {
      nextValue = value.replace(/[^A-Za-z\s]/g, '').toUpperCase();
    }
    if (name === 'ciMain') {
      nextValue = value.replace(/\D/g, '').slice(0, 9);
    }
    if (name === 'ciExt') {
      nextValue = value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 2).toUpperCase();
    }
    if (name === 'email') {
      nextValue = value.toLowerCase();
    }
    
    // Validación inmediata
    const newErrors = { ...errors };
    if (name === 'email') {
       if (nextValue.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextValue.trim())) {
           newErrors.email = 'Formato de correo inválido';
       } else {
           delete newErrors.email;
       }
    }
    
    setForm(prev => ({ ...prev, [name]: nextValue }));
    setErrors(newErrors);
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = { ...errors };
    if (!form.ciMain.trim()) {
      nextErrors.ciMain = 'La cédula (CI) es obligatoria';
    } else if (!/^\d{1,9}$/.test(form.ciMain)) {
      nextErrors.ciMain = 'CI inválida (solo hasta 9 dígitos)';
    }
    if (!form.names.trim()) {
      nextErrors.names = 'El nombre es obligatorio';
    } else if (!/^[A-Z\s]+$/.test(form.names)) {
      nextErrors.names = 'El nombre sólo puede contener letras';
    }
    if (!form.lastName.trim()) {
      nextErrors.lastName = 'El apellido es obligatorio';
    } else if (!/^[A-Z\s]+$/.test(form.lastName)) {
      nextErrors.lastName = 'El apellido sólo puede contener letras';
    }
    if (!form.secondLastName.trim()) {
      nextErrors.secondLastName = 'El segundo apellido es obligatorio';
    } else if (!/^[A-Z\s]+$/.test(form.secondLastName)) {
      nextErrors.secondLastName = 'El segundo apellido sólo puede contener letras';
    }
    if (!form.branchId.trim()) {
      nextErrors.branchId = 'La sucursal es obligatoria';
    } else {
      const branchNumber = Number(form.branchId);
      if (Number.isNaN(branchNumber)) {
        nextErrors.branchId = 'La sucursal debe ser numérica';
      }
    }
    if (!form.role) {
      nextErrors.role = 'Selecciona un rol';
    }
    
    if (mode === 'create' && !form.email.trim()) {
      nextErrors.email = 'El correo electrónico es obligatorio';
    } else if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Formato de correo inválido';
    }
    if (form.ciExt.trim() && !/^\d[a-zA-Z]$/.test(form.ciExt.trim())) {
      nextErrors.ciExt = 'Formato de ext inválido (ej: 1B)';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    const branchNumber = Number(form.branchId);
    const main = form.ciMain.trim();
    const ext = form.ciExt.trim();
    const composedCi = ext ? `${main}-${ext}` : main;
    onSubmit({
      ci: composedCi,
      names: form.names.trim(),
      lastName: form.lastName.trim(),
      secondLastName: form.secondLastName.trim() || null,
      branchId: branchNumber,
      role: form.role,
      email: form.email.trim(),
    });
  };

  if (!open) return null;

  return ReactDOM.createPortal(
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
          
          {mode === 'create' && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Credenciales automáticas</p>
                  <p className="mt-1 text-blue-700">
                    El usuario y contraseña temporal se generarán automáticamente y se enviarán al correo electrónico del usuario.
                    En su primer inicio de sesión, deberá cambiar su contraseña.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="col-span-2">
                <label htmlFor="ciMain" className="block text-sm font-medium text-lead-700">Cédula (CI) *</label>
                <input
                  id="ciMain"
                  name="ciMain"
                  value={form.ciMain}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.ciMain ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                  placeholder="876543789"
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
                  placeholder="1B"
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
              <label htmlFor="names" className="block text-sm font-medium text-lead-700">Nombres *</label>
              <input
                id="names"
                name="names"
                value={form.names}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.names ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                placeholder="JUAN CARLOS"
                disabled={submitting}
              />
              {errors.names ? <p className="mt-1 text-xs text-red-600">{errors.names}</p> : null}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-lead-700">Primer Apellido *</label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.lastName ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                placeholder="PEREZ"
                disabled={submitting}
              />
              {errors.lastName ? <p className="mt-1 text-xs text-red-600">{errors.lastName}</p> : null}
            </div>
          </div>
          <div>
            <label htmlFor="secondLastName" className="block text-sm font-medium text-lead-700">Segundo Apellido *</label>
            <input
              id="secondLastName"
              name="secondLastName"
              value={form.secondLastName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.secondLastName ? 'border-red-500' : 'border-lead-300 bg-white'}`}
              placeholder="FERNANDEZ"
              disabled={submitting}
            />
            {errors.secondLastName ? <p className="mt-1 text-xs text-red-600">{errors.secondLastName}</p> : null}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-lead-700">
              Correo electrónico {mode === 'create' ? '*' : ''}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.email ? 'border-red-500' : 'border-lead-300 bg-white'}`}
              placeholder="usuario@ejemplo.com"
              disabled={submitting}
            />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
            {mode === 'create' && (
              <p className="mt-1 text-xs text-lead-500">Las credenciales de acceso se enviarán a este correo</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="branchId" className="block text-sm font-medium text-lead-700">Sucursal *</label>
              <div className="relative">
                <select
                  id="branchId"
                  name="branchId"
                  value={form.branchId}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 appearance-none ${errors.branchId ? 'border-red-500' : 'border-lead-300 bg-white'} ${branchesLoading ? 'opacity-50' : ''}`}
                  disabled={submitting || branchesLoading}
                >
                  <option value="">
                    {branchesLoading ? 'Cargando sucursales...' : 'Seleccionar sucursal'}
                  </option>
                  {branches.map(branch => (
                    <option key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 mt-1">
                  {branchesLoading ? (
                    <svg className="h-4 w-4 animate-spin text-lead-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-lead-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              {errors.branchId ? <p className="mt-1 text-xs text-red-600">{errors.branchId}</p> : null}
              {!branchesLoading && branches.length === 0 && (
                <p className="mt-1 text-xs text-yellow-600">No hay sucursales disponibles</p>
              )}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-lead-700">Rol *</label>
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
    </div>,
    document.body
  );
};

export default UserFormModal;
