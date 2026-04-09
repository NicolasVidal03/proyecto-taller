import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ToastContainer, useToast } from '../components/shared/Toast';
import { useBranches, useConfirmDialog, useDebounce, useEntityModal } from '@presentation/hooks';
import { container } from '@infrastructure/config';
import { PresaleFilters, PresaleStatus } from '@domain/ports';
import { usePresales } from '@presentation/hooks/usePresales';
import { useUsers } from '@presentation/hooks/useUsers';
import PresalesTable from '@presentation/components/presales/PresalesTable';
import PresaleFormModal, { PresaleFormValues } from '@presentation/components/presales/PresaleFromModal';
import PresaleReport from '@presentation/components/presales/PresaleReport';
import { Presale } from '@domain/entities';
import { useAuth } from '@presentation/providers';
import ConfirmDialog from '@presentation/components/shared/ConfirmDialog';
import Loader from '@presentation/components/shared/Loader';
import Pagination from '@presentation/components/shared/Pagination';
import { triggerDownload } from '@presentation/utils/downloadFile';

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS: { label: string; value: PresaleStatus | 'all' }[] = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Asignado', value: 'asignado' },
    { label: 'Entregado', value: 'entregado' },
    { label: 'Parcial', value: 'parcial' },
    { label: 'Cancelado', value: 'cancelado' },
    { label: 'No entregado', value: 'no entregado' },
];

