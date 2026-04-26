import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { container } from '@infrastructure/config';
import { PaginatedPresaleReport, PresaleReportFilters, PresaleReportItem } from '@domain/ports/IPresaleRepository';
import { User } from '@domain/entities';
import Pagination from '@presentation/components/shared/Pagination';
import Loader from '@presentation/components/shared/Loader';
import { triggerDownload } from '@presentation/utils/downloadFile';

function formatDate(dateStr: string) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-BO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
}

function formatCurrency(amount: number) {
    return `Bs ${amount.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_BADGE: Record<string, string> = {
    pendiente:      'bg-yellow-100 text-yellow-800 border-yellow-200',
    asignado:       'bg-blue-100 text-blue-800 border-blue-200',
    entregado:      'bg-green-100 text-green-800 border-green-200',
    parcial:        'bg-orange-100 text-orange-800 border-orange-200',
    cancelado:      'bg-red-100 text-red-800 border-red-200',
    'no entregado': 'bg-gray-100 text-gray-700 border-gray-200',
};

const REPORT_LIMIT = 15;

interface FilterDropdownProps {
    users: User[];
    onApply: (filters: PresaleReportFilters) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ users, onApply }) => {
    const [open, setOpen]         = useState(false);
    const [userId, setUserId]     = useState<number | ''>('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo]     = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleApply = () => {
        const filters: PresaleReportFilters = {};
        if (userId !== '') filters.userId   = Number(userId);
        if (dateFrom)      filters.dateFrom = dateFrom;
        if (dateTo)        filters.dateTo   = dateTo;
        onApply(filters);
        setOpen(false);
    };

    const handleClear = () => { setUserId(''); setDateFrom(''); setDateTo(''); };

    const presellers = users.filter(u =>
        u.role?.toLowerCase() === 'prevendedor' || u.role?.toLowerCase() === 'transportista'
    );


    const filterContent = (
        <div className="p-5 space-y-4">
            <p className="text-sm font-semibold text-brand-900 border-b border-lead-100 pb-3">
                Filtros del reporte
            </p>
            <div className="space-y-1">
                <label className="text-xs font-medium text-lead-600 uppercase tracking-wide">
                    Prevendedor / Transportista
                </label>
                <select
                    className="w-full rounded-xl border border-lead-200 px-3 py-2 text-sm text-lead-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    value={userId}
                    onChange={e => setUserId(e.target.value === '' ? '' : Number(e.target.value))}
                >
                    <option value="">Todos</option>
                    {presellers.map(u => (
                        <option key={u.id} value={u.id}>
                            {u.names} {u.lastName} ({u.role})
                        </option>
                    ))}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-lead-600 uppercase tracking-wide">Desde</label>
                <input
                    type="date"
                    className="w-full rounded-xl border border-lead-200 px-3 py-2 text-sm text-lead-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-lead-600 uppercase tracking-wide">Hasta</label>
                <input
                    type="date"
                    className="w-full rounded-xl border border-lead-200 px-3 py-2 text-sm text-lead-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                />
            </div>
            <div className="flex gap-2 pt-1">
                <button
                    type="button"
                    onClick={handleClear}
                    className="flex-1 rounded-xl border border-lead-200 py-2 text-sm text-lead-600 hover:bg-lead-50 transition-colors"
                >
                    Limpiar
                </button>
                <button
                    type="button"
                    onClick={handleApply}
                    className="flex-1 rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                >
                    Aceptar
                </button>
            </div>
        </div>
    );

    const btnRef = useRef<HTMLButtonElement>(null);
    const [dropPos, setDropPos] = useState<{ top: number; right: number } | null>(null);

    const handleOpen = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropPos({ top: rect.bottom + window.scrollY + 8, right: window.innerWidth - rect.right });
        }
        setOpen(v => !v);
    };

    return (
        <div ref={ref}>
            <button
                ref={btnRef}
                type="button"
                onClick={handleOpen}
                className="btn-primary flex items-center gap-2 bg-white border text-brand-700 shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 17v-6m4 6v-4m4 4V9M5 20h14a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                Generar reporte
                <svg
                    className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && createPortal(
                <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />

                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[100] sm:hidden rounded-2xl border border-lead-100 bg-white shadow-2xl">
                        {filterContent}
                    </div>

                    {dropPos && (
                        <div
                            className="hidden sm:block fixed z-[100] w-80 rounded-2xl border border-lead-100 bg-white shadow-2xl"
                            style={{ top: dropPos.top, right: dropPos.right }}
                        >
                            {filterContent}
                        </div>
                    )}
                </>,
                document.body
            )}
        </div>
    );
};

interface ReportModalProps {
    open: boolean;
    filters: PresaleReportFilters;
    onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ open, filters, onClose }) => {
    const [report, setReport]               = useState<PaginatedPresaleReport | null>(null);
    const [loading, setLoading]             = useState(false);
    const [page, setPage]                   = useState(1);
    const [downloadingPdf, setDownloadingPdf]     = useState(false);
    const [downloadingExcel, setDownloadingExcel] = useState(false);
    const [expandedId, setExpandedId]       = useState<number | null>(null);

    const fetchReport = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const data = await container.presales.getReport(filters, p, REPORT_LIMIT);
            setReport(data);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (open) { setPage(1); setExpandedId(null); fetchReport(1); }
    }, [open, fetchReport]);

    const handlePageChange = (p: number) => { setPage(p); fetchReport(p); };

    const handleDownloadPdf = async () => {
        setDownloadingPdf(true);
        try {
            const blob = await container.presales.downloadReportPdf(filters);
            triggerDownload(blob, `reporte-preventas-${Date.now()}.pdf`);
        } finally {
            setDownloadingPdf(false);
        }
    };

    const handleDownloadExcel = async () => {
        setDownloadingExcel(true);
        try {
            const blob = await container.presales.downloadReportExcel(filters);
            triggerDownload(blob, `reporte-preventas-${Date.now()}.xlsx`);
        } finally {
            setDownloadingExcel(false);
        }
    };

    if (!open) return null;

    const SpinIcon = () => (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
    );

    const DownloadIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full sm:max-w-6xl max-h-[95vh] sm:max-h-[90vh] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">

                <div className="flex flex-col gap-3 px-4 py-4 sm:px-8 sm:py-5 border-b border-lead-100 bg-gradient-to-r from-brand-900 to-brand-600">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base sm:text-xl font-bold text-white">Reporte de Preventas</h2>
                            <p className="text-xs text-white/70 mt-0.5">
                                {report ? `${report.total.toLocaleString()} registro(s) encontrado(s)` : 'Cargando…'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="shrink-0 rounded-xl bg-white/20 hover:bg-white/30 p-2 text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleDownloadExcel}
                            disabled={downloadingExcel}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors shadow-md"
                        >
                            {downloadingExcel ? <SpinIcon /> : <DownloadIcon />}
                            <span className="hidden xs:inline">Descargar </span>Excel
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={downloadingPdf}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors shadow-md"
                        >
                            {downloadingPdf ? <SpinIcon /> : <DownloadIcon />}
                            <span className="hidden xs:inline">Descargar </span>PDF
                        </button>
                    </div>
                </div>

                {(filters.userId || filters.dateFrom || filters.dateTo) && (
                    <div className="flex flex-wrap gap-2 px-4 sm:px-8 py-3 bg-brand-50 border-b border-brand-100">
                        <span className="text-xs font-medium text-brand-700 uppercase tracking-wide self-center">Filtros:</span>
                        {filters.userId && (
                            <span className="rounded-full bg-brand-100 text-brand-800 text-xs px-3 py-1 border border-brand-200">
                                Usuario ID: {filters.userId}
                            </span>
                        )}
                        {filters.dateFrom && (
                            <span className="rounded-full bg-brand-100 text-brand-800 text-xs px-3 py-1 border border-brand-200">
                                Desde: {formatDate(filters.dateFrom)}
                            </span>
                        )}
                        {filters.dateTo && (
                            <span className="rounded-full bg-brand-100 text-brand-800 text-xs px-3 py-1 border border-brand-200">
                                Hasta: {formatDate(filters.dateTo)}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-8 sm:py-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader />
                        </div>
                    ) : !report || report.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-lead-400">
                            <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm font-medium">No se encontraron preventas</p>
                            <p className="text-xs mt-1">Intenta ajustar los filtros del reporte</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {report.data.map((item: PresaleReportItem) => (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-lead-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                        className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-white hover:bg-lead-50 transition-colors text-left"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xs font-bold text-brand-400 shrink-0">#{item.id}</span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-lead-900 truncate">
                                                        {item.clientName} {item.clientLastName}
                                                    </p>
                                                    {item.businessName && (
                                                        <p className="text-xs text-lead-500 truncate">{item.businessName}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[item.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {item.status}
                                                </span>
                                                <svg
                                                    className={`w-4 h-4 text-lead-400 transition-transform shrink-0 ${expandedId === item.id ? 'rotate-180' : ''}`}
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:flex sm:flex-wrap sm:gap-x-6 text-xs text-lead-600">
                                            <div>
                                                <span className="text-lead-400">Prevendedor: </span>
                                                <span className="font-medium text-lead-800">{item.presellerName}</span>
                                            </div>
                                            <div>
                                                <span className="text-lead-400">Transportista: </span>
                                                <span className="font-medium text-lead-800">{item.distributorName}</span>
                                            </div>
                                            <div>
                                                <span className="text-lead-400">Entrega: </span>
                                                <span className="font-medium text-lead-800">{formatDate(item.deliveryDate)}</span>
                                            </div>
                                            <div>
                                                <span className="text-lead-400">Total: </span>
                                                <span className="font-bold text-brand-700">{formatCurrency(item.total)}</span>
                                            </div>
                                        </div>
                                    </button>

                                    {expandedId === item.id && (
                                        <div className="border-t border-lead-100 bg-lead-50 px-4 py-4 sm:px-5">
                                            <p className="text-xs font-semibold text-lead-500 uppercase tracking-wide mb-3">
                                                Detalle de productos
                                            </p>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-xs text-lead-500 uppercase">
                                                            <th className="text-left pb-2 pr-4 whitespace-nowrap">Producto</th>
                                                            <th className="text-left pb-2 pr-4 whitespace-nowrap">Cód. barras</th>
                                                            <th className="text-right pb-2 pr-4 whitespace-nowrap">Precio unit.</th>
                                                            <th className="text-right pb-2 pr-4 whitespace-nowrap">Cant. pedida</th>
                                                            <th className="text-right pb-2 pr-4 whitespace-nowrap">Cant. entregada</th>
                                                            <th className="text-right pb-2 pr-4 whitespace-nowrap">Subtotal pedido</th>
                                                            <th className="text-right pb-2 whitespace-nowrap">Subtotal entregado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-lead-100">
                                                        {item.details.map(d => (
                                                            <tr key={d.id} className="text-lead-800">
                                                                <td className="py-2 pr-4 font-medium whitespace-nowrap">{d.productName}</td>
                                                                <td className="py-2 pr-4 text-lead-500 whitespace-nowrap">{d.productBarcode ?? '—'}</td>
                                                                <td className="py-2 pr-4 text-right whitespace-nowrap">{formatCurrency(d.unitPrice)}</td>
                                                                <td className="py-2 pr-4 text-right">{d.quantityRequested}</td>
                                                                <td className="py-2 pr-4 text-right">{d.quantityDelivered ?? '—'}</td>
                                                                <td className="py-2 pr-4 text-right whitespace-nowrap">{formatCurrency(d.subtotalRequested)}</td>
                                                                <td className="py-2 text-right whitespace-nowrap">
                                                                    {d.subtotalDelivered != null ? formatCurrency(d.subtotalDelivered) : '—'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {(item.notes || item.deliveryNotes) && (
                                                <div className="mt-3 flex flex-wrap gap-4 text-xs text-lead-500">
                                                    {item.notes && (
                                                        <p><span className="font-medium">Notas:</span> {item.notes}</p>
                                                    )}
                                                    {item.deliveryNotes && (
                                                        <p><span className="font-medium">Notas de entrega:</span> {item.deliveryNotes}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {report && report.totalPages > 1 && (
                    <div className="border-t border-lead-100 px-4 py-4 sm:px-8">
                        <Pagination
                            currentPage={page}
                            totalPages={report.totalPages}
                            totalItems={report.total}
                            itemsPerPage={REPORT_LIMIT}
                            onPageChange={handlePageChange}
                            isLoading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

interface PresaleReportProps {
    users: User[];
}

export const PresaleReport: React.FC<PresaleReportProps> = ({ users }) => {
    const [reportFilters, setReportFilters] = useState<PresaleReportFilters>({});
    const [reportOpen, setReportOpen]       = useState(false);

    const handleApplyFilters = (filters: PresaleReportFilters) => {
        setReportFilters(filters);
        setReportOpen(true);
    };

    return (
        <>
            <FilterDropdown users={users} onApply={handleApplyFilters} />
            <ReportModal
                open={reportOpen}
                filters={reportFilters}
                onClose={() => setReportOpen(false)}
            />
        </>
    );
};

export default PresaleReport;