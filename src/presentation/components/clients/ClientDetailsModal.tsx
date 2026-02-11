import React from 'react';
import { Client } from '../../../domain/entities/Client';

interface ClientDetailsModalProps {
  client: Client | null;
  onClose: () => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ client, onClose }) => {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm p-4 md:p-0">
      <div className="relative w-full max-w-lg transform rounded-3xl bg-white shadow-2xl transition-all">
        <div className="relative h-32 w-full overflow-hidden rounded-t-3xl bg-gradient-to-r from-brand-600 to-brand-500">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-white hover:bg-black/40 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-5xl font-bold text-white/80">
              {(client.lastName || client.name || '').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {`${client.lastName || ''} ${client.secondLastName || ''} ${client.name}`.trim()}
            </h2>
            <div className="mt-3" />
          </div>

          <div className="space-y-4 rounded-2xl bg-gray-50 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Informacion de Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-lg bg-white p-2 text-brand-500 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Telefono</p>
                  <p className="font-medium text-gray-900">{client.phone || 'No registrado'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-lg bg-white p-2 text-brand-500 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">CI</p>
                  <p className="font-medium text-gray-900">
                    {client.ci ? `${client.ci}${client.ciExt ? ' ' + client.ciExt : ''}` : 'No registrada'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
