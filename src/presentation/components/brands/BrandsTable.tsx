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
  const isBusy = (id: number) => busyBrandId != null && busyBrandId === id;

  return (
    <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-4 py-4 text-left font-semibold">ID</th>
            <th className="px-4 py-4 text-left font-semibold">Nombre</th>
            <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {isEmpty ? (
            <tr>
              <td className="px-4 py-6 text-center text-sm text-lead-600" colSpan={3}>
                No hay marcas para mostrar.
              </td>
            </tr>
          ) : brands.map(brand => (
            <tr key={brand.id} className="transition-colors hover:bg-white">
              <td className="px-4 py-3 font-medium text-brand-900">#{brand.id}</td>
              <td className="px-4 py-3 text-lead-600">{brand.name}</td>
              {/* Estado removed */}
              <td className="px-4 py-3 text-center align-middle">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(brand)}
                    className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                    disabled={isBusy(brand.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(brand)}
                    className={`rounded px-3 py-1.5 font-medium transition disabled:opacity-50 ${
                      brand.state 
                        ? 'bg-accent-100 text-accent-700 hover:bg-accent-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    disabled={isBusy(brand.id)}
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
  );
};

export default BrandsTable;
