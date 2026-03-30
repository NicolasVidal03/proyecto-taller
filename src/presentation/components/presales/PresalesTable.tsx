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
    assignDistributor: (presaleId: number, distributorId: number) => Promise<Presale | null>;
};

const PresalesTable: React.FC<PresalesTableProps> = ({
    presales,
    assignDistributor,
    onEdit,
    onCancel,
    busyId,
}) => {
    const isBusy = (id: number) => busyId != null && busyId === id;
    const toast = useToast();

    const { users, isLoading: usersLoading, error: usersError, fetchUsers, clearError: clearUsersError } = useUsers();

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    useEffect(() => {
        if (usersError) {
            toast.error(usersError.message);
            clearUsersError();
        }
    }, [usersError, toast, clearUsersError]);

    const distributorUsers = useMemo(() => users.filter(u => u.role?.toLowerCase() === 'transportista'), [users]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const isEmpty = presales.length === 0;

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
                        <tr>
                            <th className="px-4 py-4 text-left font-semibold">Negocio</th>
                            <th className="px-4 py-4 text-left font-semibold">Sucursal</th>
                            <th className="px-4 py-4 text-left font-semibold">Prevendedor</th>
                            <th className="px-4 py-4 text-left font-semibold">Transportista</th>
                            <th className="px-4 py-4 text-left font-semibold">Estado</th>
                            <th className="px-4 py-4 text-left font-semibold">Fecha de Entrega</th>
                            <th className="px-4 py-4 text-left font-semibold">Total Bs.</th>
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
                        ) : presales.map(p => (
                            <tr key={p.id} className="transition-colors hover:bg-white">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-lead-800">
                                        {p.businessName ? p.businessName : `${p.clientLastName}, ${p.clientName}`}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-lead-600">{p.branchName || '—'}</td>
                                <td className="px-4 py-3 text-lead-600">{p.presellerName || '—'}</td>
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
                                    {(() => {
                                        const statusStyles: Record<string, string> = {
                                            pendiente: 'bg-yellow-100 text-yellow-700',
                                            asignado: 'bg-blue-100 text-blue-700',
                                            entregado: 'bg-green-100 text-green-700',
                                            parcial: 'bg-orange-100 text-orange-700',
                                            cancelado: 'bg-red-100 text-red-700',
                                        };
                                        const style = statusStyles[p.status.toLowerCase()] ?? 'bg-lead-100 text-lead-600';
                                        return (
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold uppercase tracking-wide ${style}`}>
                                                {p.status}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className="px-4 py-3 text-lead-600 text-xs">{p.deliveryDate || '—'}</td>
                                <td className="px-4 py-3 text-lead-600 text-xs">{p.total || '—'}</td>
                                <td className="px-4 py-3 text-center align-middle">
                                    <div className="flex items-center justify-center gap-2">
                                        {p.status === 'pendiente' ? (
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
