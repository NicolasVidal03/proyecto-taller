import React, { useEffect, useState } from 'react';
import { Brand } from '../../../domain/entities/Brand';

export interface BrandFormValues {
  name: string;
}

interface BrandFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData: Brand | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: BrandFormValues) => void;
}

const BrandFormModal: React.FC<BrandFormModalProps> = ({
  open,
  mode,
  initialData,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setName(initialData.name);
      } else {
        setName('');
      }
      setError('');
    }
  }, [open, mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    onSubmit({ name: name.trim() });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="mx-4 my-10 w-full max-w-md overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
          <h3 className="text-lg font-semibold tracking-wide">
            {mode === 'create' ? 'Nueva Marca' : 'Editar Marca'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-brand-100 hover:text-white hover:bg-brand-700 transition-colors"
            disabled={submitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-lead-700">
              Nombre de la Marca
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                error ? 'border-red-500' : 'border-lead-300 bg-white'
              }`}
              placeholder="Ej: Samsung, LG, Sony..."
              disabled={submitting}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-lead-100">
            <button
              type="button"
              className="rounded bg-white px-4 py-2 text-sm font-medium text-lead-700 border border-lead-300 hover:bg-lead-100 transition-colors"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandFormModal;
