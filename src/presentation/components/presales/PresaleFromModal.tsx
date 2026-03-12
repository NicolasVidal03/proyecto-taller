import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Product } from '../../../domain/entities/Product';
import { Presale } from '@domain/entities';
import { useAuth } from '@presentation/providers';
import useBusinesses from '@presentation/hooks/useBusinesses';
import { useInventory } from '@presentation/hooks';
import { Business } from '@domain/entities/Business';
import { ProductWithBranchInfo } from '@domain/entities/ProductBranch';

export interface PresaleDetailsFormValues {
    productId: number,
    quantityRequested: number,
    priceTypeId: number,
    unitPrice: number
}

export interface PresaleFormValues {
    clientId: number,
    businessId: number,
    branchId: number,
    deliveryDate: string,
    notes?: string | null,
    details: PresaleDetailsFormValues[],
}

interface PresaleFormModalProps {
    open: boolean;
    mode: 'create' | 'edit';
    initialData: Presale | null;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (values: PresaleFormValues) => void;
}

interface ProductDetail {
    product: ProductWithBranchInfo;
    selectedPriceTypeId: number | null;
    selectedPrice: number | null;
    productQuantity: number | null;
}

const PresaleFormModal: React.FC<PresaleFormModalProps> = ({
    open,
    mode,
    initialData,
    submitting,
    onClose,
    //   onSubmit,
}) => {
    const { businesses, fetchBusinesses } = useBusinesses();
    const { inventory, applyFilters } = useInventory();

    const [businessId, setBusiness] = useState('');
    const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [note, setNote] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [searchBusiness, setSearchBusiness] = useState('');
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);

    const [searchProduct, setSearchProduct] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    const filteredBusiness = useMemo(() => {
        const term = searchBusiness.trim().toLowerCase();
        if (!term) return businesses;
        return businesses.filter(b => {
            const fullName = `${b.name} ${b.clientName}`.toLowerCase();
            return fullName.includes(term);
        });
    }, [businesses, searchBusiness]);

    const filteredProduct = useMemo(() => {
        const addedIds = new Set(productDetails.map(d => d.product.id));
        const term = searchProduct.trim().toLowerCase();
        return inventory
            .filter(p => !addedIds.has(p.id))
            .filter(p => (p.branch?.stockQty ?? 0) > 0)
            .filter(p => {
                if (!term) return true;
                return `${p.name} ${p.category}`.toLowerCase().includes(term);
            });
    }, [inventory, searchProduct, productDetails]);

    const auth = useAuth();

    useEffect(() => {
        Promise.all([fetchBusinesses()])
    }, [fetchBusinesses]);

    useEffect(() => {
        if (auth.user?.branchId) {
            applyFilters(auth.user.branchId)
        }
    }, [applyFilters]);


    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                setBusiness(initialData.businessName || '');
                // setProducts(initialData.products || '');
                // setDeliveryDate(initialData.internalCode || '');
                // setNote(initialData.note || 0);
            }
        } else {
            setBusiness('');
            // setProducts(null);
            setDeliveryDate('');
            setNote('');
        }
        setErrors({});
    }, [open, mode, initialData]);

    const handleSelectBusiness = useCallback((business: Business) => {
        setSelectedBusiness(business);
        setSearchBusiness(`${business.name}`);
        setShowBusinessDropdown(false);
    }, []);

    const handleSelectProduct = useCallback((product: ProductWithBranchInfo) => {
        setSearchProduct('');
        setShowProductDropdown(false);
        setProductDetails(prev => [...prev, {
            product,
            selectedPriceTypeId: null,
            selectedPrice: null,
            productQuantity: null,
        }]);

    }, []);





    const handleSubmit = (e: React.FormEvent) => {
        // e.preventDefault();
        // if (!validate()) return;

        // const prices: ProductPrice[] = selectedPrices
        //   .map((type) => {
        //     const rawValue = valuesPrices[type];
        //     if (!rawValue) return null;
        //     const parsed = parseFloat(rawValue);
        //     if (isNaN(parsed)) return null;
        //     return {
        //       priceTypeId: priceTypeIdMap[type],
        //       price: Math.round(parsed * 100) / 100,
        //     };
        //   })
        //   .filter((p): p is ProductPrice => p !== null);

        // onSubmit({
        //   name: name.trim().replace(/\s+/g, " "),
        //   barcode: barcode.trim() || null,
        //   internalCode: internalCode.trim().replace(/\s+/g, " ") || null,
        //   presentationId: presentationId || null,
        //   colorId: colorId || null,
        //   prices,
        //   imageFile: imageFile || undefined,
        //   categoryId,
        //   brandId,
        // });

    };


    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="mx-4 my-10 w-full max-w-2xl overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
                <div className="flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
                    <h3 className="text-lg font-semibold tracking-wide">
                        {mode === 'create' ? 'Nuev Preventa' : 'Editar Preventa'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-brand-100 hover:text-white hover:bg-brand-700 transition-colors"
                        disabled={submitting}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 max-h-[70vh] overflow-y-auto">

                    <div className="flex-1 max-w-md relative">
                        <label className="block text-sm font-medium text-lead-700 mb-2">
                            Seleccione un negocio
                        </label>
                        <input
                            type="text"
                            value={searchBusiness}
                            onChange={(e) => {
                                setSearchBusiness(e.target.value);
                                setShowBusinessDropdown(true);
                                if (!e.target.value) setSelectedBusiness(null);
                            }}
                            onFocus={() => setShowBusinessDropdown(true)}
                            placeholder="Buscar por nombre..."
                            className="input-plain w-full"
                        />

                        {showBusinessDropdown && filteredBusiness.length > 0 && (
                            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl bg-white border border-lead-200 shadow-lg">
                                {filteredBusiness.map((b) => (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => handleSelectBusiness(b)}
                                        className={`w-full text-left px-4 py-3 hover:bg-lead-50 transition-colors border-b border-lead-100 last:border-b-0 ${selectedBusiness?.id === b.id ? 'bg-brand-50 text-brand-700' : ''
                                            }`}
                                    >
                                        <p className="font-medium text-sm text-lead-800">
                                            {b.name} {b.clientName}
                                        </p>
                                        <p className="text-xs text-lead-500">{b.nit ? b.nit : '-'}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showBusinessDropdown && filteredBusiness.length === 0 && searchBusiness && (
                            <div className="absolute z-50 mt-1 w-full rounded-xl bg-white border border-lead-200 shadow-lg p-4">
                                <p className="text-sm text-lead-500 text-center">No se encontraron negocios</p>
                            </div>
                        )}
                    </div>
                    {/* {selectedBusiness &&  (

                            <div className="mt-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 flex items-center gap-3">
                                <div className="flex-1 space-y-0.5">
                                    <p className="text-sm font-semibold text-brand-800">{selectedBusiness.name}</p>
                                    <p className="text-xs text-lead-600">Nombre cliente: {selectedBusiness.clientId}</p>
                                    <p className="text-xs text-lead-500">NIT: {selectedBusiness.nit || '—'}</p>
                                </div>
                            </div>
                    )} */}

                    <div className="flex-1 max-w-md relative">
                        <label className="block text-sm font-medium text-lead-700 mb-2">
                            Selecciona productos
                        </label>
                        <input
                            type="text"
                            value={searchProduct}
                            onChange={(e) => {
                                setSearchProduct(e.target.value);
                                setShowProductDropdown(true);
                            }}
                            onFocus={() => setShowProductDropdown(true)}
                            placeholder="Buscar por nombre..."
                            className="input-plain w-full"
                        />

                        {showProductDropdown && filteredProduct.length > 0 && (
                            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl bg-white border border-lead-200 shadow-lg">
                                {filteredProduct.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handleSelectProduct(p)}
                                        className={`w-full text-left px-4 py-3 hover:bg-lead-50 transition-colors border-b border-lead-100 last:border-b-0}`}
                                    >
                                        <p className="font-medium text-sm text-lead-800">
                                            {p.name} {p.branch.stockQty}
                                        </p>
                                        <p className="text-xs text-lead-500">{p.name ? p.name : '-'}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showProductDropdown && filteredProduct.length === 0 && searchProduct && (
                            <div className="absolute z-50 mt-1 w-full rounded-xl bg-white border border-lead-200 shadow-lg p-4">
                                <p className="text-sm text-lead-500 text-center">No se encontraron productos</p>
                            </div>
                        )}
                    </div>

                    {/* Lista de productos agregados */}
                    {productDetails.length > 0 && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-lead-700">
                                Productos agregados ({productDetails.length})
                            </label>
                            <div className="rounded-xl border border-lead-200 overflow-hidden">
                                {productDetails.map((detail, index) => (
                                    <div
                                        key={`${detail.product.id}-${index}`}
                                        className="flex items-start justify-between px-4 py-3 bg-white border-b border-lead-100 last:border-b-0 hover:bg-lead-50 transition-colors"
                                    >
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-lead-800">{detail.product.name}</p>
                                                <span className="rounded-full bg-lead-100 px-2 py-0.5 text-xs text-lead-600">
                                                    Stock: {detail.product.branch?.stockQty ?? '—'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {detail.product.prices?.map(price => (
                                                    <button
                                                        key={price.priceTypeId}
                                                        type="button"
                                                        onClick={() => setProductDetails(prev =>
                                                            prev.map((d, i) => i === index
                                                                ? { ...d, selectedPriceTypeId: price.priceTypeId, selectedPrice: price.price }
                                                                : d
                                                            )
                                                        )}
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border transition-colors
                                                                ${detail.selectedPriceTypeId === price.priceTypeId
                                                                ? 'bg-brand-600 text-white border-brand-600'
                                                                : 'bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-100'
                                                            }`}
                                                    >
                                                        {price.priceTypeName}: {Number(price.price).toFixed(2)}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <label className="text-xs text-lead-600 whitespace-nowrap">Cantidad:</label>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setProductDetails(prev =>
                                                            prev.map((d, i) => i === index
                                                                ? { ...d, productQuantity: Math.max(1, (d.productQuantity ?? 1) - 1) }
                                                                : d
                                                            )
                                                        )}
                                                        className="rounded-full w-6 h-6 flex items-center justify-center bg-lead-100 text-lead-700 hover:bg-lead-200 transition-colors text-sm font-bold"
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={detail.product.branch?.stockQty ?? undefined}
                                                        value={detail.productQuantity ?? 1}
                                                        onChange={(e) => {
                                                            const val = Math.max(1, Math.min(
                                                                Number(e.target.value),
                                                                detail.product.branch?.stockQty ?? Infinity
                                                            ));
                                                            setProductDetails(prev =>
                                                                prev.map((d, i) => i === index
                                                                    ? { ...d, productQuantity: val }
                                                                    : d
                                                                )
                                                            );
                                                        }}
                                                        className="w-14 text-center rounded-lg border border-lead-300 bg-white px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setProductDetails(prev =>
                                                            prev.map((d, i) => i === index
                                                                ? {
                                                                    ...d, productQuantity: Math.min(
                                                                        (d.productQuantity ?? 1) + 1,
                                                                        detail.product.branch?.stockQty ?? Infinity
                                                                    )
                                                                }
                                                                : d
                                                            )
                                                        )}
                                                        className="rounded-full w-6 h-6 flex items-center justify-center bg-lead-100 text-lead-700 hover:bg-lead-200 transition-colors text-sm font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                {detail.product.branch?.stockQty && (detail.productQuantity ?? 1) >= detail.product.branch.stockQty && (
                                                    <span className="text-xs text-amber-500">Máximo disponible</span>
                                                )}
                                            </div>
                                            {!detail.selectedPriceTypeId && (
                                                <p className="text-xs text-amber-500">Selecciona un tipo de precio</p>
                                            )}
                                        </div>
                                        <div className="mx-3 flex items-center justify-end min-w-[90px]">
                                            {detail.selectedPrice && detail.productQuantity ? (
                                                <p className="text-base font-semibold text-brand-700">
                                                    {(Number(detail.selectedPrice) * detail.productQuantity).toFixed(2)}
                                                </p>
                                            ) : (
                                                <p className="text-base text-lead-300">—</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setProductDetails(prev => prev.filter((_, i) => i !== index))}
                                            className="ml-3 rounded-full p-1 text-lead-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="barcode" className="block text-sm font-medium text-lead-700">
                                Fecha de entrega *
                            </label>
                            <input
                                type="text"
                                id="barcode"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                placeholder="123456789012"
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label htmlFor="internalCode" className="block text-sm font-medium text-lead-700">
                                Nota (opcional)
                            </label>
                            <input
                                type="text"
                                id="internalCode"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                placeholder="CAB-HDMI-2M"
                                disabled={submitting}
                            />
                        </div>
                    </div>


                    <div className="flex justify-end gap-3 pt-4 border-t border-lead-100">
                        <button
                            type="button"
                            className="rounded bg-white px-4 py-2 text-sm font-medium text-lead-700 border border-lead-300 hover:bg-lead-100 transition-colors"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="rounded bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            disabled={submitting}
                        >
                            {submitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
            {showBusinessDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowBusinessDropdown(false)}
                />
            )}

            {showProductDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProductDropdown(false)}
                />
            )}
        </div>
    );
};

export default PresaleFormModal;
