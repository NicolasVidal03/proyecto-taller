import React, { useState } from 'react';
import { Area, Route, User } from '@domain/entities';

type RoutesTableProps = {
    routes: Route[];
    users: User[];
    areas: Area[];
    busyId?: number | null;
};

const RoutesTable: React.FC<RoutesTableProps> = ({
    routes,
    users,
    areas,
    busyId
}) => {

    const [filterDate, setFilterDate] = useState('');

    const filteredRoutes = [...routes]
        .filter(r => !filterDate || r.assignedDate === filterDate)
        .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());
    const isEmpty = filteredRoutes.length === 0;
    const userMap = new Map(users.map(u => [u.id, u.names + ' ' + u.lastName]));
    const areaMap = new Map(areas.map(a => [a.id, a.name]));
    const isBusy = (id: number) => busyId != null && busyId === id;


    return (
        <div className="card shadow-xl ring-1 ring-black/5">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                <div>
                    <h3 className="text-xl font-bold text-brand-900">Rutas Asignadas</h3>
                    <p className="text-sm text-lead-500">{routes.length} ruta(s) asignadas.</p>
                </div>
                <div className='flex flex col gap-2 justify-center'>
                    {filterDate && (
                        <button
                            type="button"
                            onClick={() => setFilterDate('')}
                            className="text-xs text-lead-500 hover:text-lead-700"
                        >
                            Limpiar
                        </button>
                    )}
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="mt-1 block rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                    />
                </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
                        <tr>
                            <th className="px-4 py-4 text-left font-semibold">ID</th>
                            <th className="px-4 py-4 text-left font-semibold">Prevendedor</th>
                            <th className="px-4 py-4 text-left font-semibold">Area</th>
                            <th className="px-4 py-4 text-left font-semibold">Fecha</th>
                            <th className="w-40 px-4 py-4 text-center align-middle font-semibold"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lead-200">
                        {isEmpty ? (
                            <tr>
                                <td className="px-4 py-6 text-center text-sm text-lead-600" colSpan={7}>
                                    No hay rutas asignadas para mostrar.
                                </td>
                            </tr>
                        ) : filteredRoutes.map(r => (
                                <tr key={r.id} className="transition-colors hover:bg-white">
                                    <td className="px-4 py-3">
                                        {r.id || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-lead-600">
                                        {userMap.get(r.assignedIdUser) || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-lead-600">
                                        {areaMap.get(r.assignedIdArea) || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-lead-600 text-xs">
                                        {r.assignedDate || '—'}
                                    </td>

                                    {/* Estado removed: do not display product.state column */}
                                    <td className="px-4 py-3 text-center align-middle">
                                        <div className="flex items-center justify-center gap-2">
                                        {/* <button
                                            type="button"
                                            onClick={() => onView && onView(product)}
                                            className="rounded bg-lead-200 px-3 py-1.5 font-medium text-lead-800 transition hover:bg-lead-300 disabled:opacity-50"
                                        >
                                            Ver
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onEdit(product)}
                                            className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                                            disabled={isBusy(product.id)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeactivate(product)}
                                            className={`rounded px-3 py-1.5 font-medium transition disabled:opacity-50 bg-accent-100 text-accent-700 hover:bg-accent-200`}
                                            disabled={isBusy(product.id)}
                                        >
                                            Eliminar
                                        </button> */}
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

export default RoutesTable;
