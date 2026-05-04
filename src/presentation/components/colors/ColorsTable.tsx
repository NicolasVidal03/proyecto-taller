import React from 'react';
import { Color } from '../../../domain/entities/Color';

type ColorsTableProps = {
  colors: Color[];
  onEdit: (color: Color) => void;
  onDeactivate: (color: Color) => void;
  busyId?: number | null;
};

const ColorsTable: React.FC<ColorsTableProps> = ({ colors, onEdit, onDeactivate, busyId }) => {
  const isEmpty = !colors.length;
  const isBusy = (id: number) => busyId != null && busyId === id;

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {isEmpty ? (
          <p className="py-8 text-center text-sm text-lead-500">No hay colores registrados.</p>
        ) : colors.map(color => (
          <div
            key={color.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-lead-200 bg-lead-50 px-4 py-3 shadow-sm"
          >
            <span className="min-w-0 max-w-[60%] whitespace-normal break-words font-medium text-lead-800">{color.name}</span>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onEdit(color)}
                disabled={isBusy(color.id)}
                className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDeactivate(color)}
                disabled={isBusy(color.id) || !color.state}
                className="rounded-lg bg-accent-100 px-3 py-1.5 text-xs font-semibold text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
            <tr>
              <th className="px-4 py-4 text-left font-semibold">Nombre</th>
              <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lead-200">
            {isEmpty ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-lead-500">
                  No hay colores registrados.
                </td>
              </tr>
            ) : colors.map(color => (
              <tr key={color.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 text-lead-600 max-w-[300px]">
                  <span className="block truncate" title={color.name}>{color.name}</span>
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(color)}
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                      disabled={isBusy(color.id)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeactivate(color)}
                      className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                      disabled={isBusy(color.id) || !color.state}
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

export default ColorsTable;