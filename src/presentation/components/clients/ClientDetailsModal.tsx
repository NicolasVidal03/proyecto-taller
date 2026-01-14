import React from 'react';
import { Client } from '../../../domain/entities/Client';
import { AreaMap, getAreaName } from '../../utils/areaHelpers';

interface ClientDetailsModalProps {
  client: Client | null;
  areaMap: AreaMap;
  onClose: () => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ client, areaMap, onClose }) => {
  if (!client) return null;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm p-4 md:p-0">
      <div className="relative w-full max-w-3xl transform rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header con imagen banner (ancha, redondeada) */}
        <div className="relative h-56 w-full overflow-hidden rounded-t-3xl bg-gray-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-white hover:bg-black/40 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {client.pathImage ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <img
                src={`${apiUrl}${client.pathImage}`}
                alt={client.fullName}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  // fallback to empty transparent pixel if loading fails
                  (e.target as HTMLImageElement).src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
                }}
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-100">
              <div className="mx-auto w-full max-w-2xl rounded-lg bg-white/80 p-6 text-center">
                <div className="text-5xl font-bold text-brand-600">{client.fullName.charAt(0)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="px-8 pb-8 pt-8">
          <div className="mb-2 text-center">
            <h2 className="text-3xl font-bold text-gray-900">{client.fullName}</h2>
            <p className="text-lg text-brand-600 font-medium">{client.businessName}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {client.clientType}
              </span>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                {client.businessType}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl bg-gray-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Información de Contacto</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-white p-2 text-brand-500 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-white p-2 text-brand-500 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">NIT / CI</p>
                    <p className="font-medium text-gray-900">{client.nitCi}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl bg-gray-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Ubicación</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-white p-2 text-brand-500 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Dirección</p>
                    <p className="font-medium text-gray-900">{client.address || 'No registrada'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-white p-2 text-brand-500 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Área Asignada</p>
                    <p className="font-medium text-gray-900">
                      {client.areaId ? getAreaName(areaMap, client.areaId) : 'Sin asignar'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mapa placeholder si hay coordenadas */}
          {client.position && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-sm font-medium text-gray-600">Coordenadas GPS</p>
              <div className="flex items-center gap-4 text-sm text-gray-800">
                <span className="rounded bg-white px-3 py-1 shadow-sm">Lat: {client.position.lat}</span>
                <span className="rounded bg-white px-3 py-1 shadow-sm">Lng: {client.position.lng}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
