import React, { useEffect, useState } from 'react';
import { BusinessType } from '../../../domain/entities/BusinessType';

export interface BusinessTypeFormValues {
  name: string;
}

interface BusinessTypeFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData: BusinessType | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: BusinessTypeFormValues) => void;
}

const BusinessTypeFormModal: React.FC<BusinessTypeFormModalProps> = ({
  open,
  mode,
  initialData,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setName(initialData.name || '');
      } else {
        setName('');
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'El nombre es obligatorio';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim() });
  };

  if (!open) return null;

  const title = mode === 'create' ? 'Nuevo Tipo de Negocio' : 'Editar Tipo de Negocio';
  const submitLabel = mode === 'create' ? 'Crear' : 'Guardar cambios';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="mx-4 my-10 w-full max-w-md overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-100 hover:text-white transition-colors"
            disabled={submitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label className="block text-sm font-medium text-lead-700">Nombre *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm ${
                errors.name ? 'border-red-500' : 'border-lead-300 bg-white'
              }`}
              disabled={submitting}
              placeholder="Ej: Ferretería, Tienda, Institución..."
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
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
              className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-accent-600 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessTypeFormModal;
