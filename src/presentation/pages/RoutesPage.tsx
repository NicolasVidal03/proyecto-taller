import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useRoutes } from '../hooks/useRoutes';
import { useUsers } from '../hooks/useUsers';
import { useAreasSimple } from '../hooks/useAreas';
import GenerateRouteModal from '../components/routes/GenerateRouteModal';
import { ToastContainer, useToast } from '../components/shared/Toast';
import RoutesTable from '@presentation/components/routes/RoutesTable';
import { useConfirmDialog } from '@presentation/hooks';
import { Route } from '@domain/entities';

export const RoutesPage: React.FC = () => {
  const { routes, isLoading: routesLoading, error: routesError, fetchRoutes, createRoute, updateRoute, clearError } = useRoutes();
  const { users, isLoading: usersLoading, fetchUsers } = useUsers();
  const { areas, isLoading: areasLoading, fetchAreas } = useAreasSimple();

  const toast = useToast();
  const confirm = useConfirmDialog<Route>();

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState<Route | null>(null);
  const [lastRouteInfo, setLastRouteInfo] = useState<{ userStr: string, areaStr: string, date: string } | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchAreas(), fetchRoutes()]);
  }, [fetchUsers, fetchAreas, fetchRoutes]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (routesError) { toast.error(routesError.message); clearError(); }
  }, [routesError, toast, clearError]);

  const handleCloseModal = () => { setModalOpen(false); setRouteToEdit(null); };

  const handleEditRoute = (route: Route) => { setRouteToEdit(route); setModalOpen(true); };

  const handleGenerateRoute = async (data: { assignedIdUser: number; assignedIdArea: number; assignedDate: string }) => {
    setSubmitting(true);
    try {
      const result = await createRoute({
        assignedIdUser: data.assignedIdUser,
        assignedIdArea: data.assignedIdArea,
        assignedDate: data.assignedDate,
      });
      if (result) {
        toast.success('¡Ruta generada exitosamente!');
        const user = users.find(u => u.id === data.assignedIdUser);
        const area = areas.find(a => a.id === data.assignedIdArea);
        const userStr = user
          ? `${user.lastName}${user.secondLastName ? ` ${user.secondLastName}` : ''}, ${user.names}`
          : `Usuario #${data.assignedIdUser}`;
        setLastRouteInfo({ userStr, areaStr: area ? area.name : `Área #${data.assignedIdArea}`, date: data.assignedDate });
        handleCloseModal();
      }
    } catch {
      toast.error('Error al generar la ruta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRoute = async (data: { assignedIdUser: number; assignedIdArea: number; assignedDate: string }) => {
    if (!routeToEdit) return;
    setSubmitting(true);
    try {
      const result = await updateRoute(routeToEdit.id, {
        assignedIdUser: data.assignedIdUser,
        assignedIdArea: data.assignedIdArea,
        assignedDate: data.assignedDate,
      });
      if (result) { toast.success('¡Ruta actualizada exitosamente!'); handleCloseModal(); }
      else toast.error('No se pudo actualizar la ruta');
    } catch {
      toast.error('Error al actualizar la ruta');
    } finally {
      setSubmitting(false);
    }
  };

  const sortedUsers = useMemo(() => [...users].sort((a, b) => {
    const aLast = (a.lastName || '').toLowerCase();
    const bLast = (b.lastName || '').toLowerCase();
    if (aLast !== bLast) return aLast.localeCompare(bLast);
    const aSecond = (a.secondLastName || '').toLowerCase();
    const bSecond = (b.secondLastName || '').toLowerCase();
    if (aSecond !== bSecond) return aSecond.localeCompare(bSecond);
    return (a.names || '').toLowerCase().localeCompare((b.names || '').toLowerCase());
  }), [users]);

  const sortedAreas = useMemo(() =>
    [...areas].sort((a, b) => (a.name || '').localeCompare(b.name || '')), [areas]);

  const presellersCount = users.filter(u => u.role === 'prevendedor').length;

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-6 px-3 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-12">

          <section className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(135deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,0) 45%)' }}
            />
            <div className="relative grid gap-6 px-5 py-7 sm:px-8 sm:py-10 md:px-12 lg:grid-cols-[2fr,1.2fr] lg:items-start">

              <div className="flex flex-col gap-5">

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[0.6rem] uppercase tracking-[0.45em] text-white/70">Gestión de Distribución</p>
                    <h2 className="text-xl font-semibold leading-tight sm:text-2xl md:text-3xl lg:text-4xl">
                      Rutas de Prevendedores
                    </h2>
                    <p className="text-sm text-white/80 hidden sm:block">
                      Asigna áreas geográficas a tus prevendedores para optimizar la cobertura de ventas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatsOpen(o => !o)}
                    className="lg:hidden mt-1 shrink-0 flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur transition hover:bg-white/20"
                  >
                    <span>{statsOpen ? 'Ocultar' : 'Ver'} stats</span>
                    <svg
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${statsOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white text-brand-700 rounded-xl hover:bg-brand-50 transition-colors shadow-lg font-bold text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva ruta
                  </button>
                  <button
                    onClick={() => setInfoOpen(prev => !prev)}
                    className="flex items-center gap-2 px-4 py-2 sm:px-4 sm:py-3 bg-white/20 text-white border border-white/30 rounded-xl hover:bg-white/30 transition-colors font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d={infoOpen ? "M6 18L18 6M6 6l12 12" : "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}
                      />
                    </svg>
                    {infoOpen ? 'Cerrar info' : '¿Cómo funciona?'}
                  </button>
                </div>

                {statsOpen && (
                  <div className="lg:hidden">
                    <div className="relative rounded-2xl border border-white/20 bg-white/10 px-5 py-6 backdrop-blur space-y-4">
                      <p className="text-[0.6rem] uppercase tracking-[0.35em] text-white/60">Resumen</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-brand-900 to-brand-600 px-4 py-4 shadow-lg">
                          <p className="text-xs uppercase tracking-wide text-white/80">Prevendedores</p>
                          <p className="mt-1.5 text-3xl font-semibold text-white">{presellersCount}</p>
                        </div>
                        <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-4">
                          <p className="text-xs uppercase tracking-wide text-white/80">Áreas</p>
                          <p className="mt-1.5 text-3xl font-semibold text-white">{areas.length}</p>
                        </div>
                        <div className="col-span-2 rounded-xl bg-white/10 border border-white/20 px-4 py-4">
                          <p className="text-xs uppercase tracking-wide text-white/80">Rutas asignadas</p>
                          <p className="mt-1.5 text-3xl font-semibold text-white">{routes.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                  <div className="relative space-y-4 rounded-[2rem] border border-white/20 bg-white/10 px-7 py-8 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/60">Resumen</p>
                    <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-600 px-4 py-5 shadow-lg">
                      <p className="text-xs uppercase tracking-wide text-white/80">Prevendedores activos</p>
                      <p className="mt-2 text-4xl font-semibold text-white">{presellersCount}</p>
                    </div>
                    <div className="space-y-2 rounded-xl border border-white/20 bg-white/10 p-4 text-sm text-white/80">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/60">Catálogo</p>
                      <div className="flex items-center justify-between">
                        <span>Áreas disponibles</span>
                        <span className="font-semibold text-white">{areas.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Rutas asignadas</span>
                        <span className="font-semibold text-white">{routes.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {infoOpen && (
              <div className="relative px-5 pb-7 sm:px-8 md:px-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-2">¿Cómo funciona?</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      El sistema permite asignar vendedores a áreas geográficas específicas para fechas determinadas,
                      asegurando que todas las zonas sean cubiertas eficientemente.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                      {['Selecciona un prevendedor de la lista.', 'Elige el área geográfica correspondiente.', 'Establece la fecha de visita.'].map(item => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="w-2 h-2 shrink-0 rounded-full bg-brand-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 mb-2">Gestión de Áreas</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Para asignar rutas, primero debes tener áreas definidas en el sistema.
                      Puedes gestionarlas desde la sección de "Áreas".
                    </p>
                    <div className="mt-4">
                      <a href="/areas" className="text-brand-600 font-medium text-sm hover:underline flex items-center gap-1">
                        Ir a gestión de Áreas
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {lastRouteInfo && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4 shadow-sm">
              <div className="bg-emerald-100 p-2.5 sm:p-3 rounded-full shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-emerald-800">Última Ruta Generada</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Has asignado a <strong>{lastRouteInfo.userStr}</strong> el área <strong>{lastRouteInfo.areaStr}</strong> para el <strong>{lastRouteInfo.date.split('-').reverse().join('/')}</strong>.
                </p>
              </div>
            </div>
          )}

          <section>
            <RoutesTable
              routes={routes}
              users={users}
              areas={areas}
              busyId={confirm.busyId}
              onEdit={handleEditRoute}
            />
          </section>

        </div>
      </div>

      <GenerateRouteModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={routeToEdit ? handleUpdateRoute : handleGenerateRoute}
        users={sortedUsers}
        areas={sortedAreas}
        isSubmitting={submitting}
        routeToEdit={routeToEdit}
      />

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};

export default RoutesPage;