import React from 'react';
import { BusinessType } from '../../../domain/entities/BusinessType';

interface BusinessTypesTableProps {
  businessTypes: BusinessType[];
  onEdit: (businessType: BusinessType) => void;
  onDelete: (businessType: BusinessType) => void;
  busyId?: number | null;
}

const BusinessTypesTable: React.FC<BusinessTypesTableProps> = ({
  businessTypes,
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
          {businessTypes.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-sm text-lead-600">
                No hay tipos de negocio registrados
              </td>
            </tr>
          ) : (
            businessTypes.map((bt) => (
              <tr key={bt.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 text-lead-600">#{bt.id}</td>
                <td className="px-4 py-3 font-medium text-brand-900">{bt.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      bt.state
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {bt.state ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(bt)}
                      disabled={busyId === bt.id}
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(bt)}
                      disabled={busyId === bt.id}
                      className={`rounded px-3 py-1.5 font-medium transition disabled:opacity-50 ${
                        bt.state
                          ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={bt.state ? 'Desactivar' : 'Activar'}
                    >
                      {bt.state ? 'Eliminar' : 'Activar'}
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

export default BusinessTypesTable;
