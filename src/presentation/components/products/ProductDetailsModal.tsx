import React from 'react';
import { Product } from '../../../domain/entities/Product';

interface ProductDetailsModalProps {
  product: Product | null;
  presentationMap: Map<number, string>;
  colorMap: Map<number, string>;
  onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, presentationMap, colorMap, onClose }) => {
  if (!product) return null;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm p-4 md:p-0">
      <div className="relative w-full max-w-3xl transform rounded-3xl bg-white shadow-2xl transition-all">
        <div className="relative h-56 w-full overflow-hidden rounded-t-3xl bg-gray-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-white hover:bg-black/40 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {product.pathImage ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <img
                src={`${apiUrl}${product.pathImage}`}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
                }}
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-100">
              <div className="mx-auto w-full max-w-2xl rounded-lg bg-white/80 p-6 text-center">
                <div className="text-5xl font-bold text-brand-600">{product.name.charAt(0)}</div>
              </div>
            </div>
          )}
        </div>
        <div className="px-8 pb-8 pt-8">
          <div className="mb-2 text-center">
            <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-lg text-brand-600 font-medium">{product.brandName || product.categoryName || ''}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {product.presentationName || (product.presentationId ? presentationMap.get(product.presentationId) : null) || 'Sin presentación'}
              </span>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                {product.colorName || (product.colorId ? colorMap.get(product.colorId) : null) || 'Sin color'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl bg-gray-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Información</h3>
              <div className="space-y-3 text-sm text-gray-800">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-white p-2 text-brand-500 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 15h4.01M12 21h4.01M12 18h4.01M12 9h4.01M12 6h4.01M12 3h4.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Código de Barras</p>
                    <p className="font-medium text-gray-900">{product.barcode || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-white p-2 text-brand-500 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Código Interno</p>
                    <p className="font-medium text-gray-900">{product.internalCode || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl bg-gray-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Precios</h3>
              <div className="space-y-3 text-sm text-gray-800">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <p className="text-xs text-gray-500">Mayorista</p>
                    <p className="font-bold text-brand-600">{product.salePrice?.mayorista ? Number(product.salePrice.mayorista).toFixed(2) : '—'}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <p className="text-xs text-gray-500">Minorista</p>
                    <p className="font-bold text-brand-600">{product.salePrice?.minorista ? Number(product.salePrice.minorista).toFixed(2) : '—'}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <p className="text-xs text-gray-500">Regular</p>
                    <p className="font-bold text-brand-600">{product.salePrice?.regular ? Number(product.salePrice.regular).toFixed(2) : '—'}</p>
                  </div>
                </div>
                <div className="pt-2">
                  {product.createdAt && <p className="text-xs text-gray-500 mt-1">Creado: {new Date(product.createdAt).toLocaleString()}</p>}
                  {product.updatedAt && <p className="text-xs text-gray-500">Última actualización: {new Date(product.updatedAt).toLocaleString()}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
