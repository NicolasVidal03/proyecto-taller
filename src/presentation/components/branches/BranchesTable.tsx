import React from 'react';
import { Branch } from '../../../domain/entities/Branch';

type BranchesTableProps = {
  branches: Branch[];
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  busyBranchId?: number | null;
};

const BranchesTable: React.FC<BranchesTableProps> = ({ branches, onEdit, onDelete, busyBranchId = null }) => {
  const isEmpty = branches.length === 0;
  const isBusy  = (id: number) => busyBranchId != null && busyBranchId === id;

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-lead-200 bg-lead-50 px-4 py-8 text-center text-sm text-lead-500 shadow-lg">
        No hay sucursales para mostrar.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {branches.map(branch => (
          <div
            key={branch.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-lead-200 bg-lead-50 px-4 py-3 shadow-sm"
          >
            <span className="truncate font-medium text-lead-800">{branch.name}</span>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onEdit(branch)}
                disabled={isBusy(branch.id)}
                className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(branch)}
                disabled={isBusy(branch.id)}
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
              <th className="w-40 px-4 py-4 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lead-200">
            {branches.map(branch => (
              <tr key={branch.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 text-lead-600">{branch.name}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(branch)}
                      disabled={isBusy(branch.id)}
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(branch)}
                      disabled={isBusy(branch.id)}
                      className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
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

export default BranchesTable;