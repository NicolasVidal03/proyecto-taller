import React from 'react';
import { Business } from '../../../domain/entities/Business';
import { Client } from '../../../domain/entities/Client';
import { BusinessType } from '../../../domain/entities/BusinessType';
import { Area } from '../../../domain/entities/Area';
import { AreaMap, getAreaName } from '../../utils/areaHelpers';
import { env } from '../../../infrastructure/config/env';

interface BusinessDetailsModalProps {
  business: Business | null;
  clients: Client[];
  businessTypes: BusinessType[];
  areaMap: AreaMap;
  onClose: () => void;
}

const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({ business, clients, businessTypes, areaMap, onClose }) => {
  if (!business) return null;

  const apiUrl = env.apiBaseUrl || 'http://localhost:3000';

  const client = clients.find((c) => c.id === business.clientId) || null;
  const businessType = businessTypes.find((bt) => bt.id === business.businessTypeId) || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm p-4 md:p-0">
      <div className="relative w-full max-w-3xl transform rounded-3xl bg-white shadow-2xl transition-all">
        <div className="relative h-56 w-full overflow-hidden rounded-t-3xl bg-gray-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-white hover:bg-black/40 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {business.pathImage ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <img
                src={`${apiUrl}${business.pathImage}`}
                alt={business.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
                }}
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-100">
              <div className="mx-auto w-full max-w-2xl rounded-lg bg-white/80 p-6 text-center">
                <div className="text-5xl font-bold text-brand-600">{(business.name || '').charAt(0)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 pb-8 pt-8">
          <div className="mb-2 text-center">
            <h2 className="text-3xl font-bold text-gray-900">{business.name}</h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className={`inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800`}>
                {businessType ? businessType.name : `Tipo ${business.businessTypeId}`}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${business.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {business.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl bg-gray-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Información</h3>
              <div className="space-y-3">
                <p><span className="font-medium">NIT:</span> {business.nit || 'No registrado'}</p>
                <p><span className="font-medium">Dirección:</span> {business.address || 'No registrada'}</p>
                <p><span className="font-medium">Posición:</span> {business.position ? `Lat ${business.position.lat}, Lng ${business.position.lng}` : 'No registrada'}</p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl bg-gray-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Propietario</h3>
              <div className="space-y-3">
                <p className="text-sm"><span className="font-medium">Cliente:</span> {client ? `${client.lastName || ''} ${client.secondLastName || ''} ${client.name}`.trim() : `Cliente ${business.clientId}`}</p>
                <p className="text-sm"><span className="font-medium">Teléfono:</span> {client && client.phone ? (<a className="text-brand-600 font-medium" href={`tel:${client.phone}`}>{client.phone}</a>) : '-'}</p>
                <p className="text-sm"><span className="font-medium">CI:</span> {client ? (client.ci ? `${client.ci}${client.ciExt ? ' ' + client.ciExt : ''}` : '-') : '-'}</p>
                <p className="text-sm"><span className="font-medium">Área:</span> {business.areaId ? getAreaName(areaMap, business.areaId) : 'Sin asignar'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailsModal;
