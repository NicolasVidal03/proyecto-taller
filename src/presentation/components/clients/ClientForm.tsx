import React, { useState, useEffect } from 'react';
import { CreateClientDTO, UpdateClientDTO } from '../../../domain/ports/IClientRepository';
import { Client } from '../../../domain/entities/Client';
import { Area } from '../../../domain/entities/Area';
import { CLIENT_TYPES, BUSINESS_TYPES } from '../../utils/clientHelpers';

interface ClientFormProps {
  areas: Area[];
  onSubmit: (data: CreateClientDTO | UpdateClientDTO) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Client;
}

const ClientForm: React.FC<ClientFormProps> = ({ 
  areas, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  initialData
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    nitCi: '',
    businessName: '',
    phone: '',
    businessType: 'Ferreteria' as string,
    clientType: 'Regular' as string,
    lat: '',
    lng: '',
    areaId: null as number | null,
    address: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName,
        nitCi: initialData.nitCi,
        businessName: initialData.businessName,
        phone: initialData.phone,
        businessType: initialData.businessType,
        clientType: initialData.clientType,
        lat: initialData.position?.lat.toString() || '',
        lng: initialData.position?.lng.toString() || '',
        areaId: initialData.areaId,
        address: initialData.address || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'El nombre completo es obligatorio';
    if (!formData.nitCi.trim()) newErrors.nitCi = 'El NIT/CI es obligatorio';
    if (!formData.businessName.trim()) newErrors.businessName = 'La razón social es obligatoria';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!formData.businessType) newErrors.businessType = 'Seleccione un tipo de negocio';
    if (!formData.clientType) newErrors.clientType = 'Seleccione un tipo de cliente';
    
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    
    if (!formData.lat.trim() || isNaN(lat)) {
      newErrors.lat = 'La latitud es obligatoria y debe ser numérica';
    }
    if (!formData.lng.trim() || isNaN(lng)) {
      newErrors.lng = 'La longitud es obligatoria y debe ser numérica';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const baseData = {
      fullName: formData.fullName.trim(),
      nitCi: formData.nitCi.trim(),
      businessName: formData.businessName.trim(),
      phone: formData.phone.trim(),
      businessType: formData.businessType,
      clientType: formData.clientType,
      position: {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      },
      areaId: formData.areaId,
      address: formData.address.trim() || undefined,
      imageFile: imageFile || undefined,
    };

    if (initialData) {
      const updateDto: UpdateClientDTO = {
        ...baseData,
        id: initialData.id,
      };
      await onSubmit(updateDto);
    } else {
      await onSubmit(baseData as CreateClientDTO);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Nombre completo */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-lead-700">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              errors.fullName ? 'border-red-500' : 'border-lead-300 bg-white'
            }`}
            disabled={isSubmitting}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>

        {/* NIT/CI */}
        <div>
          <label htmlFor="nitCi" className="block text-sm font-medium text-lead-700">
            NIT/CI <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nitCi"
            name="nitCi"
            value={formData.nitCi}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              errors.nitCi ? 'border-red-500' : 'border-lead-300 bg-white'
            }`}
            disabled={isSubmitting}
          />
          {errors.nitCi && <p className="mt-1 text-xs text-red-600">{errors.nitCi}</p>}
        </div>

        {/* Razón social */}
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-lead-700">
            Razón social <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              errors.businessName ? 'border-red-500' : 'border-lead-300 bg-white'
            }`}
            disabled={isSubmitting}
          />
          {errors.businessName && <p className="mt-1 text-xs text-red-600">{errors.businessName}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-lead-700">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              errors.phone ? 'border-red-500' : 'border-lead-300 bg-white'
            }`}
            disabled={isSubmitting}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        {/* Tipo de negocio */}
        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-lead-700">
            Tipo de negocio <span className="text-red-500">*</span>
          </label>
          <select
            id="businessType"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              errors.businessType ? 'border-red-500' : 'border-lead-300 bg-white'
            }`}
            disabled={isSubmitting}
          >
            {BUSINESS_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {errors.businessType && <p className="mt-1 text-xs text-red-600">{errors.businessType}</p>}
        </div>

        {/* Tipo de cliente */}
        <div>
          <label htmlFor="clientType" className="block text-sm font-medium text-lead-700">
            Tipo de cliente <span className="text-red-500">*</span>
          </label>
          <select
            id="clientType"
            name="clientType"
            value={formData.clientType}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              errors.clientType ? 'border-red-500' : 'border-lead-300 bg-white'
            }`}
            disabled={isSubmitting}
          >
            {CLIENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {errors.clientType && <p className="mt-1 text-xs text-red-600">{errors.clientType}</p>}
        </div>

        {/* Latitud */}
        <div>
          <label htmlFor="lat" className="block text-sm font-medium text-lead-700">
            Latitud <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            id="lat"
            name="lat"
            value={formData.lat}
            onChange={handleChange}
            placeholder="-17.393"
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              errors.lat ? 'border-red-500' : 'border-lead-300 bg-white'
            }`}
            disabled={isSubmitting}
          />
          {errors.lat && <p className="mt-1 text-xs text-red-600">{errors.lat}</p>}
        </div>

        {/* Longitud */}
        <div>
          <label htmlFor="lng" className="block text-sm font-medium text-lead-700">
            Longitud <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            id="lng"
            name="lng"
            value={formData.lng}
            onChange={handleChange}
            placeholder="-66.157"
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              errors.lng ? 'border-red-500' : 'border-lead-300 bg-white'
            }`}
            disabled={isSubmitting}
          />
          {errors.lng && <p className="mt-1 text-xs text-red-600">{errors.lng}</p>}
        </div>

        {/* Área (opcional) */}
        <div>
          <label htmlFor="areaId" className="block text-sm font-medium text-lead-700">
            Área (opcional)
          </label>
          <select
            id="areaId"
            name="areaId"
            value={formData.areaId || ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ ...prev, areaId: val ? Number(val) : null }));
            }}
            className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
            disabled={isSubmitting}
          >
            <option value="">Sin asignar</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dirección (opcional) */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-lead-700">
            Dirección (opcional)
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Imagen (opcional) */}
        <div className="md:col-span-2">
          <label htmlFor="image" className="block text-sm font-medium text-lead-700">
            Imagen (opcional)
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-lead-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-brand-50 file:text-brand-700
              hover:file:bg-brand-100"
            disabled={isSubmitting}
          />
          {imageFile && (
            <p className="mt-1 text-xs text-lead-600">
              Archivo seleccionado: {imageFile.name}
            </p>
          )}
          {initialData?.pathImage && !imageFile && (
            <p className="mt-1 text-xs text-lead-500">
              Imagen actual guardada. Suba una nueva para reemplazarla.
            </p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 border-t border-lead-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-lead-300 px-4 py-2 text-sm font-medium text-lead-700 hover:bg-lead-100 transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-60 transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar cliente' : 'Crear cliente')}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
