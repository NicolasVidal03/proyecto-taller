/**
 * RoutesPage - Página de gestión de rutas de prevendedores
 */
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useRoutes } from '../hooks/useRoutes';
import { useUsers } from '../hooks/useUsers';
import { useAreasSimple } from '../hooks/useAreas';
import GenerateRouteModal from '../components/routes/GenerateRouteModal';
import { ToastContainer, useToast } from '../components/shared/Toast';

export const RoutesPage: React.FC = () => {
  const { isLoading: routesLoading, error: routesError, createRoute, clearError } = useRoutes();
  const { users, isLoading: usersLoading, fetchUsers } = useUsers();
  const { areas, isLoading: areasLoading, fetchAreas } = useAreasSimple();
  
  const toast = useToast();

  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastRouteInfo, setLastRouteInfo] = useState<{userStr: string, areaStr: string, date: string} | null>(null);

  const loadData = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchAreas()]);
  }, [fetchUsers, fetchAreas]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  
  useEffect(() => {
    if (routesError) {
      toast.error(routesError.message);
      clearError();
    }
  }, [routesError, toast, clearError]);

 
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
        
        setLastRouteInfo({
          userStr: user ? `${user.names} ${user.lastName}` : `Usuario #${data.assignedIdUser}`,
          areaStr: area ? area.name : `Área #${data.assignedIdArea}`,
          date: data.assignedDate
        });
        
        setModalOpen(false);
      }
    } catch (err) {
      toast.error('Error al generar la ruta');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = routesLoading || usersLoading || areasLoading;

  return (
    <div className="relative overflow-hidden min-h-screen bg-gray-50/50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.08),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.05),transparent_55%)] pointer-events-none" />
      <div className="relative space-y-8 px-6 py-8 lg:px-10 lg:py-12">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
          />
          <div className="relative z-10 px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.45em] text-white/70 mb-2">Gestión de Distribución</p>
                  <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                    Rutas de Prevendedores
                  </h1>
                  <p className="text-white/80 text-lg mt-2 max-w-xl">
                    Asigna áreas geográficas a tus prevendedores para optimizar la cobertura de ventas.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="rounded-2xl bg-white/10 border border-white/20 px-5 py-3 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wide text-white/70">Prevendedores Activos</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {users.filter(u => u.role === 'prevendedor').length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/20 px-5 py-3 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wide text-white/70">Áreas Disponibles</p>
                    <p className="mt-1 text-2xl font-bold text-white">{areas.length}</p>
                  </div>
                </div>
              </div>
              <div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-brand-700 rounded-xl hover:bg-brand-50 transition-colors shadow-lg font-bold transform hover:scale-105 duration-200"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
        {lastRouteInfo && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm animate-fade-in">
            <div className="bg-emerald-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-800">Última Ruta Generada</h3>
              <p className="text-emerald-700 mt-1">
                Has asignado al prevendedor <strong>{lastRouteInfo.userStr}</strong> el área <strong>{lastRouteInfo.areaStr}</strong> para el día <strong>{new Date(lastRouteInfo.date).toLocaleDateString()}</strong>.
              </p>
            </div>
          </div>
        )}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Cómo funciona?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              El sistema permite asignar vendedores ("prevendedores") a áreas geográficas específicas para fechas determinadas.
              Esto ayuda a organizar el trabajo de campo y asegurar que todas las zonas sean cubiertas eficientemente.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                Selecciona un prevendedor de la lista.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                Elige el área geográfica correspondiente.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                Establece la fecha de visita.
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Gestión de Áreas</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Recuerda que para asignar rutas, primero debes tener áreas definidas en el sistema. Puedes gestionar las áreas desde
              la sección de "Áreas".
            </p>
            <div className="mt-6">
              <a href="/areas" className="text-brand-600 font-medium text-sm hover:underline flex items-center gap-1">
                Ir a gestión de Áreas
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Modal */}
      <GenerateRouteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleGenerateRoute}
        users={users}
        areas={areas}
        isSubmitting={submitting}
      />

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </div>
  );
};

export default RoutesPage;
