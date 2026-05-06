import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Business } from '../../../domain/entities/Business';
import { Client } from '../../../domain/entities/Client';
import { BusinessType } from '../../../domain/entities/BusinessType';
import { PriceType } from '../../../domain/entities/PriceType';
import { Area } from '../../../domain/entities/Area';
import { CreateBusinessDTO, UpdateBusinessDTO } from '../../../domain/ports/IBusinessRepository';
import { container } from '../../../infrastructure/config/container';
import { BusinessMapLocationPicker } from './BusinessMapLocationPicker';

type BusinessFormModalProps = {
  business: Business | null;
  clients: Client[];
  businessTypes: BusinessType[];
  priceTypes: PriceType[];
  areas: Area[];
  onClose: () => void;
  onSave: (data: CreateBusinessDTO | UpdateBusinessDTO) => void;
  saving: boolean;
};

const BusinessFormModal: React.FC<BusinessFormModalProps> = ({
  business,
  clients,
  businessTypes,
  priceTypes,
  areas,
  onClose,
  onSave,
  saving,
}) => {
  const isEdit = !!business?.id;
  const [name, setName] = useState('');
  const [nit, setNit] = useState('');
  const [address, setAddress] = useState('');
  const [clientId, setClientId] = useState<number | ''>('');
  const [businessTypeId, setBusinessTypeId] = useState<number | ''>('');
  const [priceTypeId, setPriceTypeId] = useState<number | ''>('');
  const [areaId, setAreaId] = useState<number | ''>('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [clientSearching, setClientSearching] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const clientSearchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getClientFullName = (client: Client): string =>
    `${client.lastName} ${client.secondLastName} ${client.name}`.trim();

  const searchClients = useCallback(async (term: string) => {
    if (!term.trim()) { setClientResults([]); return; }
    setClientSearching(true);
    try {
      const results = await container.clients.search({ search: term, limit: 10 });
      setClientResults(results);
    } catch (error) {
      console.error('Error searching clients:', error);
      setClientResults([]);
    } finally {
      setClientSearching(false);
    }
  }, []);

  const handleClientSearchChange = (value: string) => {
    setClientSearch(value);
    setShowClientDropdown(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => { searchClients(value); }, 300);
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientId(client.id);
    setClientSearch(getClientFullName(client));
    setShowClientDropdown(false);
    setClientResults([]);
    if (errors.clientId) setErrors((prev) => ({ ...prev, clientId: '' }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (business) {
      setName(business.name ?? '');
      setNit(business.nit ?? '');
      setAddress(business.address ?? '');
      setClientId(business.clientId ?? '');
      setBusinessTypeId(business.businessTypeId ?? '');
      setPriceTypeId(business.priceTypeId ?? '');
      setAreaId(business.areaId ?? '');
      setIsActive(business.isActive ?? true);
      if (business.position) {
        setLat(String(business.position.lat ?? ''));
        setLng(String(business.position.lng ?? ''));
      } else {
        setLat('');
        setLng('');
      }
      setImageFile(null);
      if (business.clientId && clients.length > 0) {
        const existingClient = clients.find((c) => c.id === business.clientId);
        if (existingClient) {
          setSelectedClient(existingClient);
          setClientSearch(getClientFullName(existingClient));
        }
      }
    } else {
      setName('');
      setNit('');
      setAddress('');
      setClientId('');
      setBusinessTypeId('');
      setPriceTypeId('');
      setAreaId('');
      setLat('');
      setLng('');
      setIsActive(true);
      setImageFile(null);
      setSelectedClient(null);
      setClientSearch('');
    }
    setErrors({});
  }, [business, clients]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'El nombre es obligatorio';
    if (!clientId) next.clientId = 'Seleccione un cliente';
    if (!businessTypeId) next.businessTypeId = 'Seleccione tipo de negocio';
    if (!lat || !lng) next.position = 'La ubicación es obligatoria';
    if (nit.trim() && !/^\d{9,15}$/.test(nit.trim())) {
      next.nit = 'NIT inválido (entre 9 y 15 dígitos)';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setImageFile(f);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const dto: any = {
      name: name.trim().replace(/\s+/g, ' '),
      nit: nit.trim() || null,
      address: address.trim().replace(/\s+/g, ' ') || null,
      clientId: clientId ? Number(clientId) : undefined,
      businessTypeId: businessTypeId ? Number(businessTypeId) : undefined,
      priceTypeId: priceTypeId === '' ? null : Number(priceTypeId),
      areaId: areaId ? Number(areaId) : null,
      position: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null,
      isActive: isActive,
    };
    if (imageFile) dto.imageFile = imageFile;
    if (isEdit && business) dto.id = business.id;
    onSave(dto as CreateBusinessDTO | UpdateBusinessDTO);
  };

  const title = isEdit ? 'Editar Negocio' : 'Nuevo Negocio';
  const submitLabel = isEdit ? 'Guardar cambios' : 'Crear negocio';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5 flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-brand-600 px-6 py-4 text-white shrink-0">
          <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-brand-100 hover:text-white hover:bg-brand-700 transition-colors"
            disabled={saving}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-4 py-5 sm:px-6 sm:py-6 overflow-y-auto flex-1">

          <div className="flex flex-col gap-4">

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full sm:flex-[0_0_66%]">
                <label className="block text-sm font-medium text-lead-700">Nombre *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ferretería San José"
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.name ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                  maxLength={45}
                  disabled={saving}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="w-full sm:flex-[0_0_calc(34%-1rem)]">
                <label className="block text-sm font-medium text-lead-700">NIT</label>
                <input
                  value={nit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setNit(val);
                    if (errors.nit) setErrors((prev) => ({ ...prev, nit: '' }));
                  }}
                  placeholder="Ej: 1234567891"
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.nit ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                  disabled={saving}
                />
                {errors.nit && <p className="mt-1 text-xs text-red-600">{errors.nit}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div ref={clientSearchRef} className="relative z-[60]">
                <label className="block text-sm font-medium text-lead-700">Dueño (Cliente) *</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => handleClientSearchChange(e.target.value)}
                    onFocus={() => clientSearch && setShowClientDropdown(true)}
                    placeholder="Buscar cliente..."
                    className={`block w-full rounded-lg border px-3 py-2 text-sm pr-10 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.clientId ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                    disabled={saving}
                  />
                  {clientSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin h-4 w-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                  {selectedClient && !clientSearching && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClient(null);
                        setClientId('');
                        setClientSearch('');
                        setClientResults([]);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-lead-400 hover:text-lead-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {showClientDropdown && clientResults.length > 0 && (
                  <div className="absolute z-[1000] mt-1 w-full bg-white border border-lead-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {clientResults.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-brand-50 focus:bg-brand-50 focus:outline-none border-b border-lead-100 last:border-b-0"
                      >
                        <span className="font-medium text-lead-900">{getClientFullName(client)}</span>
                        {client.ci && <span className="text-lead-500 ml-2">• CI: {client.ci}</span>}
                        {client.phone && <span className="text-lead-500 ml-2">• Tel: {client.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
                {showClientDropdown && clientSearch.trim() && !clientSearching && clientResults.length === 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-lead-200 rounded-lg shadow-lg p-4 text-sm text-lead-500 text-center">
                    No se encontraron clientes con "{clientSearch}"
                  </div>
                )}
                {errors.clientId && <p className="mt-1 text-xs text-red-600">{errors.clientId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-lead-700">Tipo de negocio *</label>
                <select
                  value={businessTypeId}
                  id='businessType'
                  onChange={(e) => {
                    setBusinessTypeId(e.target.value ? Number(e.target.value) : '');
                    if (errors.businessTypeId) setErrors((prev) => ({ ...prev, businessTypeId: '' }));
                  }}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.businessTypeId ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                  disabled={saving}
                >
                  <option value="">Seleccione...</option>
                  {businessTypes.map((bt) => (
                    <option key={bt.id} value={bt.id}>{bt.name}</option>
                  ))}
                </select>
                {errors.businessTypeId && <p className="mt-1 text-xs text-red-600">{errors.businessTypeId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-lead-700">Tipo de precio</label>
                <select
                  value={priceTypeId}
                  id='businessPrice'
                  onChange={(e) => setPriceTypeId(e.target.value ? Number(e.target.value) : '')}
                  className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                  disabled={saving}
                >
                  <option value="">Sin asignar</option>
                  {priceTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-lead-700">Área</label>
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value ? Number(e.target.value) : '')}
                  className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                  disabled={saving}
                >
                  <option value="">Sin asignar</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-lead-700">Dirección</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                  }}
                  maxLength={150}
                  placeholder="Ej. Avenida América entre Jaime Mendoza y Daniel Albornos"
                  rows={1}
                  className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 resize-none overflow-hidden"
                  disabled={saving}
                />
              </div>
            </div>

            <BusinessMapLocationPicker
              lat={lat}
              lng={lng}
              onChange={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
                if (errors.position) setErrors((prev) => ({ ...prev, position: '' }));
              }}
              disabled={saving}
              error={errors.position}
            />

            {isEdit && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-lead-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-lead-300 text-brand-600 focus:ring-brand-500"
                    disabled={saving}
                  />
                  Negocio activo
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-lead-700">Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-lead-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                disabled={saving}
              />
              {business?.pathImage && !imageFile && (
                <p className="mt-1 text-xs text-lead-500">Imagen actual guardada. Suba una nueva para reemplazarla.</p>
              )}
            </div>

          </div>

          <div className="flex flex-col-reverse gap-2 pt-4 border-t border-lead-100 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-lg border border-lead-300 px-4 py-2 text-sm font-medium text-lead-700 hover:bg-lead-100 transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-accent-600 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Guardando...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessFormModal;