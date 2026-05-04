import React, { useState, useMemo } from 'react';
import { Area, Route, User } from '@domain/entities';
import { Pagination } from '@presentation/components/shared/Pagination';

type RoutesTableProps = {
    routes: Route[];
    users: User[];
    areas: Area[];
    busyId?: number | null;
    onEdit: (route: Route) => void;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function isEditableDate(assignedDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const routeDate = new Date(String(assignedDate).slice(0, 10) + 'T00:00:00');
    return routeDate >= today;
}

const RoutesTable: React.FC<RoutesTableProps> = ({ routes, users, areas, busyId, onEdit }) => {
    const [filterDate, setFilterDate] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

    const userMap = useMemo(() => new Map(users.map(u => [u.id, `${u.names} ${u.lastName}`])), [users]);
    const areaMap = useMemo(() => new Map(areas.map(a => [a.id, a.name])), [areas]);
    const isBusy = (id: number) => busyId != null && busyId === id;

    const filteredRoutes = useMemo(() => [...routes]
        .filter(r => !filterDate || String(r.assignedDate).slice(0, 10) === filterDate)
        .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime()),
        [routes, filterDate]);

    const handleFilterChange = (value: string) => { setFilterDate(value); setPage(1); };
    const handlePageSizeChange = (value: number) => { setPageSize(value); setPage(1); };

    const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginatedRoutes = filteredRoutes.slice((safePage - 1) * pageSize, safePage * pageSize);
    const isEmpty = filteredRoutes.length === 0;

    const EditButton: React.FC<{ route: Route }> = ({ route }) => {
        const editable = isEditableDate(route.assignedDate);
        const busy = isBusy(route.id);
        return editable ? (
            <button
                type="button"
                onClick={() => onEdit(route)}
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
        );
    };

    return (
        <div className="card shadow-xl ring-1 ring-black/5">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-lead-100 pb-4">
                <div>
                    <h3 className="text-lg font-bold text-brand-900 sm:text-xl">Rutas Asignadas</h3>
                    <p className="text-sm text-lead-500">
                        {filteredRoutes.length} ruta(s){filterDate ? ' para la fecha seleccionada' : ' en total'}.
                    </p>
                </div>
                <div className="flex flex-col gap-1.5 sm:items-end">
                    {filterDate && (
                        <button type="button" onClick={() => handleFilterChange('')} className="text-xs text-lead-500 hover:text-lead-700 self-end">
                            Limpiar filtro
                        </button>
                    )}
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => handleFilterChange(e.target.value)}
                        className="block rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 w-full sm:w-auto"
                    />
                </div>
            </div>

            {!isEmpty && (
                <div className="mb-3 flex justify-end">
                    <select
                        value={pageSize}
                        onChange={e => handlePageSizeChange(Number(e.target.value))}
                        className="rounded-lg border border-lead-300 bg-white px-3 py-1.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none"
                    >
                        {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} por página</option>)}
                    </select>
                </div>
            )}

            <div className="flex flex-col gap-3 md:hidden">
                {isEmpty ? (
                    <p className="py-8 text-center text-sm text-lead-500">No hay rutas para mostrar.</p>
                ) : paginatedRoutes.map(r => (
                    <div key={r.id} className="rounded-xl border border-lead-200 bg-lead-50 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-semibold text-brand-900 truncate">
                                    {userMap.get(r.assignedIdUser) || '—'}
                                </p>
                                <p className="text-xs text-lead-500 mt-0.5">
                                    {areaMap.get(r.assignedIdArea) || '—'}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-xs text-lead-400 uppercase tracking-wide">Fecha</p>
                                <p className="text-sm font-semibold text-lead-800">
                                    {String(r.assignedDate).slice(0, 10)}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-lead-100 pt-3">
                            <span className="text-xs text-lead-400">ID #{r.id || '—'}</span>
                            <EditButton route={r} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
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
                                <td className="px-4 py-10 text-center text-sm text-lead-500" colSpan={5}>
                                    No hay rutas para mostrar.
                                </td>
                            </tr>
                        ) : paginatedRoutes.map(r => (
                            <tr key={r.id} className="transition-colors hover:bg-white">
                                <td className="px-4 py-3">{r.id || '—'}</td>
                                <td className="px-4 py-3 text-lead-600">{userMap.get(r.assignedIdUser) || '—'}</td>
                                <td className="px-4 py-3 text-lead-600">{areaMap.get(r.assignedIdArea) || '—'}</td>
                                <td className="px-4 py-3 text-lead-600 text-xs">{String(r.assignedDate).slice(0, 10) || '—'}</td>
                                <td className="px-4 py-3 text-center align-middle">
                                    <div className="flex items-center justify-center gap-2">
                                        <EditButton route={r} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={filteredRoutes.length}
                itemsPerPage={pageSize}
                onPageChange={setPage}
                className="mt-5"
            />
        </div>
    );
};

export default RoutesTable;