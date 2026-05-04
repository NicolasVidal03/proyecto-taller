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
  const clientMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    clients.forEach((c) => {
      map[c.id] = `${c.lastName} ${c.secondLastName} ${c.name}`.trim();
    });
    return map;
  }, [clients]);

  const businessTypeMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    businessTypes.forEach((bt) => { map[bt.id] = bt.name; });
    return map;
  }, [businessTypes]);

  const areaMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    areas.forEach((a) => { if (a.id !== undefined) map[a.id] = a.name; });
    return map;
  }, [areas]);

  const isEmpty = businesses.length === 0;

  const ActionButtons = ({ b }: { b: Business }) => (
    <>
      {onView && (
        <button
          onClick={() => onView(b)}
          className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
        >
          Ver
        </button>
      )}
      <button
        onClick={() => onEdit(b)}
        disabled={busyId === b.id}
        className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
      >
        Editar
      </button>
      <button
        onClick={() => onToggleActive(b)}
        disabled={busyId === b.id}
        className="rounded-lg bg-accent-100 px-3 py-1.5 text-xs font-semibold text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
      >
        {b.isActive ? 'Desactivar' : 'Activar'}
      </button>
      <button
        onClick={() => onRemove(b)}
        disabled={busyId === b.id}
        className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-50"
      >
        Eliminar
      </button>
    </>
  );

  const AreaSelect = ({ b }: { b: Business }) => (
    onChangeArea ? (
      <select
        className="input-plain text-sm w-full"
        value={b.areaId ?? ''}
        onChange={(e) => {
          const v = e.target.value === '' ? null : Number(e.target.value);
          onChangeArea(b.id, v);
        }}
        disabled={busyId === b.id}
      >
        <option value="">-</option>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
    ) : (
      <span>{b.areaId ? areaMap[b.areaId] || `Área ${b.areaId}` : '-'}</span>
    )
  );

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {isEmpty ? (
          <p className="py-8 text-center text-sm text-lead-500">No hay negocios registrados.</p>
        ) : businesses.map((b) => (
          <div key={b.id} className="rounded-xl border border-lead-200 bg-lead-50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 max-w-[60%]">
                <p className="font-semibold text-brand-900 whitespace-normal break-words">{b.name}</p>
                <p className="text-xs text-lead-500 mt-0.5">{clientMap[b.clientId] || `Cliente ${b.clientId}`}</p>
                <p className="text-xs text-lead-400 mt-0.5">{businessTypeMap[b.businessTypeId] || `Tipo ${b.businessTypeId}`}</p>
                {b.address && <p className="text-xs text-lead-400 mt-0.5 truncate">{b.address}</p>}
              </div>
              <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {b.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="mt-3 border-t border-lead-100 pt-3 space-y-2">
              {onChangeArea && (
                <div>
                  <p className="text-xs text-lead-400 uppercase tracking-wide mb-1">Área</p>
                  <AreaSelect b={b} />
                </div>
              )}
              <div className="flex flex-wrap gap-2 justify-end">
                <ActionButtons b={b} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
        {isEmpty ? (
          <p className="col-span-2 py-8 text-center text-sm text-lead-500">No hay negocios registrados.</p>
        ) : businesses.map((b) => (
          <div key={b.id} className="rounded-xl border border-lead-200 bg-lead-50 p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-brand-900 truncate" title={b.name}>{b.name}</p>
                <p className="text-xs text-lead-500 mt-0.5 truncate">{clientMap[b.clientId] || `Cliente ${b.clientId}`}</p>
              </div>
              <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {b.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-lead-600">
              <div>
                <p className="text-lead-400 uppercase tracking-wide">Tipo</p>
                <p className="font-medium">{businessTypeMap[b.businessTypeId] || '-'}</p>
              </div>
              <div>
                <p className="text-lead-400 uppercase tracking-wide">NIT</p>
                <p className="font-medium">{b.nit || '-'}</p>
              </div>
              {b.address && (
                <div className="col-span-2">
                  <p className="text-lead-400 uppercase tracking-wide">Dirección</p>
                  <p className="font-medium truncate">{b.address}</p>
                </div>
              )}
            </div>

            {onChangeArea && (
              <div>
                <p className="text-xs text-lead-400 uppercase tracking-wide mb-1">Área</p>
                <AreaSelect b={b} />
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 justify-end mt-auto">
              <ActionButtons b={b} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
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
              <th className="w-48 px-4 py-4 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lead-200">
            {isEmpty ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-lead-600">
                  No hay negocios registrados
                </td>
              </tr>
            ) : businesses.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-medium text-brand-900 max-w-[160px]">
                  <span className="block truncate" title={b.name}>{b.name}</span>
                </td>
                <td className="px-4 py-3 text-lead-600 max-w-[160px]">
                  <span className="block truncate" title={clientMap[b.clientId]}>
                    {clientMap[b.clientId] || `Cliente ${b.clientId}`}
                  </span>
                </td>
                <td className="px-4 py-3 text-lead-600">{businessTypeMap[b.businessTypeId] || `Tipo ${b.businessTypeId}`}</td>
                <td className="px-4 py-3 text-lead-600 min-w-[140px]">
                  <AreaSelect b={b} />
                </td>
                <td className="px-4 py-3 text-lead-600">{b.nit || '-'}</td>
                <td className="px-4 py-3 text-lead-600 max-w-[140px]">
                  <span className="block truncate" title={b.address || ''}>{b.address || '-'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {b.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <ActionButtons b={b} />
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

export default BusinessesTable;