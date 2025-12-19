import React from 'react';
import { Category } from '../../../domain/entities/Category';

type CategoriesTableProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDeactivate: (category: Category) => void;
  busyId?: number | null;
};

const CategoriesTable: React.FC<CategoriesTableProps> = ({ categories, onEdit, onDeactivate, busyId }) => {
  if (!categories.length) {
    return (
      <div className="rounded-md border bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
        No hay categorías cargadas todavía.
      </div>
    );
  }

  const isBusy = (id: number) => busyId != null && busyId === id;

  return (
    <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-4 py-4 text-left font-semibold">ID</th>
            <th className="px-4 py-4 text-left font-semibold">Nombre</th>
            <th className="px-4 py-4 text-left font-semibold">Descripción</th>
            <th className="px-4 py-4 text-left font-semibold">Estado</th>
            <th className="w-40 px-4 py-4 text-left font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {categories.map(cat => (
            <tr key={cat.id} className="transition-colors hover:bg-white">
              <td className="px-4 py-3 font-medium text-brand-900">{cat.id}</td>
              <td className="px-4 py-3 text-lead-600">{cat.name}</td>
              <td className="px-4 py-3 text-lead-600">{cat.description ?? '—'}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${cat.state ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {cat.state ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(cat)}
                    className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                    disabled={isBusy(cat.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeactivate(cat)}
                    className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                    disabled={isBusy(cat.id) || !cat.state}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesTable;
