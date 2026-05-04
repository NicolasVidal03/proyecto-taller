import React from 'react';
import { Presentation } from '../../../domain/entities/Presentation';

type PresentationsTableProps = {
  presentations: Presentation[];
  onEdit: (presentation: Presentation) => void;
  onDeactivate: (presentation: Presentation) => void;
  busyId?: number | null;
};

const PresentationsTable: React.FC<PresentationsTableProps> = ({ presentations, onEdit, onDeactivate, busyId }) => {
  const isEmpty = !presentations.length;
  const isBusy = (id: number) => busyId != null && busyId === id;

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {isEmpty ? (
          <p className="py-8 text-center text-sm text-lead-500">No hay presentaciones registradas.</p>
        ) : presentations.map(pres => (
          <div
            key={pres.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-lead-200 bg-lead-50 px-4 py-3 shadow-sm"
          >
            <span className="min-w-0 max-w-[60%] whitespace-normal break-words font-medium text-brand-900">{pres.name}</span>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onEdit(pres)}
                disabled={isBusy(pres.id)}
                className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDeactivate(pres)}
                disabled={isBusy(pres.id) || !pres.state}
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
                  No hay presentaciones registradas.
                </td>
              </tr>
            ) : presentations.map(pres => (
              <tr key={pres.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-medium text-brand-900 max-w-[300px]">
                  <span className="block truncate" title={pres.name}>{pres.name}</span>
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(pres)}
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                      disabled={isBusy(pres.id)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeactivate(pres)}
                      className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                      disabled={isBusy(pres.id) || !pres.state}
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

export default PresentationsTable;