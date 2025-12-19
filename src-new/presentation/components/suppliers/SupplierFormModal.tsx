import React, { useEffect, useState } from 'react';
import { Supplier } from '../../../domain/entities/Supplier';

type SupplierFormModalProps = {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (data: Partial<Supplier>) => void;
  saving: boolean;
};

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ supplier, onClose, onSave, saving }) => {
  const isEdit = !!supplier?.id;
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (supplier) {
      setName(supplier.name ?? '');
      setContactName(supplier.contactName ?? '');
      setPhone(supplier.phone ?? '');
      setAddress(supplier.address ?? '');
    } else {
      setName('');
      setContactName('');
      setPhone('');
      setAddress('');
    }
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...(isEdit ? { id: supplier!.id } : {}),
      name: name.trim(),
      contactName: contactName.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      state: supplier?.state ?? true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-xl font-bold text-brand-800">{isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-lead-700">Nombre *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                placeholder="Ej: Distribuidora XYZ"
                required
              />
            </div>
            <div>
              <label htmlFor="contactName" className="mb-1 block text-sm font-medium text-lead-700">Contacto</label>
              <input
                type="text"
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="input w-full"
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-lead-700">Teléfono</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input w-full"
                placeholder="Ej: +591 70000000"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="mb-1 block text-sm font-medium text-lead-700">Dirección</label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input w-full resize-none"
                rows={2}
                placeholder="Dirección del proveedor"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline" disabled={saving}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving || !name.trim()}>
              {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierFormModal;
