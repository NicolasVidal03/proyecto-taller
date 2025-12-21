import React from 'react';
import { Supplier } from '../../../domain/entities/Supplier';

type SuppliersTableProps = {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDeactivate: (supplier: Supplier) => void;
  busyId?: number | null;
};

const SuppliersTable: React.FC<SuppliersTableProps> = ({ suppliers, onEdit, onDeactivate, busyId }) => {
  if (!suppliers.length) {
    return (
      <div className="rounded-md border bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
        No hay proveedores cargados todavía.
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
            <th className="px-4 py-4 text-left font-semibold">Contacto</th>
            <th className="px-4 py-4 text-left font-semibold">Teléfono</th>
            <th className="px-4 py-4 text-left font-semibold">Dirección</th>
            <th className="px-4 py-4 text-left font-semibold">Estado</th>
            <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {suppliers.map(sup => (
            <tr key={sup.id} className="transition-colors hover:bg-white">
              <td className="px-4 py-3 font-medium text-brand-900">{sup.id}</td>
              <td className="px-4 py-3 text-lead-600">{sup.name}</td>
              <td className="px-4 py-3 text-lead-600">{sup.contactName ?? '—'}</td>
              <td className="px-4 py-3 text-lead-600">{sup.phone ?? '—'}</td>
              <td className="px-4 py-3 text-lead-600">{sup.address ?? '—'}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${sup.state ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {sup.state ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3 text-center align-middle">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(sup)}
                    className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                    disabled={isBusy(sup.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeactivate(sup)}
                    className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                    disabled={isBusy(sup.id) || !sup.state}
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

export default SuppliersTable;
