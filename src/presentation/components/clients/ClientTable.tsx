import React from 'react';
import { Client } from '../../../domain/entities/Client';
import { Area } from '../../../domain/entities/Area';
import AreaSelect from './AreaSelect';

// Tipo simple para el mapa de áreas (solo para props compatibility)
type AreaMapType = Record<number, string>;

interface ClientTableProps {
  clients: Client[];
  areaMap: AreaMapType;
  areas: Area[];
  onUpdateArea: (clientId: number, areaId: number) => Promise<void>;
  onViewDetails: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  isUpdating?: boolean;
}

const ClientTable: React.FC<ClientTableProps> = ({ 
  clients, 
  areaMap, 
  areas,
  onUpdateArea,
  onViewDetails,
  onEdit,
  onDelete,
  isUpdating = false
}) => {
  const handleAreaChange = async (clientId: number, areaId: number | null) => {
    if (areaId === null) return;
    await onUpdateArea(clientId, areaId);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-4 py-4 text-left font-semibold">Nombre completo</th>
            <th className="px-4 py-4 text-left font-semibold">Razón social</th>
            <th className="px-4 py-4 text-left font-semibold">Teléfono</th>
            <th className="px-4 py-4 text-left font-semibold">Tipo negocio</th>
            <th className="px-4 py-4 text-left font-semibold">Tipo cliente</th>
            <th className="px-4 py-4 text-left font-semibold">Área</th>
            <th className="w-48 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {clients.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-sm text-lead-600">
                No hay clientes registrados
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr key={client.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-medium text-brand-900">{client.fullName}</td>
                <td className="px-4 py-3 text-lead-600">{client.businessName}</td>
                <td className="px-4 py-3 text-lead-600">{client.phone}</td>
                <td className="px-4 py-3 text-lead-600">{client.businessType}</td>
                <td className="px-4 py-3 text-lead-600">{client.clientType}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="max-w-[200px]">
                    <AreaSelect
                      areas={areas}
                      value={client.areaId}
                      onChange={(areaId) => handleAreaChange(client.id, areaId)}
                      disabled={isUpdating}
                      placeholder="Asignar área"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onViewDetails(client)}
                      className="rounded bg-lead-200 px-3 py-1.5 font-medium text-lead-800 transition hover:bg-lead-300 disabled:opacity-50"
                      title="Ver detalles"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => onEdit(client)}
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(client)}
                      className={`rounded px-3 py-1.5 font-medium transition disabled:opacity-50 ${
                        client.status 
                          ? 'bg-accent-100 text-accent-700 hover:bg-accent-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={client.status ? "Desactivar" : "Activar"}
                    >
                      {client.status ? "Eliminar" : "Activar"}
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

export default ClientTable;
