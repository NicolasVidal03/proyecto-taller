import React, { useEffect, useState } from 'react';
import { Supplier } from '../../../domain/entities/Supplier';
import { Country } from '../../../domain/entities/Country';

type SupplierFormModalProps = {
  supplier: Supplier | null;
  countries: Country[];
  onClose: () => void;
  onSave: (data: Partial<Supplier>) => void;
  saving: boolean;
};

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ supplier, countries, onClose, onSave, saving }) => {
  const isEdit = !!supplier?.id;
  const [nit, setNit] = useState('');
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [countryId, setCountryId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (supplier) {
      setNit(supplier.nit ?? '');
      setName(supplier.name ?? '');
      setContactName(supplier.contactName ?? '');
      setPhone(supplier.phone ?? '');
      setAddress(supplier.address ?? '');
      setCountryId(supplier.countryId ? String(supplier.countryId) : '');
    } else {
      setNit('');
      setName('');
      setContactName('');
      setPhone('');
      setAddress('');
      setCountryId('');
    }
    setErrors({});
  }, [supplier]);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!nit.trim()) nextErrors.nit = 'El NIT es obligatorio';
    if (!name.trim()) nextErrors.name = 'El nombre es obligatorio';
    if (!countryId) nextErrors.countryId = 'El país es obligatorio';
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...(isEdit ? { id: supplier!.id } : {}),
      nit: nit.trim(),
      name: name.trim(),
      contactName: contactName.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      countryId: Number(countryId),
      state: supplier?.state ?? true,
    });
  };

  const title = isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor';
  const submitLabel = isEdit ? 'Guardar cambios' : 'Crear';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="mx-4 my-10 w-full max-w-lg overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
          <button type="button" onClick={onClose} className="text-brand-100 hover:text-white transition-colors" disabled={saving}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="nit" className="block text-sm font-medium text-lead-700">NIT *</label>
              <input
                type="text"
                id="nit"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.nit ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                disabled={saving}
              />
              {errors.nit ? <p className="mt-1 text-xs text-red-600">{errors.nit}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-lead-700">Nombre *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.name ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                disabled={saving}
              />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
            </div>

            <div>
              <label htmlFor="countryId" className="block text-sm font-medium text-lead-700">País *</label>
              <select
                id="countryId"
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${errors.countryId ? 'border-red-500' : 'border-lead-300 bg-white'}`}
                disabled={saving}
              >
                <option value="">—</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.countryId ? <p className="mt-1 text-xs text-red-600">{errors.countryId}</p> : null}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-lead-700">Teléfono</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-lg border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                disabled={saving}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="contactName" className="block text-sm font-medium text-lead-700">Contacto</label>
              <input
                type="text"
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1 block w-full rounded-lg border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                disabled={saving}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-lead-700">Dirección</label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full resize-none rounded-lg border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                rows={2}
                disabled={saving}
              />
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
              className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-60 transition-all"
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

export default SupplierFormModal;
