import { Presale } from "@domain/entities";

type PresalesTableProps = {
    presales: Presale[];
    branchMap: Map<number, string>;
    // onEdit: (product: Presale) => void;
    // onDeactivate: (product: Presale) => void;
    // onView?: (product: Presale) => void;
    busyId?: number | null;
};

const PresalesTable: React.FC<PresalesTableProps> = ({
    presales,
    branchMap,
    // onEdit,
    // onDeactivate,
    // onView,
    busyId
}) => {
    const isEmpty = presales.length === 0;
    const isBusy = (id: number) => busyId != null && busyId === id;

    return (
        <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
            <table className="min-w-full text-sm">
                <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
                    <tr>
                        <th className="px-4 py-4 text-left font-semibold">Cliente</th>
                        <th className="px-4 py-4 text-left font-semibold">Sucursal</th>
                        <th className="px-4 py-4 text-left font-semibold">Prevendedor</th>
                        <th className="px-4 py-4 text-left font-semibold">Regular</th>
                        <th className="px-4 py-4 text-left font-semibold">Estado</th>
                        <th className="px-4 py-4 text-left font-semibold">Fecha de Entrega</th>
                        <th className="px-4 py-4 text-left font-semibold">Total</th>
                        <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-lead-200">
                    {isEmpty ? (
                        <tr>
                            <td className="px-4 py-6 text-center text-sm text-lead-600" colSpan={7}>
                                No hay preventas para mostrar.
                            </td>
                        </tr>
                    ) : presales.map(p => (
                        <tr key={p.id} className="transition-colors hover:bg-white">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="font-medium text-lead-800">{p.clientLastName}, {p.clientName}</p>
                                        {/* {(p. || (product.presentationId && presentationMap.get(product.presentationId))) && (
                                            <p className="text-xs text-lead-500">
                                                {product.presentationName || (product.presentationId ? presentationMap.get(product.presentationId) : '')}
                                            </p>
                                        )} */}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-lead-600">
                                {p.branchName || '—'}
                            </td>
                            <td className="px-4 py-3 text-lead-600">
                                {p.presellerName || '—'}
                            </td>
                            <td className="px-4 py-3 text-lead-600 text-xs">
                                {'—'}
                            </td>
                            <td className="px-4 py-3 text-lead-600 text-xs">
                                {p.status || '—'}
                            </td>
                            <td className="px-4 py-3 text-lead-600 text-xs">
                                {p.deliveryDate || '—'}
                            </td>
                            <td className="px-4 py-3 text-lead-600 text-xs">
                                {p.total || '—'}
                            </td>
                            {/* Estado removed: do not display product.state column */}
                            <td className="px-4 py-3 text-center align-middle">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        // onClick={() => onView && onView(p)}
                                        className="rounded bg-lead-200 px-3 py-1.5 font-medium text-lead-800 transition hover:bg-lead-300 disabled:opacity-50"
                                    >
                                        Ver
                                    </button>
                                    <button
                                        type="button"
                                        // onClick={() => onEdit(p)}
                                        className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                                        disabled={isBusy(p.id)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        // onClick={() => onDeactivate(p)}
                                        className={`rounded px-3 py-1.5 font-medium transition disabled:opacity-50 bg-accent-100 text-accent-700 hover:bg-accent-200`}
                                        disabled={isBusy(p.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};

export default PresalesTable