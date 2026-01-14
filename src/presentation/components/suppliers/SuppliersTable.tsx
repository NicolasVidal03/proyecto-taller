import React from 'react';
import { Supplier } from '../../../domain/entities/Supplier';

type SuppliersTableProps = {
  suppliers: Supplier[];
  countryMap: Record<number, string>;
  onEdit: (supplier: Supplier) => void;
  onDeactivate: (supplier: Supplier) => void;
  busyId?: number | null;
};

const SuppliersTable: React.FC<SuppliersTableProps> = ({ suppliers, countryMap, onEdit, onDeactivate, busyId }) => {
  const isEmpty = suppliers.length === 0;

  const isBusy = (id: number) => busyId != null && busyId === id;

  return (
    <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-4 py-4 text-left font-semibold">NIT</th>
            <th className="px-4 py-4 text-left font-semibold">Nombre</th>
            <th className="px-4 py-4 text-left font-semibold">Teléfono</th>
            <th className="px-4 py-4 text-left font-semibold">País</th>
            <th className="px-4 py-4 text-left font-semibold">Dirección</th>
            <th className="px-4 py-4 text-left font-semibold">Contacto</th>
            <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {isEmpty ? (
            <tr>
              <td className="px-4 py-6 text-center text-sm text-lead-600" colSpan={7}>
                No hay proveedores para mostrar.
              </td>
            </tr>
          ) : suppliers.map(sup => (
            <tr key={sup.id} className="transition-colors hover:bg-white">
              <td className="px-4 py-3 text-lead-600">{sup.nit ?? '—'}</td>
              <td className="px-4 py-3 font-medium text-brand-900">{sup.name}</td>
              <td className="px-4 py-3 text-lead-600">{sup.phone ?? '—'}</td>
              <td className="px-4 py-3 text-lead-600">
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  {countryMap[sup.countryId] || 'Desconocido'}
                </span>
              </td>
              <td className="px-4 py-3 text-lead-600">{sup.address ?? '—'}</td>
              <td className="px-4 py-3 text-lead-600">{sup.contactName ?? '—'}</td>
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
