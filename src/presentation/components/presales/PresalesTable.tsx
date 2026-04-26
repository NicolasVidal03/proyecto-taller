import { Presale } from "@domain/entities";
import { useToast } from "../shared/Toast";
import { useEffect, useMemo } from "react";
import { useUsers } from "@presentation/hooks";
import PresalesDistributorSelector from "./PresalesDistributorSelector";

type PresalesTableProps = {
    presales: Presale[];
    onEdit: (presale: Presale) => void;
    busyId?: number | null;
    onCancel: (presale: Presale) => void;
    downloadVoucher: (presaleId: number) => void;
    assignDistributor: (presaleId: number, distributorId: number) => Promise<Presale | null>;
};

const statusStyles: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    asignado: 'bg-blue-100 text-blue-700',
    entregado: 'bg-green-100 text-green-700',
    parcial: 'bg-orange-100 text-orange-700',
    cancelado: 'bg-red-100 text-red-700',
};

const StatusBadge = ({ status }: { status: string }) => {
    const style = statusStyles[status.toLowerCase()] ?? 'bg-lead-100 text-lead-600';
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${style}`}>
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>
    );
};

const PresalesTable: React.FC<PresalesTableProps> = ({
    presales,
    assignDistributor,
    onEdit,
    onCancel,
    downloadVoucher,
    busyId,
}) => {
    const isBusy = (id: number) => busyId != null && busyId === id;
    const toast = useToast();

    const { users, isLoading: usersLoading, error: usersError, fetchUsers, clearError: clearUsersError } = useUsers();

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    useEffect(() => {
        if (usersError) { toast.error(usersError.message); clearUsersError(); }
    }, [usersError, toast, clearUsersError]);

    const distributorUsers = useMemo(() => users.filter(u => u.role?.toLowerCase() === 'transportista'), [users]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    if (presales.length === 0) {
        return (
            <div className="rounded-lg border border-lead-200 bg-lead-50 px-4 py-8 text-center text-sm text-lead-500 shadow-lg">
                No hay preventas para mostrar.
            </div>
        );
    }

    return (
        <div className="space-y-3">

            <div className="flex flex-col gap-3 md:hidden">
                {presales.map(p => {
                    const clientLabel = p.businessName ? p.businessName : `${p.clientLastName}, ${p.clientName}`;
                    const busy = isBusy(p.id);

                    return (
                        <div key={p.id} className="rounded-xl border border-lead-200 bg-lead-50 p-4 shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <p className="font-semibold text-lead-800 truncate">{clientLabel}</p>
                                <StatusBadge status={p.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-lead-600">
                                <div>
                                    <span className="uppercase tracking-wide text-lead-400 font-medium">Sucursal</span>
                                    <p className="mt-0.5">{p.branchName || '—'}</p>
                                </div>
                                <div>
                                    <span className="uppercase tracking-wide text-lead-400 font-medium">Prevendedor</span>
                                    <p className="mt-0.5">{p.presellerName || 'VENTA DIRECTA'}</p>
                                </div>
                                <div>
                                    <span className="uppercase tracking-wide text-lead-400 font-medium">Entrega</span>
                                    <p className="mt-0.5">{p.deliveryDate || '—'}</p>
                                </div>
                                <div>
                                    <span className="uppercase tracking-wide text-lead-400 font-medium">Total</span>
                                    <p className="mt-0.5 font-semibold text-lead-800">{'Bs. ' + p.total || '—'}</p>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs uppercase tracking-wide text-lead-400 font-medium">Transportista</span>
                                <div className="mt-1">
                                    {!usersLoading ? (
                                        <PresalesDistributorSelector
                                            users={distributorUsers}
                                            initialUser={p.distributorId ? userMap.get(p.distributorId) ?? null : null}
                                            onSelect={user => assignDistributor(p.id, user.id)}
                                            status={p.status}
                                        />
                                    ) : (
                                        <span className="text-xs text-lead-400 italic">Cargando...</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1 border-t border-lead-200">
                                {p.status === 'pendiente' ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => onEdit(p)}
                                            disabled={busy}
                                            className="flex-1 rounded-lg bg-brand-100 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onCancel(p)}
                                            disabled={busy}
                                            className="flex-1 rounded-lg bg-accent-100 px-3 py-2 text-xs font-semibold text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                ) : p.status === 'entregado' || p.status === 'parcial' ? (
                                    <button
                                        type="button"
                                        onClick={() => downloadVoucher(p.id)}
                                        disabled={busy}
                                        className="flex-1 rounded-lg bg-brand-100 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                                    >
                                        Comprobante
                                    </button>
                                ) : (
                                    <span className="text-xs text-lead-400 italic">Sin acciones disponibles</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="hidden md:block overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
                        <tr>
                            <th className="px-4 py-4 text-left font-semibold">Negocio</th>
                            <th className="px-4 py-4 text-left font-semibold">Sucursal</th>
                            <th className="px-4 py-4 text-left font-semibold">Prevendedor</th>
                            <th className="px-4 py-4 text-left font-semibold">Transportista</th>
                            <th className="px-4 py-4 text-left font-semibold">Estado</th>
                            <th className="px-4 py-4 text-left font-semibold">Fecha de Entrega</th>
                            <th className="px-4 py-4 text-left font-semibold">Total</th>
                            <th className="w-40 px-4 py-4 text-center font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lead-200">
                        {presales.map(p => (
                            <tr key={p.id} className="transition-colors hover:bg-white">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-lead-800">
                                        {p.businessName ? p.businessName : `${p.clientLastName}, ${p.clientName}`}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-lead-600">{p.branchName || '—'}</td>
                                <td className="px-4 py-3 text-lead-600">{p.presellerName || 'VENTA DIRECTA'}</td>
                                <td className="px-4 py-3 text-lead-600 text-xs">
                                    {!usersLoading ? (
                                        <PresalesDistributorSelector
                                            users={distributorUsers}
                                            initialUser={p.distributorId ? userMap.get(p.distributorId) ?? null : null}
                                            onSelect={user => assignDistributor(p.id, user.id)}
                                            status={p.status}
                                        />
                                    ) : (
                                        <span className="text-xs text-lead-400 italic">Cargando...</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-xs">
                                    <StatusBadge status={p.status} />
                                </td>
                                <td className="px-4 py-3 text-lead-600 text-xs">{p.deliveryDate || '—'}</td>
                                <td className="px-4 py-3 text-lead-600 text-xs">{'Bs. ' + p.total || '—'}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {p.status === 'pendiente' ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(p)}
                                                    disabled={isBusy(p.id)}
                                                    className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onCancel(p)}
                                                    disabled={isBusy(p.id)}
                                                    className="rounded px-3 py-1.5 font-medium transition disabled:opacity-50 bg-accent-100 text-accent-700 hover:bg-accent-200"
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : p.status === 'entregado' || p.status === 'parcial' ? (
                                            <button
                                                type="button"
                                                onClick={() => downloadVoucher(p.id)}
                                                disabled={isBusy(p.id)}
                                                className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                                            >
                                                Comprobante
                                            </button>
                                        ) : (
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