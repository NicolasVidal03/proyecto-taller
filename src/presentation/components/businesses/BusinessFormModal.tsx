import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Business } from '../../../domain/entities/Business';
import { Client } from '../../../domain/entities/Client';
import { BusinessType } from '../../../domain/entities/BusinessType';
import { PriceType } from '../../../domain/entities/PriceType';
import { Area } from '../../../domain/entities/Area';
import { CreateBusinessDTO, UpdateBusinessDTO } from '../../../domain/ports/IBusinessRepository';
import { container } from '../../../infrastructure/config/container';

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

  // Client search state
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [clientSearching, setClientSearching] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const clientSearchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search clients dynamically
  const searchClients = useCallback(async (term: string) => {
    if (!term.trim()) {
      setClientResults([]);
      return;
    }

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

  // Debounced search
  const handleClientSearchChange = (value: string) => {
    setClientSearch(value);
    setShowClientDropdown(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchClients(value);
    }, 300);
  };

  // Select client from dropdown
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setClientId(client.id);
    setClientSearch(getClientFullName(client));
    setShowClientDropdown(false);
    setClientResults([]);
    if (errors.clientId) setErrors((prev) => ({ ...prev, clientId: '' }));
  };

  // Close dropdown when clicking outside
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
      
      // Set selected client from clients list if editing
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
      name: name.trim(),
      nit: nit.trim() || null,
      address: address.trim() || null,
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

  // Helper to get full client name
  const getClientFullName = (client: Client): string => {
    return `${client.lastName} ${client.secondLastName} ${client.name}`.trim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="mx-4 my-10 w-full max-w-lg overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-100 hover:text-white transition-colors"
            disabled={saving}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-lead-700">Nombre *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm ${
                  errors.name ? 'border-red-500' : 'border-lead-300 bg-white'
                }`}
                disabled={saving}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* NIT */}
            <div>
              <label className="block text-sm font-medium text-lead-700">NIT</label>
              <input
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                className="mt-1 block w-full rounded-lg border-lead-300 bg-white px-3 py-2 text-sm"
                disabled={saving}
              />
            </div>

            {/* Cliente (dueño) - Buscador dinámico */}
            <div ref={clientSearchRef} className="relative">
              <label className="block text-sm font-medium text-lead-700">Dueño (Cliente) *</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => handleClientSearchChange(e.target.value)}
                  onFocus={() => clientSearch && setShowClientDropdown(true)}
                  placeholder="Buscar cliente por apellidos y nombres..."
                  className={`block w-full rounded-lg border px-3 py-2 text-sm pr-10 ${
                    errors.clientId ? 'border-red-500' : 'border-lead-300 bg-white'
                  }`}
                  disabled={saving}
                />
                {clientSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
              
              {/* Dropdown de resultados */}
              {showClientDropdown && clientResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-lead-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
              
              {/* Mensaje cuando no hay resultados */}
              {showClientDropdown && clientSearch.trim() && !clientSearching && clientResults.length === 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-lead-200 rounded-lg shadow-lg p-4 text-sm text-lead-500 text-center">
                  No se encontraron clientes con "{clientSearch}"
                </div>
              )}
              
              {errors.clientId && <p className="mt-1 text-xs text-red-600">{errors.clientId}</p>}
            </div>

            {/* Tipo de negocio */}
            <div>
              <label className="block text-sm font-medium text-lead-700">Tipo de negocio *</label>
              <select
                value={businessTypeId}
                onChange={(e) => {
                  setBusinessTypeId(e.target.value ? Number(e.target.value) : '');
                  if (errors.businessTypeId) setErrors((prev) => ({ ...prev, businessTypeId: '' }));
                }}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm ${
                  errors.businessTypeId ? 'border-red-500' : 'border-lead-300 bg-white'
                }`}
                disabled={saving}
              >
                <option value="">Seleccione...</option>
                {businessTypes.map((bt) => (
                  <option key={bt.id} value={bt.id}>
                    {bt.name}
                  </option>
                ))}
              </select>
              {errors.businessTypeId && <p className="mt-1 text-xs text-red-600">{errors.businessTypeId}</p>}
            </div>

            {/* Tipo de precio */}
            <div>
              <label className="block text-sm font-medium text-lead-700">Tipo de precio</label>
              <select
                value={priceTypeId}
                onChange={(e) => setPriceTypeId(e.target.value ? Number(e.target.value) : '')}
                className="mt-1 block w-full rounded-lg border-lead-300 bg-white px-3 py-2 text-sm"
                disabled={saving}
              >
                <option value="">Sin asignar</option>
                {priceTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Área (opcional) */}
            <div>
              <label className="block text-sm font-medium text-lead-700">Área</label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value ? Number(e.target.value) : '')}
                className="mt-1 block w-full rounded-lg border-lead-300 bg-white px-3 py-2 text-sm"
                disabled={saving}
              >
                <option value="">Sin asignar</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-lead-700">Dirección</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-lg border-lead-300 bg-white px-3 py-2 text-sm"
                disabled={saving}
              />
            </div>

            {/* Coordenadas */}
            <div>
              <label className="block text-sm font-medium text-lead-700">Latitud</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="-17.393"
                className="mt-1 block w-full rounded-lg border-lead-300 bg-white px-3 py-2 text-sm"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-lead-700">Longitud</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="-66.157"
                className="mt-1 block w-full rounded-lg border-lead-300 bg-white px-3 py-2 text-sm"
                disabled={saving}
              />
            </div>

            {/* Estado activo (solo en edición) */}
            {isEdit && (
              <div className="md:col-span-2">
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

            {/* Imagen */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-lead-700">Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-lead-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-brand-50 file:text-brand-700
                  hover:file:bg-brand-100"
                disabled={saving}
              />
              {business?.pathImage && !imageFile && (
                <p className="mt-1 text-xs text-lead-500">Imagen actual guardada. Suba una nueva para reemplazarla.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-lead-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-lead-300 px-4 py-2 text-sm font-medium text-lead-700 hover:bg-lead-100 transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-accent-600 disabled:opacity-60"
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
