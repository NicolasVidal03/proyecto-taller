import React from 'react';
import { Category } from '../../../domain/entities/Category';

type CategoriesTableProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDeactivate: (category: Category) => void;
  busyId?: number | null;
};

const CategoriesTable: React.FC<CategoriesTableProps> = ({ categories, onEdit, onDeactivate, busyId }) => {
  const isEmpty = !categories.length;
  const isBusy = (id: number) => busyId != null && busyId === id;

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {isEmpty ? (
          <p className="py-8 text-center text-sm text-lead-500">No hay categorías registradas.</p>
        ) : categories.map(cat => (
          <div key={cat.id} className="rounded-xl border border-lead-200 bg-lead-50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 max-w-[60%]">
                <p className="font-semibold text-brand-900 whitespace-normal break-words">{cat.name}</p>
                {cat.description && (
                  <p className="text-xs text-lead-500 mt-0.5 whitespace-normal break-words">{cat.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(cat)}
                  disabled={isBusy(cat.id)}
                  className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDeactivate(cat)}
                  disabled={isBusy(cat.id) || !cat.state}
                  className="rounded-lg bg-accent-100 px-3 py-1.5 text-xs font-semibold text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
            <tr>
              <th className="px-4 py-4 text-left font-semibold">Nombre</th>
              <th className="px-4 py-4 text-left font-semibold">Descripción</th>
              <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lead-200">
            {isEmpty ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-lead-500">
                  No hay categorías registradas.
                </td>
              </tr>
            ) : categories.map(cat => (
              <tr key={cat.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-medium text-brand-900 max-w-[200px]">
                  <span className="block truncate" title={cat.name}>{cat.name}</span>
                </td>
                <td className="px-4 py-3 text-lead-600 max-w-[300px]">
                  <span className="block truncate" title={cat.description ?? ''}>{cat.description ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-center align-middle">
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
    </>
  );
};

export default CategoriesTable;