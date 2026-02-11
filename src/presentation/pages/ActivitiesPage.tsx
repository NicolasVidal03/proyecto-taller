import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useActivities } from '../hooks/useActivities';
import { useUsers } from '../hooks/useUsers';
import ActivityMap from '../components/activities/ActivityMap';
import Loader from '../components/shared/Loader';
import { ToastContainer, useToast } from '../components/shared/Toast';
import { User } from '../../domain/entities/User';
import { ActivityWork } from '../../domain/entities/ActivityWork';

// Formatear fecha a YYYY-MM-DD
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Obtener fecha de ayer
const getYesterday = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
};

// Obtener fecha de hoy
const getToday = (): Date => {
  return new Date();
};

export const ActivitiesPage: React.FC = () => {
  const toast = useToast();
  
  const {
    activities,
    isLoading: activitiesLoading,
    error: activitiesError,
    fetchActivities,
    clearActivities,
    clearError: clearActivitiesError,
  } = useActivities();

  const {
    users,
    isLoading: usersLoading,
    error: usersError,
    fetchUsers,
    clearError: clearUsersError,
  } = useUsers();

  // Estado del filtro
  const [selectedDate, setSelectedDate] = useState<string>(formatDateForInput(getYesterday()));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityWork | null>(null);

  // Cargar usuarios al montar
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Manejar errores
  useEffect(() => {
    if (activitiesError) {
      toast.error(activitiesError.message);
      clearActivitiesError();
    }
  }, [activitiesError, toast, clearActivitiesError]);

  useEffect(() => {
    if (usersError) {
      toast.error(usersError.message);
      clearUsersError();
    }
  }, [usersError, toast, clearUsersError]);

  // Filtrar usuarios prevendedores para búsqueda
  const prevendedorUsers = useMemo(() => {
    return users.filter(u => 
      u.role?.toLowerCase() === 'prevendedor' || 
      u.role?.toLowerCase() === 'vendedor'
    );
  }, [users]);

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return prevendedorUsers;
    return prevendedorUsers.filter(u => {
      const fullName = `${u.names} ${u.lastName} ${u.secondLastName}`.toLowerCase();
      return fullName.includes(term) || u.userName.toLowerCase().includes(term);
    });
  }, [prevendedorUsers, searchTerm]);

  // Usuario seleccionado
  const selectedUser = useMemo(() => {
    return users.find(u => u.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  // Manejar selección de usuario
  const handleSelectUser = useCallback((user: User) => {
    setSelectedUserId(user.id);
    setSearchTerm(`${user.names} ${user.lastName}`);
    setShowUserDropdown(false);
  }, []);

  // Buscar actividades
  const handleSearch = useCallback(() => {
    if (!selectedUserId) {
      toast.error('Selecciona un prevendedor');
      return;
    }
    if (!selectedDate) {
      toast.error('Selecciona una fecha');
      return;
    }
    
    // Validar que la fecha no sea futura
    const selected = new Date(selectedDate);
    const today = getToday();
    today.setHours(0, 0, 0, 0);
    
    if (selected > today) {
      toast.error('No puedes ver actividades de fechas futuras');
      return;
    }

    fetchActivities(selectedUserId, selectedDate);
  }, [selectedUserId, selectedDate, fetchActivities, toast]);

  // Limpiar búsqueda
  const handleClear = useCallback(() => {
    setSelectedUserId(null);
    setSearchTerm('');
    setSelectedDate(formatDateForInput(getYesterday()));
    clearActivities();
    setSelectedActivity(null);
  }, [clearActivities]);

  // Manejar clic en marcador del mapa
  const handleMarkerClick = useCallback((activity: ActivityWork) => {
    setSelectedActivity(activity);
  }, []);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = activities.length;
    const visited = activities.filter(a => a.activity.action && a.activity.action.toLowerCase() !== 'rejected').length;
    const sales = activities.filter(a => a.activity.action?.toLowerCase() === 'sold' || a.activity.action?.toLowerCase() === 'venta').length;
    const rejected = activities.filter(a => a.activity.action?.toLowerCase() === 'rejected' || a.activity.action?.toLowerCase() === 'rechazado').length;
    const pending = activities.filter(a => !a.activity.action).length;
    
    return { total, visited, sales, rejected, pending };
  }, [activities]);

  const isLoading = activitiesLoading || usersLoading;

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-8 px-6 py-8 lg:px-10 lg:py-12">
          
          {/* Header */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)',
              }}
            />
            <div className="grid gap-8 px-8 py-10 md:px-12 lg:grid-cols-[2fr,1.2fr]">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Seguimiento</p>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">Actividades de Prevendedores</h2>
                <p className="text-sm text-white/80 max-w-lg">
                  Visualiza la actividad diaria de tus prevendedores en el mapa. 
                  Selecciona una fecha pasada y un usuario para ver sus visitas, ventas y rechazos.
                </p>
              </div>
              
              {/* Stats Card */}
              {activities.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                  <div className="relative space-y-4 rounded-[2rem] border border-white/20 bg-white/10 px-6 py-6 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/60">Resumen del día</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/10 px-4 py-3">
                        <p className="text-xs text-white/70">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                      <div className="rounded-xl bg-green-500/30 px-4 py-3">
                        <p className="text-xs text-white/70">Visitados</p>
                        <p className="text-2xl font-bold">{stats.visited}</p>
                      </div>
                      <div className="rounded-xl bg-blue-500/30 px-4 py-3">
                        <p className="text-xs text-white/70">Ventas</p>
                        <p className="text-2xl font-bold">{stats.sales}</p>
                      </div>
                      <div className="rounded-xl bg-red-500/30 px-4 py-3">
                        <p className="text-xs text-white/70">Rechazos</p>
                        <p className="text-2xl font-bold">{stats.rejected}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Filtros */}
          <section className="card shadow-xl ring-1 ring-black/5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              {/* Filtro de fecha */}
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-lead-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  max={formatDateForInput(getToday())}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-plain w-full"
                />
              </div>

              {/* Búsqueda de usuario */}
              <div className="flex-1 max-w-md relative">
                <label className="block text-sm font-medium text-lead-700 mb-2">
                  Prevendedor
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowUserDropdown(true);
                    if (!e.target.value) setSelectedUserId(null);
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  placeholder="Buscar por nombre..."
                  className="input-plain w-full"
                />
                
                {/* Dropdown de usuarios */}
                {showUserDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl bg-white border border-lead-200 shadow-lg">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className={`w-full text-left px-4 py-3 hover:bg-lead-50 transition-colors border-b border-lead-100 last:border-b-0 ${
                          selectedUserId === user.id ? 'bg-brand-50 text-brand-700' : ''
                        }`}
                      >
                        <p className="font-medium text-sm text-lead-800">
                          {user.names} {user.lastName} {user.secondLastName}
                        </p>
                        <p className="text-xs text-lead-500">@{user.userName} • {user.role}</p>
                      </button>
                    ))}
                  </div>
                )}
                
                {showUserDropdown && filteredUsers.length === 0 && searchTerm && (
                  <div className="absolute z-50 mt-1 w-full rounded-xl bg-white border border-lead-200 shadow-lg p-4">
                    <p className="text-sm text-lead-500 text-center">No se encontraron prevendedores</p>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isLoading || !selectedUserId}
                  className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {activitiesLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Buscar
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleClear}
                  className="btn-outline"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Usuario seleccionado info */}
            {selectedUser && (
              <div className="mt-4 p-3 rounded-xl bg-brand-50 border border-brand-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                  {selectedUser.names.charAt(0)}{selectedUser.lastName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-brand-800">
                    {selectedUser.names} {selectedUser.lastName} {selectedUser.secondLastName}
                  </p>
                  <p className="text-xs text-brand-600">
                    @{selectedUser.userName} • {selectedUser.role}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Mapa */}
          <section className="card shadow-xl ring-1 ring-black/5 p-0 overflow-hidden">
            {isLoading ? (
              <div className="h-[500px] flex items-center justify-center">
                <Loader />
              </div>
            ) : activities.length > 0 ? (
              <ActivityMap
                activities={activities}
                height="600px"
                onMarkerClick={handleMarkerClick}
              />
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-lead-500">
                <svg className="w-16 h-16 mb-4 text-lead-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-lg font-medium">No hay actividades para mostrar</p>
                <p className="text-sm mt-1">Selecciona una fecha y un prevendedor para ver sus actividades</p>
              </div>
            )}
          </section>

          {/* Detalle de actividad seleccionada */}
          {selectedActivity && (
            <section className="card shadow-xl ring-1 ring-black/5">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-brand-900">Detalle del Negocio</h3>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-lead-400 hover:text-lead-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lead-800 mb-3">{selectedActivity.business.name}</h4>
                  <div className="space-y-2 text-sm text-lead-600">
                    {selectedActivity.business.nit && (
                      <p><span className="font-medium">NIT:</span> {selectedActivity.business.nit}</p>
                    )}
                    {selectedActivity.business.address && (
                      <p><span className="font-medium">Dirección:</span> {selectedActivity.business.address}</p>
                    )}
                    {selectedActivity.business.position && (
                      <p>
                        <span className="font-medium">Coordenadas:</span>{' '}
                        {selectedActivity.business.position.lat.toFixed(6)}, {selectedActivity.business.position.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lead-800 mb-3">Estado de Actividad</h4>
                  <div className="space-y-2">
                    {selectedActivity.activity.action ? (
                      <>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                          selectedActivity.activity.action.toLowerCase() === 'sold' || selectedActivity.activity.action.toLowerCase() === 'venta'
                            ? 'bg-blue-100 text-blue-700'
                            : selectedActivity.activity.action.toLowerCase() === 'rejected' || selectedActivity.activity.action.toLowerCase() === 'rechazado'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            selectedActivity.activity.action.toLowerCase() === 'sold' || selectedActivity.activity.action.toLowerCase() === 'venta'
                              ? 'bg-blue-500'
                              : selectedActivity.activity.action.toLowerCase() === 'rejected' || selectedActivity.activity.action.toLowerCase() === 'rechazado'
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }`}></span>
                          {selectedActivity.activity.action}
                        </div>
                        {selectedActivity.activity.createdAt && (
                          <p className="text-sm text-lead-500">
                            Registrado: {new Date(selectedActivity.activity.createdAt).toLocaleString('es-BO')}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        Sin visitar
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Click outside handler for dropdown */}
      {showUserDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserDropdown(false)}
        />
      )}

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};

export default ActivitiesPage;