export const PresalesPage: React.FC = () => {
    const {
        presales,
        isLoading,
        error,
        page,
        total,
        totalPages,
        goToPage,
        applyFilters,
        clearError,
        assignDistributor,
        createPresale,
        updatePresale,
        cancelPresale,
    } = usePresales();

    const { branches, fetchBranches } = useBranches();
    const { users, fetchUsers } = useUsers();
    const auth = useAuth();

    const toast = useToast();
    const modal = useEntityModal<Presale>();
    const confirm = useConfirmDialog<Presale>();

    const [search, setSearch] = useState<string>('');
    const [branchFilter, setBranchFilter] = useState<number | 'all'>(auth.user?.branchId ?? 'all');
    const [statusFilter, setStatusFilter] = useState<PresaleStatus | 'all'>('all');
    const [presellerFilter, setPresellerFilter] = useState<number | 'all'>('all');
    const [distributorFilter, setDistributorFilter] = useState<number | 'all'>('all');
    const [deliveryDateFrom, setDeliveryDateFrom] = useState<string>('');
    const [deliveryDateTo, setDeliveryDateTo] = useState<string>('');

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        Promise.all([fetchBranches(), fetchUsers()]);
    }, [fetchBranches, fetchUsers]);

    useEffect(() => {
        const filters: PresaleFilters = {};
        if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
        if (branchFilter !== 'all') filters.branchId = branchFilter;
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (presellerFilter !== 'all') filters.presellerId = presellerFilter;
        if (distributorFilter !== 'all') filters.distributorId = distributorFilter;
        if (deliveryDateFrom) filters.deliveryDateFrom = deliveryDateFrom;
        if (deliveryDateTo) filters.deliveryDateTo = deliveryDateTo;
        applyFilters(filters);
    }, [debouncedSearch, branchFilter, statusFilter, presellerFilter, distributorFilter, deliveryDateFrom, deliveryDateTo, applyFilters]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, toast, clearError]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setBranchFilter(auth.user?.branchId ?? 'all');
        setStatusFilter('all');
        setPresellerFilter('all');
        setDistributorFilter('all');
        setDeliveryDateFrom('');
        setDeliveryDateTo('');
    }, [auth.user?.branchId]);

    const presellers = useMemo(() => users.filter(u => u.role?.toLowerCase() === 'prevendedor'), [users]);
    const distributors = useMemo(() => users.filter(u => u.role?.toLowerCase() === 'transportista'), [users]);

    const hasActiveFilters = !!(search || branchFilter !== (auth.user?.branchId ?? 'all') || statusFilter !== 'all' ||
        presellerFilter !== 'all' || distributorFilter !== 'all' || deliveryDateFrom || deliveryDateTo);

    const handleSubmit = async (values: PresaleFormValues) => {
        if (!auth.user) return;
        modal.setSubmitting(true);
        try {
            if (modal.modalState.mode === 'create') {
                const result = await createPresale(values);
                if (result) {
                    toast.success('Preventa creada correctamente');
                    modal.setSubmitting(false);
                    modal.close();
                }
            } else if (modal.modalState.entity) {
                const original = await container.presales.getById(modal.modalState.entity.id, true);
                const originalDetails = original.details ?? [];
                const newProductIds = new Set(values.details.map(d => d.productId));

                const remove = originalDetails
                    .filter(d => !newProductIds.has(d.productId))
                    .map(d => d.id);

                const update = values.details
                    .filter(d => originalDetails.some(od => od.productId === d.productId))
                    .map(d => {
                        const orig = originalDetails.find(od => od.productId === d.productId)!;
                        return { detailId: orig.id, quantityRequested: d.quantityRequested, unitPrice: d.unitPrice };
                    });

                const add = values.details
                    .filter(d => !originalDetails.some(od => od.productId === d.productId))
                    .map(d => ({
                        productId: d.productId,
                        quantityRequested: d.quantityRequested,
                        priceTypeId: d.priceTypeId,
                        unitPrice: d.unitPrice,
                    }));

                const result = await updatePresale(modal.modalState.entity.id, {
                    clientId: values.clientId,
                    businessId: values.businessId,
                    branchId: values.branchId,
                    deliveryDate: values.deliveryDate,
                    notes: values.notes,
                    details: { update, add, remove },
                });

                if (result) {
                    toast.success('Preventa actualizada correctamente');
                    modal.setSubmitting(false);
                    modal.close();
                }
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'No se pudo guardar la preventa';
            toast.error(message);
        } finally {
            modal.setSubmitting(false);
        }
    };

    const handleCancelPresale = async () => {
        if (!confirm.dialogState.entity || !auth.user) return;
        const presale = confirm.dialogState.entity;
        await confirm.executeWithLoading(async () => {
            const success = await cancelPresale(presale.id);
            if (success) {
                toast.success(`Preventa "${presale.businessName ?? presale.clientName}" cancelada correctamente`);
            }
        }, presale.id);
    };

    const downloadVoucher = async (presaleId: number) => {
        try {
            const blob = await container.presales.downloadVoucher(presaleId);
            triggerDownload(blob, `comprobante-${presaleId}preventa-${Date.now()}.pdf`)
        } catch(err) {
            const message = err instanceof Error ? err.message : 'No se pudo descargar el comprobante'
            toast.error(message)
        } 
    }

    return (
        <>
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
                <div className="relative space-y-10 px-6 py-8 lg:px-10 lg:py-12">

                    {/* Header */}
                    <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
                        />
                        <div className="grid gap-10 px-8 py-10 md:px-12 lg:grid-cols-[2fr,1.2fr]">
                            <div className="space-y-5">
                                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Preventas</p>
                                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                                    Preventas por Sucursal
                                </h2>

                                {/* Filtros */}
                                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                                    <input
                                        className="input-plain w-full"
                                        placeholder="Buscar por cliente, negocio o producto…"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />

                                    <div className="flex flex-wrap gap-3">
                                        <select
                                            className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                                            value={branchFilter}
                                            onChange={e => setBranchFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                        >
                                            <option value="all" className="text-lead-900">Todas las sucursales</option>
                                            {branches.filter(b => b.state).map(b => (
                                                <option key={b.id} value={b.id} className="text-lead-900">{b.name}</option>
                                            ))}
                                        </select>

                                        <select
                                            className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                                            value={statusFilter}
                                            onChange={e => setStatusFilter(e.target.value as PresaleStatus | 'all')}
                                        >
                                            {STATUS_OPTIONS.map(o => (
                                                <option key={o.value} value={o.value} className="text-lead-900">{o.label}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                                            value={presellerFilter}
                                            onChange={e => setPresellerFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                        >
                                            <option value="all" className="text-lead-900">Todos los prevendedores</option>
                                            {presellers.map(u => (
                                                <option key={u.id} value={u.id} className="text-lead-900">
                                                    {u.names} {u.lastName}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                                            value={distributorFilter}
                                            onChange={e => setDistributorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                        >
                                            <option value="all" className="text-lead-900">Todos los transportistas</option>
                                            {distributors.map(u => (
                                                <option key={u.id} value={u.id} className="text-lead-900">
                                                    {u.names} {u.lastName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-xs text-white/70 font-medium uppercase tracking-wide whitespace-nowrap">Entrega:</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                                                value={deliveryDateFrom}
                                                onChange={e => setDeliveryDateFrom(e.target.value)}
                                            />
                                            <span className="text-white/60 text-sm">→</span>
                                            <input
                                                type="date"
                                                className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                                                value={deliveryDateTo}
                                                onChange={e => setDeliveryDateTo(e.target.value)}
                                            />
                                        </div>
                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={handleClearFilters}
                                                className="ml-auto rounded-full px-4 py-2 text-xs font-semibold bg-white/20 text-white hover:bg-white/30 border border-white/20 transition-colors"
                                            >
                                                Limpiar filtros
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas */}
                            <div className="relative">
                                <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                                <div className="relative space-y-5 rounded-[2rem] border border-white/20 bg-white/10 px-7 py-8 backdrop-blur">
                                    <p className="text-xs uppercase tracking-[0.35em] text-white/60">Resumen</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-600 px-4 py-5 shadow-lg">
                                            <p className="text-xs uppercase tracking-wide text-white/80">Total preventas</p>
                                            <p className="mt-2 text-4xl font-semibold text-white">{total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tabla */}
                    <section className="grid gap-8 xl:grid-cols-[1fr]">
                        <div className="card shadow-xl ring-1 ring-black/5">
                            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-brand-900">Listado de preventas</h3>
                                    <p className="text-sm text-lead-500">
                                        {totalPages > 0 && `Página ${page} de ${totalPages} • `}
                                        {total.toLocaleString()} preventa(s) total
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-3">

                                    {/* <PresaleReport users={users} /> */}

                                    <button
                                        type="button"
                                        className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        onClick={modal.openCreate}
                                    >
                                        Crear preventa
                                    </button>
                                </div>
                            </div>

                            {isLoading && <Loader />}

                            {!isLoading && (
                                <>
                                    <PresalesTable
                                        presales={presales}
                                        assignDistributor={assignDistributor}
                                        onEdit={modal.openEdit}
                                        onCancel={confirm.openConfirm}
                                        downloadVoucher={downloadVoucher}
                                    />
                                    {totalPages > 0 && (
                                        <div className="mt-6">
                                            <Pagination
                                                currentPage={page}
                                                totalPages={totalPages}
                                                totalItems={total}
                                                itemsPerPage={ITEMS_PER_PAGE}
                                                onPageChange={goToPage}
                                                isLoading={isLoading}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </div>

                <PresaleFormModal
                    open={modal.modalState.isOpen}
                    mode={modal.modalState.mode}
                    initialData={modal.modalState.entity}
                    submitting={modal.modalState.isSubmitting}
                    onClose={modal.close}
                    onSubmit={handleSubmit}
                />
                <ConfirmDialog
                    open={confirm.dialogState.isOpen}
                    title="Cancelar preventa"
                    message="El stock será repuesto automáticamente."
                    confirmLabel="Confirmar"
                    onConfirm={handleCancelPresale}
                    onCancel={confirm.closeConfirm}
                    disabled={confirm.dialogState.isLoading}
                />

                <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
            </div>
        </>
    );
};
