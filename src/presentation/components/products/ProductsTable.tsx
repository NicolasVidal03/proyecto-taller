import React from 'react';
import { Product } from '../../../domain/entities/Product';

type ProductsTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  busyId?: number | null;
};

const ProductsTable: React.FC<ProductsTableProps> = ({ products, onEdit, onDeactivate, busyId }) => {
  if (!products.length) {
    return (
      <div className="rounded-md border bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
        No hay productos cargados todavía.
      </div>
    );
  }

  const isBusy = (id: number) => busyId != null && busyId === id;

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '—';
    return `Bs. ${price.toFixed(2)}`;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-4 py-4 text-left font-semibold">ID</th>
            <th className="px-4 py-4 text-left font-semibold">Nombre</th>
            <th className="px-4 py-4 text-left font-semibold">Descripción</th>
            <th className="px-4 py-4 text-left font-semibold">Categoría</th>
            <th className="px-4 py-4 text-left font-semibold">Precio</th>
            <th className="px-4 py-4 text-left font-semibold">Stock</th>
            <th className="px-4 py-4 text-left font-semibold">Estado</th>
            <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {products.map(prod => (
            <tr key={prod.id} className="transition-colors hover:bg-white">
              <td className="px-4 py-3 font-medium text-brand-900">{prod.id}</td>
              <td className="px-4 py-3 text-lead-600">{prod.name}</td>
              <td className="px-4 py-3 text-lead-600 max-w-xs truncate">{prod.description ?? '—'}</td>
              <td className="px-4 py-3 text-lead-600">{prod.categoryId ?? '—'}</td>
              <td className="px-4 py-3 text-lead-600">{formatPrice(prod.price)}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  (prod.stock ?? 0) <= 5 ? 'bg-red-100 text-red-700' :
                  (prod.stock ?? 0) <= 20 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {prod.stock ?? 0}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${prod.state ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {prod.state ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3 text-center align-middle">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(prod)}
                    className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                    disabled={isBusy(prod.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeactivate(prod)}
                    className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                    disabled={isBusy(prod.id) || !prod.state}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
