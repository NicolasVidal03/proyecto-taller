import { Presale, User } from "@domain/entities";
import { useToast } from "../shared/Toast";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUsers } from "@presentation/hooks";
import PresalesDistributorSelector from "./PresalesDistributorSelector";

type PresalesTableProps = {
    presales: Presale[];
    branchFilter?: number | string;
    statusFilter?: string;
    onEdit: (presale: Presale) => void;
    busyId?: number | null;
    onCancel: (presale: Presale) => void;
    assignDistributor: (presaleId: number, distributorId: number) => Promise<Presale | null>
};

const PresalesTable: React.FC<PresalesTableProps> = ({
    presales,
    branchFilter,
    statusFilter,
    assignDistributor,
    onEdit,
    onCancel,
    busyId
}) => {

    const isBusy = (id: number) => busyId != null && busyId === id;
    const toast = useToast();

    const {
        users,
        isLoading: usersLoading,
        error: usersError,
        fetchUsers,
        clearError: clearUsersError,
    } = useUsers();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (usersError) {
            toast.error(usersError.message);
            clearUsersError();
        }
    }, [usersError, toast, clearUsersError]);

    const distributorUser = useMemo(() => {
        return users.filter(u => u.role?.toLowerCase() === 'transportista');
    }, [users]);

    const userMap = useMemo(() => {
        return new Map(users.map(u => [u.id, u]));
    }, [users]);

    const filteredPresales = useMemo(() => {
        return presales.filter(p => {
            const matchesBranch = branchFilter === 'all' || p.branchId === branchFilter;
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            return matchesBranch && matchesStatus;
        })
            .sort((a, b) => b.id - a.id);
    }, [presales, branchFilter, statusFilter]);

    const isEmpty = filteredPresales.length === 0;

    return (
        <div className="space-y-3">

            <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
                        <tr>
                            <th className="px-4 py-4 text-left font-semibold">Negocio</th>
                            <th className="px-4 py-4 text-left font-semibold">Sucursal</th>
                            <th className="px-4 py-4 text-left font-semibold">Prevendedor</th>
                            <th className="px-4 py-4 text-left font-semibold">Trans ID</th>
                            <th className="px-4 py-4 text-left font-semibold">Estado</th>
                            <th className="px-4 py-4 text-left font-semibold">Fecha de Entrega</th>
                            <th className="px-4 py-4 text-left font-semibold">Total</th>
                            <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lead-200">
                        {isEmpty ? (
                            <tr>
                                <td className="px-4 py-6 text-center text-sm text-lead-600" colSpan={8}>
                                    No hay preventas para mostrar.
                                </td>
                            </tr>
                        ) : filteredPresales.map(p => (
                            <tr key={p.id} className="transition-colors hover:bg-white">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-lead-800">{p.businessName ? p.businessName : p.clientLastName + ', ' + p.clientName}</p>
                                </td>
                                <td className="px-4 py-3 text-lead-600">
                                    {p.branchName || '—'}
                                </td>
                                <td className="px-4 py-3 text-lead-600">
                                    {p.presellerName || '—'}
                                </td>
                                <td className="px-4 py-3 text-lead-600 text-xs">
                                    <PresalesDistributorSelector
                                        users={distributorUser}
                                        initialUser={p.distributorId ? userMap.get(p.distributorId) ?? null : null}
                                        onSelect={(user) => assignDistributor(p.id, user.id)}
                                    />
                                </td>
                                <td className="px-4 py-3 text-lead-600 text-xs">
                                    {p.status.toLocaleUpperCase() || '—'}
                                </td>
                                <td className="px-4 py-3 text-lead-600 text-xs">
                                    {p.deliveryDate || '—'}
                                </td>
                                <td className="px-4 py-3 text-lead-600 text-xs">
                                    {p.total || '—'}
                                </td>
                                <td className="px-4 py-3 text-center align-middle">
                                    <div className="flex items-center justify-center gap-2">
                                        {p.status === 'pendiente' && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(p)}
                                                    className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                                                    disabled={isBusy(p.id)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="rounded px-3 py-1.5 font-medium transition disabled:opacity-50 bg-accent-100 text-accent-700 hover:bg-accent-200"
                                                    onClick={() => onCancel(p)}
                                                    disabled={isBusy(p.id)}
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        )}
                                        {p.status !== 'pendiente' && (
                                            <span className="text-xs text-lead-400 italic">Sin acciones disponibles</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PresalesTable;