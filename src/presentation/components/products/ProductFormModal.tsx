import React, { useEffect, useState } from 'react';
import { Product } from '../../../domain/entities/Product';
import { Category } from '../../../domain/entities/Category';

type ProductFormModalProps = {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
  saving: boolean;
};

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, categories, onClose, onSave, saving }) => {
  const isEdit = !!product?.id;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name ?? '');
      setDescription(product.description ?? '');
      setCategoryId(product.categoryId ?? '');
      setPrice(product.price?.toString() ?? '');
      setStock(product.stock?.toString() ?? '');
    } else {
      setName('');
      setDescription('');
      setCategoryId('');
      setPrice('');
      setStock('');
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...(isEdit ? { id: product!.id } : {}),
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId !== '' ? Number(categoryId) : undefined,
      price: price ? parseFloat(price) : undefined,
      stock: stock ? parseInt(stock, 10) : undefined,
      state: product?.state ?? true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-xl font-bold text-brand-800">{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
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
                placeholder="Ej: Cable HDMI 2m"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-lead-700">Descripción</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full resize-none"
                rows={2}
                placeholder="Descripción del producto"
              />
            </div>
            <div>
              <label htmlFor="categoryId" className="mb-1 block text-sm font-medium text-lead-700">Categoría</label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                className="input w-full"
              >
                <option value="">Sin categoría</option>
                {categories.filter(c => c.state).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="price" className="mb-1 block text-sm font-medium text-lead-700">Precio (Bs.)</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input w-full"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="stock" className="mb-1 block text-sm font-medium text-lead-700">Stock</label>
              <input
                type="number"
                id="stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input w-full"
                placeholder="0"
                min="0"
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

export default ProductFormModal;
