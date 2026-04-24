import React, { useState } from 'react';
import { Area, Route, User } from '@domain/entities';

type RoutesTableProps = {
    routes: Route[];
    users: User[];
    areas: Area[];
    busyId?: number | null;
    onEdit: (route: Route) => void;
};

/** Devuelve true si la fecha de la ruta es hoy o en el futuro */
function isEditableDate(assignedDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Normalizar a YYYY-MM-DD para evitar desfase por timezone
    const routeDate = new Date(String(assignedDate).slice(0, 10) + 'T00:00:00');
    return routeDate >= today;
}

const RoutesTable: React.FC<RoutesTableProps> = ({
    routes,
    users,
    areas,
    busyId,
    onEdit,
}) => {
    const [filterDate, setFilterDate] = useState('');

    const filteredRoutes = [...routes]
        .filter(r => !filterDate || String(r.assignedDate).slice(0, 10) === filterDate)
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
                <div className="flex flex-col gap-2 justify-center">
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
                            <th className="px-4 py-4 text-left font-semibold">Área</th>
                            <th className="px-4 py-4 text-left font-semibold">Fecha</th>
                            <th className="w-40 px-4 py-4 text-center font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lead-200">
                        {isEmpty ? (
                            <tr>
                                <td className="px-4 py-6 text-center text-sm text-lead-600" colSpan={5}>
                                    No hay rutas asignadas para mostrar.
                                </td>
                            </tr>
                        ) : filteredRoutes.map(r => {
                            const editable = isEditableDate(r.assignedDate);
                            const busy = isBusy(r.id);

                            return (
                                <tr key={r.id} className="transition-colors hover:bg-white">
                                    <td className="px-4 py-3">{r.id || '—'}</td>
                                    <td className="px-4 py-3 text-lead-600">
                                        {userMap.get(r.assignedIdUser) || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-lead-600">
                                        {areaMap.get(r.assignedIdArea) || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-lead-600 text-xs">
                                        {String(r.assignedDate).slice(0, 10) || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-center align-middle">
                                        <div className="flex items-center justify-center gap-2">
                                            {editable ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(r)}
                                                    disabled={busy}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Editar
                                                </button>
                                            ) : (
                                                <span
                                                    title="Solo se pueden editar rutas con fecha igual o posterior a hoy"
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400 cursor-not-allowed select-none"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Editar
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoutesTable;