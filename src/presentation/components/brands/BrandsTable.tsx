import React from 'react';
import { Brand } from '../../../domain/entities/Brand';

type BrandsTableProps = {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  busyBrandId?: number | null;
};

const BrandsTable: React.FC<BrandsTableProps> = ({ brands, onEdit, onDelete, busyBrandId = null }) => {
  const isEmpty = brands.length === 0;
  const isBusy  = (id: number) => busyBrandId != null && busyBrandId === id;

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-lead-200 bg-lead-50 px-4 py-8 text-center text-sm text-lead-500 shadow-lg">
        No hay marcas para mostrar.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {brands.map(brand => (
          <div
            key={brand.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-lead-200 bg-lead-50 px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`h-2 w-2 shrink-0 rounded-full ${brand.state ? 'bg-green-400' : 'bg-lead-300'}`} />
              <span className="truncate font-medium text-lead-800">{brand.name}</span>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onEdit(brand)}
                disabled={isBusy(brand.id)}
                className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(brand)}
                disabled={isBusy(brand.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                  brand.state
                    ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {brand.state ? 'Desactivar' : 'Activar'}
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
              <th className="w-40 px-4 py-4 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lead-200">
            {brands.map(brand => (
              <tr key={brand.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 text-lead-600">{brand.name}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(brand)}
                      disabled={isBusy(brand.id)}
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(brand)}
                      disabled={isBusy(brand.id)}
                      className={`rounded px-3 py-1.5 font-medium transition disabled:opacity-50 ${
                        brand.state
                          ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {brand.state ? 'Desactivar' : 'Activar'}
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

export default BrandsTable;