import React from 'react';
import { Color } from '../../../domain/entities/Color';

type ColorsTableProps = {
  colors: Color[];
  onEdit: (color: Color) => void;
  onDeactivate: (color: Color) => void;
  busyId?: number | null;
};

const ColorsTable: React.FC<ColorsTableProps> = ({ colors, onEdit, onDeactivate, busyId }) => {
  if (!colors.length) {
    return (
      <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
            <tr>
              <th className="px-4 py-4 text-left font-semibold">ID</th>
              <th className="px-4 py-4 text-left font-semibold">Nombre</th>
              <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lead-200">
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-lead-500">
                No hay colores registrados.
              </td>
            </tr>
          </tbody>
        </table>
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
            <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {colors.map(color => (
            <tr key={color.id} className="transition-colors hover:bg-white">
              <td className="px-4 py-3 font-medium text-brand-900">{color.id}</td>
              <td className="px-4 py-3 text-lead-600">{color.name}</td>
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
  );
};

export default ColorsTable;
