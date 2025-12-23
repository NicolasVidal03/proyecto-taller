import React, { useEffect, useState } from 'react';
import { Category } from '../../../domain/entities/Category';

type CategoryFormModalProps = {
  category: Category | null;
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
  saving: boolean;
};

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ category, onClose, onSave, saving }) => {
  const isEdit = !!category?.id;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name ?? '');
      setDescription(category.description ?? '');
    } else {
      setName('');
      setDescription('');
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...(isEdit ? { id: category!.id } : {}),
      name: name.trim(),
      description: description.trim() || undefined,
      state: category?.state ?? true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-xl font-bold text-brand-800">{isEdit ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-lead-700">Nombre *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="Ej: Electrónica"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-lead-700">Descripción</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full resize-none"
              rows={3}
              placeholder="Descripción de la categoría"
            />
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

export default CategoryFormModal;
