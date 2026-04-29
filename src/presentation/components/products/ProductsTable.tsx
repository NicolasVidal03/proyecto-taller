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

  const getPrice = (product: Product, typeId: number) => {
    const p = product.prices?.find(p => p.priceTypeId === typeId)?.price;
    return p ? `Bs. ${Number(p).toFixed(2)}` : '—';
  };

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {isEmpty ? (
          <p className="py-8 text-center text-sm text-lead-500">No hay productos para mostrar.</p>
        ) : products.map(product => (
          <div key={product.id} className="rounded-xl border border-lead-200 bg-lead-50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 max-w-[60%]">
                <p className="font-semibold text-brand-900 whitespace-normal break-words">{product.name}</p>
                {(product.presentationName || (product.presentationId && presentationMap.get(product.presentationId))) && (
                  <p className="text-xs text-lead-500 mt-0.5">
                    {product.presentationName || (product.presentationId ? presentationMap.get(product.presentationId) : '')}
                  </p>
                )}
                <p className="text-xs text-lead-500 mt-0.5">
                  {product.categoryName || categoryMap.get(product.categoryId) || '—'} · {product.brandName || brandMap.get(product.brandId) || '—'}
                </p>
              </div>
              <div className="shrink-0 text-right space-y-0.5">
                <p className="text-xs text-lead-400 uppercase tracking-wide">Regular</p>
                <p className="text-sm font-semibold text-lead-800">{getPrice(product, 1)}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-lead-600 border-t border-lead-100 pt-3">
              <div>
                <p className="text-lead-400 uppercase tracking-wide">Minorista</p>
                <p className="font-semibold">{getPrice(product, 2)}</p>
              </div>
              <div>
                <p className="text-lead-400 uppercase tracking-wide">Mayorista</p>
                <p className="font-semibold">{getPrice(product, 3)}</p>
              </div>
              <div>
                <p className="text-lead-400 uppercase tracking-wide">Institucional</p>
                <p className="font-semibold">{getPrice(product, 4)}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onView && onView(product)}
                className="rounded-lg bg-lead-200 px-3 py-1.5 text-xs font-semibold text-lead-800 transition hover:bg-lead-300"
              >
                Ver
              </button>
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                disabled={isBusy(product.id)}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDeactivate(product)}
                className="rounded-lg bg-accent-100 px-3 py-1.5 text-xs font-semibold text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                disabled={isBusy(product.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
            <tr>
              <th className="px-4 py-4 text-left font-semibold">Nombre</th>
              <th className="px-4 py-4 text-left font-semibold">Categoría</th>
              <th className="px-4 py-4 text-left font-semibold">Marca</th>
              <th className="px-4 py-4 text-left font-semibold">Regular</th>
              <th className="px-4 py-4 text-left font-semibold">Minorista</th>
              <th className="px-4 py-4 text-left font-semibold">Mayorista</th>
              <th className="px-4 py-4 text-left font-semibold">Institucional</th>
              <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lead-200">
            {isEmpty ? (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-lead-600" colSpan={8}>
                  No hay productos para mostrar.
                </td>
              </tr>
            ) : products.map(product => (
              <tr key={product.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 max-w-[200px]">
                  <span className="block truncate font-medium text-lead-800" title={product.name}>{product.name}</span>
                  {(product.presentationName || (product.presentationId && presentationMap.get(product.presentationId))) && (
                    <p className="text-xs text-lead-500">
                      {product.presentationName || (product.presentationId ? presentationMap.get(product.presentationId) : '')}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-lead-600">
                  {product.categoryName || categoryMap.get(product.categoryId) || '—'}
                </td>
                <td className="px-4 py-3 text-lead-600">
                  {product.brandName || brandMap.get(product.brandId) || '—'}
                </td>
                <td className="px-4 py-3 text-lead-600 text-xs">{getPrice(product, 1)}</td>
                <td className="px-4 py-3 text-lead-600 text-xs">{getPrice(product, 2)}</td>
                <td className="px-4 py-3 text-lead-600 text-xs">{getPrice(product, 3)}</td>
                <td className="px-4 py-3 text-lead-600 text-xs">{getPrice(product, 4)}</td>
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
                      className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
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
    </>
  );
};

export default ProductsTable;