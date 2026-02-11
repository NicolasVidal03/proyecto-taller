import React, { useState, useEffect } from 'react';
import { CreateClientDTO, UpdateClientDTO } from '../../../domain/ports/IClientRepository';
import { Client } from '../../../domain/entities/Client';

interface ClientFormProps {
  onSubmit: (data: CreateClientDTO | UpdateClientDTO) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Client;
}

/**
 * Simplified ClientForm - matches backend contract
 * Fields: name, lastName, secondLastName, phone, ci (optional)
 */
const ClientForm: React.FC<ClientFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    secondLastName: '',
    phone: '',
    ci: '',
    ciExt: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        lastName: initialData.lastName || '',
        secondLastName: initialData.secondLastName || '',
        phone: initialData.phone || '',
        ci: initialData.ci || '',
        ciExt: initialData.ciExt || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // For name fields, store uppercase
    const upperFields = ['name', 'lastName', 'secondLastName'];
    const nextValue = upperFields.includes(name) ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido paterno es obligatorio';
    if (!formData.secondLastName.trim()) newErrors.secondLastName = 'El apellido materno es obligatorio';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const baseData = {
      name: formData.name.trim(),
      lastName: formData.lastName.trim(),
      secondLastName: formData.secondLastName.trim(),
      phone: formData.phone.trim(),
      ci: formData.ci.trim() || null,
      ciExt: formData.ciExt.trim() || null,
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
        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-lead-700">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              errors.name ? 'border-red-500' : 'border-lead-300 bg-white'
            }`}
            disabled={isSubmitting}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        {/* Apellido Paterno */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-lead-700">
            Apellido paterno <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              errors.lastName ? 'border-red-500' : 'border-lead-300 bg-white'
            }`}
            disabled={isSubmitting}
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
        </div>

        {/* Apellido Materno */}
        <div>
          <label htmlFor="secondLastName" className="block text-sm font-medium text-lead-700">
            Apellido materno <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="secondLastName"
            name="secondLastName"
            value={formData.secondLastName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
              errors.secondLastName ? 'border-red-500' : 'border-lead-300 bg-white'
            }`}
            disabled={isSubmitting}
          />
          {errors.secondLastName && <p className="mt-1 text-xs text-red-600">{errors.secondLastName}</p>}
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

        {/* CI (opcional) */}
        <div>
          <label htmlFor="ci" className="block text-sm font-medium text-lead-700">
            CI (opcional)
          </label>
          <input
            type="text"
            id="ci"
            name="ci"
            value={formData.ci}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Extensión CI (opcional) */}
        <div>
          <label htmlFor="ciExt" className="block text-sm font-medium text-lead-700">
            Extensión CI (opcional)
          </label>
          <input
            type="text"
            id="ciExt"
            name="ciExt"
            value={formData.ciExt}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Tipo de cliente eliminado: ahora pertenece al negocio */}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-lead-300 bg-white px-4 py-2 text-sm text-lead-700 hover:bg-lead-100"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
