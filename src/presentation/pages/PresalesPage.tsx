import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ToastContainer, useToast } from '../components/shared/Toast';
import { useBranches, useConfirmDialog, useDebounce, useEntityModal } from '@presentation/hooks';
import { container } from '@infrastructure/config';
import { PresaleFilters } from '@domain/ports';
import { usePresales } from '@presentation/hooks/usePresales';
import PresalesTable from '@presentation/components/presales/PresalesTable';
import PresaleFormModal, { PresaleFormValues } from '@presentation/components/presales/PresaleFromModal';
import { Presale } from '@domain/entities';
import { useAuth } from '@presentation/providers';
import ConfirmDialog from '@presentation/components/shared/ConfirmDialog';

interface PresalesSectionProps {
    searchTerm: string;
    branchFilter: string | 'all';
}

export const PresalesPage: React.FC<PresalesSectionProps> = ({
}) => {
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

    const { branches, fetchBranches, isLoading: branchesLoading } = useBranches();
    const auth = useAuth();
    const statusValues = ['Pendiente', 'Asignado', 'Entregado', 'Parcial', 'Cancelado']


    const [search, setSearch] = useState<string>('');
    const [branchFilter, setBranchFilter] = useState<number | 'all'>(auth.user?.branchId ?? 'all');
    const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');

    const toast = useToast();
    const modal = useEntityModal<Presale>();
    const modalStock = useEntityModal<Presale>();
    const confirm = useConfirmDialog<Presale>();

    const debouncedSearch = useDebounce(search, 500)

    useEffect(() => {
        Promise.all([fetchBranches()]);
    }, [fetchBranches]);

    useEffect(() => {
        const filters: { search?: string; branchId?: number; } = {};
        if (debouncedSearch.trim()) {
            filters.search = debouncedSearch.trim();
        }

        if (branchFilter !== 'all') {
            filters.branchId = branchFilter;
        }

        applyFilters(filters)
    }, [debouncedSearch, branchFilter, applyFilters])

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, toast, clearError]);


    const stats = useMemo(() => ({
        cards: [
            { label: 'Total Preventas', value: presales.length, accent: 'from-brand-900 to-brand-600' }
        ]

    }), [presales.length])

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

                const originalIds = new Set(originalDetails.map(d => d.id));
                const newProductIds = new Set(values.details.map(d => d.productId));

                // Productos a eliminar: estaban antes y ya no están
                const remove = originalDetails
                    .filter(d => !newProductIds.has(d.productId))
                    .map(d => d.id);

                // Productos a actualizar: estaban antes y siguen estando
                const update = values.details
                    .filter(d => originalDetails.some(od => od.productId === d.productId))
                    .map(d => {
                        const original = originalDetails.find(od => od.productId === d.productId)!;
                        return {
                            detailId: original.id,
                            quantityRequested: d.quantityRequested,
                            unitPrice: d.unitPrice,
                        };
                    });

                // Productos a agregar: no estaban antes
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
        console.log('hola')
        if (!confirm.dialogState.entity || !auth.user) return;
        const presale = confirm.dialogState.entity;
        console.log('entra aca')
        await confirm.executeWithLoading(async () => {
            const success = await cancelPresale(presale.id);
            console.log("antes del true")
            if (success) {
                toast.success(`Producto "${presale.businessName}" eliminado correctamente`);
            }
        }, presale.id);
    };


    return (
        <>
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
                <div className="relative space-y-10 px-6 py-8 lg:px-10 lg:py-12">
                    <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
                        />
                        <div className="grid gap-10 px-8 py-10 md:px-12 lg:grid-cols-[2fr,1.2fr]">
                            <div className="space-y-6">
                                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Preventas</p>
                                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                                    Preventas por Sucursal
                                </h2>

                                {/* Buscador y filtros */}
                                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                                    <div className="flex flex-col gap-3 md:flex-row">
                                        <input
                                            className="input-plain flex-1"
                                            placeholder={'Buscar por cliente, producto'}
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <select
                                            className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                                            value={branchFilter}
                                            onChange={(e) => setBranchFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                        >
                                            <option value="all" className="text-lead-900">Todas las sucursales</option>
                                            {branches.filter(b => b.state).map(c => (
                                                <option key={c.id} value={c.id} className="text-lead-900">{c.name}</option>
                                            ))}
                                        </select>

                                        <select
                                            className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value === 'all' ? 'all' : e.target.value)}
                                        >
                                            <option value="all" className="text-lead-900">Todos los estados</option>
                                            {statusValues.map(s => (
                                                <option key={s.toLowerCase()} value={s.toLowerCase()} className="text-lead-900">{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Estadisticas */}
                            <div className="relative">
                                <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                                <div className="relative space-y-5 rounded-[2rem] border border-white/20 bg-white/10 px-7 py-8 backdrop-blur">
                                    <div className="grid grid-cols-2 gap-4">
                                        {stats.cards.map(card => (
                                            <div key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.accent} px-4 py-5 shadow-lg`}>
                                                <p className="text-xs uppercase tracking-wide text-white/80">{card.label}</p>
                                                <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>


                    <section className="grid gap-8 xl:grid-cols-[1fr]">
                        <div className="card shadow-xl ring-1 ring-black/5">
                            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-brand-900">Listado de preventas</h3>
                                    <p className="text-sm text-lead-500">
                                        {totalPages > 0 && `Página ${page} de ${totalPages} • `}
                                        {total.toLocaleString()} preventa(s) total
                                        {/* {(debouncedSearch || categoryFilter !== 'all' || brandFilter !== 'all') && ' (filtrados)'} */}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    onClick={modal.openCreate}
                                >
                                    Crear preventa
                                </button>
                            </div>

                            <PresalesTable
                                presales={presales}
                                branchFilter={branchFilter}
                                statusFilter={statusFilter}
                                assignDistributor={assignDistributor}
                                onEdit={modal.openEdit}
                                onCancel={confirm.openConfirm}
                            // onToast={handleToast}
                            />

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
                    message='El stock será repuesto automáticamente.'
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