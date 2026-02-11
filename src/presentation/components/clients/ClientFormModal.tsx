import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { CreateClientDTO, UpdateClientDTO } from '../../../domain/ports/IClientRepository';
import { Client } from '../../../domain/entities/Client';

export type ClientFormValues = {
  ci: string;
  name: string;
  lastName: string;
  secondLastName: string;
  phone: string;
};

type FormState = {
  ciMain: string;
  ciExt: string;
  name: string;
  lastName: string;
  secondLastName: string;
  phone: string;
};

type ClientFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialClient?: Client | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: CreateClientDTO | UpdateClientDTO) => void;
};

const emptyForm: FormState = {
  ciMain: '',
  ciExt: '',
  name: '',
  lastName: '',
  secondLastName: '',
  phone: '',
};

const ClientFormModal: React.FC<ClientFormModalProps> = ({
  open,
  mode,
  initialClient,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialClient) {
      const rawCi = initialClient.ci ?? '';
      const [mainPart, extPart] = rawCi.includes('-') ? rawCi.split('-', 2) : [rawCi, ''];
      setForm({
        ciMain: mainPart,
        ciExt: extPart,
        name: initialClient.name || '',
        lastName: initialClient.lastName || '',
        secondLastName: initialClient.secondLastName || '',
        phone: initialClient.phone || '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, mode, initialClient]);

  const title = mode === 'create' ? 'Crear cliente' : 'Editar cliente';
  const submitLabel = mode === 'create' ? 'Crear' : 'Guardar cambios';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === 'name' || name === 'lastName' || name === 'secondLastName') {
      nextValue = value.replace(/[^A-Za-z\s]/g, '').toUpperCase();
    }
    if (name === 'ciMain') {
      nextValue = value.replace(/\D/g, '').slice(0, 9);
    }
    if (name === 'ciExt') {
      nextValue = value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 2).toUpperCase();
    }
    if (name === 'phone') {
      nextValue = value.replace(/[^0-9+]/g, '').slice(0, 15);
    }

    setForm(prev => ({ ...prev, [name]: nextValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!form.ciMain.trim()) {
      nextErrors.ciMain = 'El CI es obligatorio';
    }
    if (!form.name.trim()) {
      nextErrors.name = 'El nombre es obligatorio';
    }
    if (!form.lastName.trim()) {
      nextErrors.lastName = 'El primer apellido es obligatorio';
    }
    if (!form.secondLastName.trim()) {
      nextErrors.secondLastName = 'El segundo apellido es obligatorio';
    }
    if (!form.phone.trim()) {
      nextErrors.phone = 'El teléfono es obligatorio';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const main = form.ciMain.trim();
    const ext = form.ciExt.trim();
    const composedCi = ext ? `${main}-${ext}` : main;

    const baseData = {
      ci: composedCi,
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      secondLastName: form.secondLastName.trim(),
      phone: form.phone.trim(),
    };

    if (mode === 'edit' && initialClient) {
      onSubmit({ ...baseData, id: initialClient.id } as UpdateClientDTO);
    } else {
      // create DTO might need additional empty fields if required by backend type, but usually matches
      onSubmit(baseData as CreateClientDTO);
    }
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
          {/* CI */}
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
                  placeholder="1234567"
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="ciExt" className="block text-sm font-medium text-lead-700">Ext (opc)</label>
                <input
                  id="ciExt"
                  name="ciExt"
                  value={form.ciExt}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                  placeholder="SC"
                  disabled={submitting}
                />
              </div>
            </div>
            {errors.ciMain && <p className="mt-1 text-xs text-red-600">{errors.ciMain}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-lead-700">Nombres *</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.name ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                placeholder="JUAN"
                disabled={submitting}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
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
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
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
               placeholder="MAMANI"
               disabled={submitting}
             />
             {errors.secondLastName && <p className="mt-1 text-xs text-red-600">{errors.secondLastName}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-lead-700">Teléfono *</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.phone ? 'border-red-500' : 'border-lead-300 bg-white'}`}
              placeholder="70000000"
              disabled={submitting}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
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

export default ClientFormModal;
