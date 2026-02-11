import React from 'react';
import { Product } from '../../../domain/entities/Product';

type ProductsTableProps = {
  products: Product[];
  categoryMap: Map<number, string>;
  brandMap: Map<number, string>;
  presentationMap: Map<number, string>;
  colorMap: Map<number, string>;
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  onView?: (product: Product) => void;
  busyId?: number | null;
};

const ProductsTable: React.FC<ProductsTableProps> = ({ 
  products, 
  categoryMap, 
  brandMap,
  presentationMap,
  colorMap,
  onEdit, 
  onDeactivate, 
  onView,
  busyId 
}) => {
  const isEmpty = products.length === 0;
  const isBusy = (id: number) => busyId != null && busyId === id;

  return (
    <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-4 py-4 text-left font-semibold">Nombre</th>
            <th className="px-4 py-4 text-left font-semibold">Categoría</th>
            <th className="px-4 py-4 text-left font-semibold">Marca</th>
            <th className="px-4 py-4 text-left font-semibold">Mayorista</th>
            <th className="px-4 py-4 text-left font-semibold">Minorista</th>
            <th className="px-4 py-4 text-left font-semibold">Regular</th>
            <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {isEmpty ? (
            <tr>
              <td className="px-4 py-6 text-center text-sm text-lead-600" colSpan={7}>
                No hay productos para mostrar.
              </td>
            </tr>
          ) : products.map(product => (
            <tr key={product.id} className="transition-colors hover:bg-white">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-lead-800">{product.name}</p>
                    {(product.presentationName || (product.presentationId && presentationMap.get(product.presentationId))) && (
                      <p className="text-xs text-lead-500">
                        {product.presentationName || (product.presentationId ? presentationMap.get(product.presentationId) : '')}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-lead-600">
                {product.categoryName || categoryMap.get(product.categoryId) || '—'}
              </td>
              <td className="px-4 py-3 text-lead-600">
                {product.brandName || brandMap.get(product.brandId) || '—'}
              </td>
              <td className="px-4 py-3 text-lead-600 text-xs">
                {product.prices?.find(p => p.priceTypeId === 3)?.price ? Number(product.prices.find(p => p.priceTypeId === 3)?.price).toFixed(2) : '—'}
              </td>
              <td className="px-4 py-3 text-lead-600 text-xs">
                {product.prices?.find(p => p.priceTypeId === 2)?.price ? Number(product.prices.find(p => p.priceTypeId === 2)?.price).toFixed(2) : '—'}
              </td>
              <td className="px-4 py-3 text-lead-600 text-xs">
                {product.prices?.find(p => p.priceTypeId === 1)?.price ? Number(product.prices.find(p => p.priceTypeId === 1)?.price).toFixed(2) : '—'}
              </td>
              {/* Estado removed: do not display product.state column */}
              <td className="px-4 py-3 text-center align-middle">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onView && onView(product)}
                    className="rounded bg-lead-200 px-3 py-1.5 font-medium text-lead-800 transition hover:bg-lead-300 disabled:opacity-50"
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                    disabled={isBusy(product.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeactivate(product)}
                    className={`rounded px-3 py-1.5 font-medium transition disabled:opacity-50 bg-accent-100 text-accent-700 hover:bg-accent-200`}
                    disabled={isBusy(product.id)}
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
