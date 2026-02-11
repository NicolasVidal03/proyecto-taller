import React from 'react';
import { Client } from '../../../domain/entities/Client';

interface ClientTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

/**
 * Simplified ClientTable - matches backend entity
 * Shows: name (full), phone, ci
 */
const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-4 py-4 text-left font-semibold">Nombre completo</th>
            <th className="px-4 py-4 text-left font-semibold">Teléfono</th>
            <th className="px-4 py-4 text-left font-semibold">CI</th>
            <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {clients.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-sm text-lead-600">
                No hay clientes registrados
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr key={client.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-medium text-brand-900">
                  {`${client.lastName} ${client.secondLastName} ${client.name}`.trim()}
                </td>
                <td className="px-4 py-3 text-lead-600">{client.phone}</td>
                <td className="px-4 py-3 text-lead-600">{client.ci ? `${client.ci}${client.ciExt ? ' ' + client.ciExt : ''}` : '-'}</td>
                <td className="px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(client)}
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(client)}
                      className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                      title="Eliminar"
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

export default ClientTable;
