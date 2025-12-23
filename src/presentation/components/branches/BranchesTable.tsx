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
  const isBusy = (id: number) => busyBranchId != null && busyBranchId === id;

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
          {isEmpty ? (
            <tr>
              <td className="px-4 py-6 text-center text-sm text-lead-600" colSpan={3}>
                No hay sucursales para mostrar.
              </td>
            </tr>
          ) : branches.map(branch => (
            <tr key={branch.id} className="transition-colors hover:bg-white">
              <td className="px-4 py-3 font-medium text-brand-900">#{branch.id}</td>
              <td className="px-4 py-3 text-lead-600">{branch.name}</td>
              <td className="px-4 py-3 text-center align-middle">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(branch)}
                    className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                    disabled={isBusy(branch.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(branch)}
                    className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                    disabled={isBusy(branch.id)}
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

export default BranchesTable;
