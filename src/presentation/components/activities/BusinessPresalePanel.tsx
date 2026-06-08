import React, { useEffect, useState } from 'react';
import { Presale } from '@domain/entities/Presale';
import { GetPresalesByDateBusinessAndUserFilters } from '@domain/ports/IPresaleRepository';
import { container } from '@infrastructure/config';

interface BusinessPresalesPanelProps {
    deliveryDate: string;
    businessId: number;
    userId: number;
}

const statusStyles: Record<string, { bg: string; dot: string; label: string }> = {
    pendiente: { bg: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', label: 'Pendiente' },
    asignado: { bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', label: 'Asignado' },
    entregado: { bg: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'Entregado' },
    parcial: { bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', label: 'Parcial' },
    cancelado: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Cancelado' },
    'no entregado': { bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', label: 'No entregado' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const style = statusStyles[status.toLowerCase()] ?? { bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', label: status };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.label}
        </span>
    );
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(value);

const BusinessPresalesPanel: React.FC<BusinessPresalesPanelProps> = ({ deliveryDate, businessId, userId, }) => {
    const [presales, setPresales] = useState<Presale[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setPresales([]);
        setExpandedId(null);

        const filters: GetPresalesByDateBusinessAndUserFilters = { deliveryDate, businessId, userId };

        container.presales.getByDateBusinessAndUser(filters)
            .then(data => { if (!cancelled) setPresales(data); })
            .catch(err => { if (!cancelled) setError(err?.response?.data?.error ?? err?.message ?? 'Error al cargar preventas'); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [deliveryDate, businessId, userId]);

    if (loading) {
        return (
            <div className="mt-5 pt-5 border-t border-lead-100">
                <p className="text-xs uppercase tracking-widest text-lead-400 font-semibold mb-3">Preventas del día</p>
                <div className="flex items-center gap-2 text-sm text-lead-400">
                    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Cargando preventas...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-5 pt-5 border-t border-lead-100">
                <p className="text-xs uppercase tracking-widest text-lead-400 font-semibold mb-3">Preventas del día</p>
                <p className="text-sm text-red-500">{error}</p>
            </div>
        );
    }

    if (presales.length === 0) {
        return (
            <div className="mt-5 pt-5 border-t border-lead-100">
                <p className="text-xs uppercase tracking-widest text-lead-400 font-semibold mb-3">Preventas del día</p>
                <p className="text-sm text-lead-400 italic">Sin preventas registradas para este negocio.</p>
            </div>
        );
    }

    return (
        <div className="mt-5 pt-5 border-t border-lead-100 col-span-2">
            <p className="text-xs uppercase tracking-widest text-lead-400 font-semibold mb-3">
                Preventas del día
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                    {presales.length}
                </span>
            </p>

            <div className="space-y-2">
                {presales.map(presale => {
                    const isExpanded = expandedId === presale.id;
                    return (
                        <div
                            key={presale.id}
                            className="rounded-xl border border-lead-200 overflow-hidden bg-white shadow-sm"
                        >
                            <button
                                type="button"
                                onClick={() => setExpandedId(isExpanded ? null : presale.id)}
                                className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 hover:bg-lead-50 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs font-mono text-lead-400 shrink-0">#{presale.id}</span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-lead-800 truncate">
                                            {presale.clientName} {presale.clientLastName}
                                        </p>
                                        <p className="text-xs text-lead-500">
                                            {presale.branchName ?? 'Sucursal —'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <StatusBadge status={presale.status} />
                                    <svg
                                        className={`w-4 h-4 text-lead-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="border-t border-lead-100 px-4 pb-4 pt-3 space-y-4">

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs text-lead-400">Subtotal</p>
                                            <p className="font-medium text-lead-700">{formatCurrency(presale.subtotal)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-lead-400">Total</p>
                                            <p className="font-bold text-brand-700">{formatCurrency(presale.total)}</p>
                                        </div>
                                        {presale.presellerName && (
                                            <div>
                                                <p className="text-xs text-lead-400">Prevendedor</p>
                                                <p className="font-medium text-lead-700">{presale.presellerName}</p>
                                            </div>
                                        )}
                                        {presale.distributorName && (
                                            <div>
                                                <p className="text-xs text-lead-400">Distribuidor</p>
                                                <p className="font-medium text-lead-700">{presale.distributorName}</p>
                                            </div>
                                        )}
                                        {presale.deliveryNotes && (
                                            <div className="col-span-2">
                                                <p className="text-xs text-lead-400">Notas</p>
                                                <p className="font-medium text-lead-700">{presale.deliveryNotes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {presale.details && presale.details.length > 0 && (
                                        <div>
                                            <p className="text-xs text-lead-400 mb-2">Productos</p>
                                            <div className="rounded-lg overflow-hidden border border-lead-100">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-lead-50">
                                                        <tr>
                                                            <th className="text-left px-3 py-2 font-semibold text-lead-600">Producto</th>
                                                            <th className="text-center px-3 py-2 font-semibold text-lead-600">Cant.</th>
                                                            <th className="text-right px-3 py-2 font-semibold text-lead-600">P. Unit.</th>
                                                            <th className="text-right px-3 py-2 font-semibold text-lead-600">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-lead-100">
                                                        {presale.details.map(detail => (
                                                            <tr key={detail.id} className="bg-white">
                                                                <td className="px-3 py-2 text-lead-700 font-medium">{detail.productName}</td>
                                                                <td className="px-3 py-2 text-center text-lead-600">
                                                                    {detail.quantityRequested}
                                                                    {detail.quantityDelivered !== null && (
                                                                        <span className="text-lead-400"> / {detail.quantityDelivered}</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-right text-lead-600">
                                                                    {formatCurrency(detail.unitPrice)}
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-semibold text-lead-700">
                                                                    {formatCurrency(detail.subtotalDelivered ?? detail.subtotalRequested)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BusinessPresalesPanel;