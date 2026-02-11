import React from 'react';
import { PriceType } from '../../../domain/entities/PriceType';

interface ClientTypesTableProps {
  priceTypes: PriceType[];
  onEdit: (priceType: PriceType) => void;
  onDelete: (priceType: PriceType) => void;
  busyId?: number | null;
}

const ClientTypesTable: React.FC<ClientTypesTableProps> = ({
  priceTypes,
  onEdit,
  onDelete,
  busyId,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-4 py-4 text-left font-semibold">ID</th>
            <th className="px-4 py-4 text-left font-semibold">Nombre</th>
            <th className="px-4 py-4 text-left font-semibold">Estado</th>
            <th className="w-40 px-4 py-4 text-center font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {priceTypes.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-sm text-lead-600">
                No hay tipos de precio registrados
              </td>
            </tr>
          ) : (
            priceTypes.map((ct) => (
              <tr key={ct.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 text-lead-600">#{ct.id}</td>
                <td className="px-4 py-3 font-medium text-brand-900">{ct.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ct.state
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ct.state ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(ct)}
                      disabled={busyId === ct.id}
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(ct)}
                      disabled={busyId === ct.id}
                      className={`rounded px-3 py-1.5 font-medium transition disabled:opacity-50 ${
                        ct.state
                          ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={ct.state ? 'Desactivar' : 'Activar'}
                    >
                      {ct.state ? 'Eliminar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTypesTable;
