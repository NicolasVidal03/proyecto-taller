import React from 'react';
import { Business } from '../../../domain/entities/Business';
import { Client } from '../../../domain/entities/Client';
import { BusinessType } from '../../../domain/entities/BusinessType';
import { Area } from '../../../domain/entities/Area';

interface BusinessesTableProps {
  businesses: Business[];
  clients: Client[];
  businessTypes: BusinessType[];
  areas: Area[];
  onEdit: (business: Business) => void;
  onToggleActive: (business: Business) => void;
  onRemove: (business: Business) => void;
  onView?: (business: Business) => void;
  onChangeArea?: (businessId: number, areaId: number | null) => void;
  busyId?: number | null;
}

/**
 * BusinessesTable - matches backend entity with isActive
 * Shows: name, clientId (resolved), businessTypeId (resolved), areaId (resolved), nit, address, isActive
 */
const BusinessesTable: React.FC<BusinessesTableProps> = ({
  businesses,
  clients,
  businessTypes,
  areas,
  onEdit,
  onToggleActive,
  onRemove,
  onView,
  onChangeArea,
  busyId,
}) => {
  // Create lookup maps
  const clientMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    clients.forEach((c) => {
      map[c.id] = `${c.lastName} ${c.secondLastName} ${c.name}`.trim();
    });
    return map;
  }, [clients]);

  const businessTypeMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    businessTypes.forEach((bt) => {
      map[bt.id] = bt.name;
    });
    return map;
  }, [businessTypes]);

  const areaMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    areas.forEach((a) => {
      if (a.id !== undefined) {
        map[a.id] = a.name;
      }
    });
    return map;
  }, [areas]);

  return (
    <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-4 py-4 text-left font-semibold">Nombre</th>
            <th className="px-4 py-4 text-left font-semibold">Cliente (Dueño)</th>
            <th className="px-4 py-4 text-left font-semibold">Tipo</th>
            <th className="px-4 py-4 text-left font-semibold">Área</th>
            <th className="px-4 py-4 text-left font-semibold">NIT</th>
            <th className="px-4 py-4 text-left font-semibold">Dirección</th>
            <th className="px-4 py-4 text-left font-semibold">Estado</th>
            <th className="w-40 px-4 py-4 text-center font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {businesses.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-sm text-lead-600">
                No hay negocios registrados
              </td>
            </tr>
          ) : (
            businesses.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-medium text-brand-900">{b.name}</td>
                <td className="px-4 py-3 text-lead-600">{clientMap[b.clientId] || `Cliente ${b.clientId}`}</td>
                <td className="px-4 py-3 text-lead-600">{businessTypeMap[b.businessTypeId] || `Tipo ${b.businessTypeId}`}</td>
                <td className="px-4 py-3 text-lead-600">
                  {onChangeArea ? (
                    <select
                      className="rounded border border-lead-200 bg-white px-2 py-1 text-sm"
                      value={b.areaId ?? ''}
                      onChange={(e) => {
                        const v = e.target.value === '' ? null : Number(e.target.value);
                        onChangeArea(b.id, v);
                      }}
                      disabled={busyId === b.id}
                    >
                      <option value="">-</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    b.areaId ? areaMap[b.areaId] || `Área ${b.areaId}` : '-'
                  )}
                </td>
                <td className="px-4 py-3 text-lead-600">{b.nit || '-'}</td>
                <td className="px-4 py-3 text-lead-600 max-w-xs truncate">{b.address || '-'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {b.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {onView && (
                      <button
                        className="rounded bg-blue-100 px-3 py-1.5 font-medium text-blue-700 transition hover:bg-blue-200 disabled:opacity-50"
                        onClick={() => onView(b)}
                      >
                        Ver
                      </button>
                    )}
                    <button
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                      onClick={() => onEdit(b)}
                      disabled={busyId === b.id}
                    >
                      Editar
                    </button>
                    <button
                      className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                      onClick={() => onToggleActive(b)}
                      disabled={busyId === b.id}
                    >
                      {b.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      className="rounded bg-red-100 px-3 py-1.5 font-medium text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                      onClick={() => onRemove(b)}
                      disabled={busyId === b.id}
                    >
                      Eliminar
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

export default BusinessesTable;
