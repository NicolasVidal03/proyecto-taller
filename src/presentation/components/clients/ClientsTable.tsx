import React from 'react';
import { Client } from '../../../domain/entities/Client';

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onView?: (client: Client) => void;
}

const ClientsTable: React.FC<ClientsTableProps> = ({ clients, onEdit, onDelete, onView }) => {
  const isEmpty = clients.length === 0;

  const fullName = (client: Client) =>
    `${client.lastName || ''} ${client.secondLastName || ''} ${client.name}`.trim();

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {isEmpty ? (
          <p className="py-8 text-center text-sm text-lead-500">No hay clientes registrados.</p>
        ) : clients.map((client) => (
          <div key={client.id} className="rounded-xl border border-lead-200 bg-lead-50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 max-w-[60%]">
                <p className="font-semibold text-brand-900 whitespace-normal break-words">{fullName(client)}</p>
                <p className="text-xs text-lead-500 mt-0.5">{client.phone}</p>
                {client.ci && (
                  <p className="text-xs text-lead-400 font-mono mt-0.5">
                    {client.ci}{client.ciExt ? ' ' + client.ciExt : ''}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1.5 items-end">
                {onView && (
                  <button
                    onClick={() => onView(client)}
                    className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
                  >
                    Ver
                  </button>
                )}
                <button
                  onClick={() => onEdit(client)}
                  className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-200"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(client)}
                  className="rounded-lg bg-accent-100 px-3 py-1.5 text-xs font-semibold text-accent-700 transition hover:bg-accent-200"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
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
            {isEmpty ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-lead-600">
                  No hay clientes registrados
                </td>
              </tr>
            ) : clients.map((client) => (
              <tr key={client.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-medium text-brand-900 max-w-[200px]">
                  <span className="block truncate" title={fullName(client)}>{fullName(client)}</span>
                </td>
                <td className="px-4 py-3 text-lead-600">{client.phone}</td>
                <td className="px-4 py-3 text-lead-600">
                  {client.ci ? `${client.ci}${client.ciExt ? ' ' + client.ciExt : ''}` : '-'}
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(client)}
                        className="rounded bg-blue-100 px-3 py-1.5 font-medium text-blue-700 transition hover:bg-blue-200"
                      >
                        Ver
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(client)}
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(client)}
                      className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200"
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

export default ClientsTable;