import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useBusinesses from '../hooks/useBusinesses';
import { useClients } from '../hooks/useClients';
import { useAreasSimple } from '../hooks/useAreas';
import BusinessFormModal from '../components/businesses/BusinessFormModal';
import BusinessesTable from '../components/businesses/BusinessesTable';
import ClientTable from '../components/clients/ClientTable';
import ClientForm from '../components/clients/ClientForm';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Loader from '../components/shared/Loader';
import { ToastContainer, useToast } from '../components/shared/Toast';
import { http } from '../../infrastructure/http/httpClient';
import { Business } from '../../domain/entities/Business';
import { Client } from '../../domain/entities/Client';
import { PriceType } from '../../domain/entities/PriceType';
import { BusinessType } from '../../domain/entities/BusinessType';
import { CreateClientDTO, UpdateClientDTO } from '../../domain/ports/IClientRepository';

type ActiveSection = 'clients' | 'businesses';

export const BusinessesPage: React.FC = () => {
  const toast = useToast();
  const {
    businesses,
    isLoading: businessesLoading,
    error: businessesError,
    fetchBusinesses,
    createBusiness,
    updateBusiness,
    softDeleteBusiness,
    clearError: clearBusinessesError,
  } = useBusinesses();

  const {
    clients,
    isLoading: clientsLoading,
    error: clientsError,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    clearError: clearClientsError,
  } = useClients();

  const { areas, fetchAreas } = useAreasSimple();

  // Lookup data states
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [businessTypesLoading, setBusinessTypesLoading] = useState(false);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [priceTypesLoading, setPriceTypesLoading] = useState(false);

  // Tab state
  const [activeSection, setActiveSection] = useState<ActiveSection>('clients');

  // Pagination and search
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState('');

  // Business modal states
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [creatingBusiness, setCreatingBusiness] = useState(false);
  const [toDeleteBusiness, setToDeleteBusiness] = useState<Business | null>(null);
  const [toRemoveBusiness, setToRemoveBusiness] = useState<Business | null>(null);

  // Client modal states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [toDeleteClient, setToDeleteClient] = useState<Client | null>(null);
  const [clientSubmitting, setClientSubmitting] = useState(false);

  // Fetch lookup data
  const fetchBusinessTypes = useCallback(async () => {
    setBusinessTypesLoading(true);
    try {
      const res = await http.get('/business-types');
      setBusinessTypes(res.data || []);
    } catch (e) {
      console.warn('No se pudieron cargar tipos de negocio', e);
    } finally {
      setBusinessTypesLoading(false);
    }
  }, []);

  const fetchPriceTypes = useCallback(async () => {
    setPriceTypesLoading(true);
    try {
      const res = await http.get('/price-types');
      setPriceTypes(res.data || []);
    } catch (e) {
      console.warn('No se pudieron cargar tipos de precio', e);
    } finally {
      setPriceTypesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchBusinesses();
    fetchAreas();
    fetchBusinessTypes();
    fetchPriceTypes();
  }, [fetchClients, fetchBusinesses, fetchAreas, fetchBusinessTypes, fetchPriceTypes]);

  // Error handling
  useEffect(() => {
    if (businessesError) {
      toast.error(businessesError);
      clearBusinessesError();
    }
  }, [businessesError, toast, clearBusinessesError]);

  useEffect(() => {
    if (clientsError) {
      toast.error(clientsError.message);
      clearClientsError();
    }
  }, [clientsError, toast, clearClientsError]);

  // Reset page on search/section change
  useEffect(() => setPage(1), [search, activeSection]);

  // ============ FILTERING AND PAGINATION ============

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = clients || [];
    return list
      .filter((c) => {
        if (!term) return true;
        const fullName = `${c.lastName} ${c.secondLastName} ${c.name}`.toLowerCase();
        return fullName.includes(term) || (c.ci || '').toLowerCase().includes(term) || c.phone.includes(term);
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [clients, search]);

  const filteredBusinesses = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = businesses || [];
    return list
      .filter((b) => {
        if (!term) return true;
        return (
          (b.name || '').toLowerCase().includes(term) ||
          (b.nit || '').toLowerCase().includes(term) ||
          (b.address || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [businesses, search]);

  const getCurrentData = () => {
    return activeSection === 'clients' ? filteredClients : filteredBusinesses;
  };

  const currentData = getCurrentData();
  const totalPages = Math.max(1, Math.ceil(currentData.length / pageSize));
  const paginatedData = currentData.slice((page - 1) * pageSize, page * pageSize);

  // ============ CLIENT HANDLERS ============

  const handleSaveClient = async (data: CreateClientDTO | UpdateClientDTO) => {
    setClientSubmitting(true);
    try {
      if ('id' in data && data.id) {
        const updated = await updateClient(data.id, data);
        if (updated) {
          toast.success('Cliente actualizado');
          setEditingClient(null);
          fetchClients();
        } else {
          toast.error('No se pudo actualizar');
        }
      } else {
        const created = await createClient(data as CreateClientDTO);
        if (created) {
          toast.success('Cliente creado');
          setCreatingClient(false);
          fetchClients();
        } else {
          toast.error('No se pudo crear');
        }
      }
    } finally {
      setClientSubmitting(false);
    }
  };

  const confirmDeleteClient = async () => {
    if (!toDeleteClient) return;
    const ok = await deleteClient(toDeleteClient.id);
    if (ok) {
      toast.success('Cliente eliminado');
    } else {
      toast.error('No se pudo eliminar');
    }
    setToDeleteClient(null);
  };

  // ============ BUSINESS HANDLERS ============

  const handleSaveBusiness = async (data: any) => {
    if (data.id) {
      const ok = await updateBusiness(data.id, data);
      if (ok) {
        toast.success('Negocio actualizado');
        setEditingBusiness(null);
      } else {
        toast.error('No se pudo actualizar');
      }
    } else {
      const created = await createBusiness(data);
      if (created) {
        toast.success('Negocio creado');
        setCreatingBusiness(false);
      } else {
        toast.error('No se pudo crear');
      }
    }
  };

  const confirmDeleteBusiness = async () => {
    if (!toDeleteBusiness) return;
    const okUpdate = await updateBusiness(toDeleteBusiness.id, { is_active: !toDeleteBusiness.isActive } as any);
    if (okUpdate) {
      toast.success(!toDeleteBusiness.isActive ? 'Negocio activado' : 'Negocio desactivado');
      fetchBusinesses();
    } else {
      toast.error('No se pudo cambiar el estado');
    }
    setToDeleteBusiness(null);
  };

  const confirmRemoveBusiness = async () => {
    if (!toRemoveBusiness) return;
    const ok = await softDeleteBusiness(toRemoveBusiness.id);
    if (ok) {
      toast.success('Negocio eliminado');
      fetchBusinesses();
    } else {
      toast.error('No se pudo eliminar');
    }
    setToRemoveBusiness(null);
  };

  const handleChangeArea = async (businessId: number, areaId: number | null) => {
    const updated = await updateBusiness(businessId, { area_id: areaId } as any);
    if (updated) {
      toast.success('Área actualizada');
      fetchBusinesses();
    } else {
      toast.error('No se pudo actualizar el área');
    }
  };

  // ============ STATS ============

  const stats = useMemo(() => {
    return {
      totalClients: clients.length,
      totalBusinesses: businesses.length,
      activeBusinesses: businesses.filter((b) => b.isActive).length,
    };
  }, [clients, businesses]);

  // ============ RENDER ============

  const isLoading =
    (activeSection === 'clients' && clientsLoading) ||
    (activeSection === 'businesses' && (businessesLoading || businessTypesLoading));

  const getSectionTitle = () => {
    return activeSection === 'clients' ? 'Clientes' : 'Negocios';
  };

  const getSectionCount = () => {
    return activeSection === 'clients' ? filteredClients.length : filteredBusinesses.length;
  };

  const handleCreateNew = () => {
    if (activeSection === 'clients') {
      setCreatingClient(true);
    } else {
      setCreatingBusiness(true);
    }
  };

  const getCreateButtonLabel = () => {
    return activeSection === 'clients' ? 'Nuevo cliente' : 'Nuevo negocio';
  };

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-10 px-6 py-8 lg:px-10 lg:py-12">
          {/* Header with stats */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)',
              }}
            />
            <div className="grid gap-10 px-8 py-10 md:px-12 lg:grid-cols-[2fr,1.2fr]">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Gestión</p>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">Clientes y Negocios</h2>
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <input
                    className="input-plain w-full"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                <div className="relative space-y-5 rounded-[2rem] border border-white/20 bg-white/10 px-7 py-8 backdrop-blur">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-600 px-4 py-5 shadow-lg">
                      <p className="text-xs uppercase tracking-wide text-white/80">Clientes</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{stats.totalClients}</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-accent-600 to-accent-400 px-4 py-5 shadow-lg">
                      <p className="text-xs uppercase tracking-wide text-white/80">Negocios</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{stats.totalBusinesses}</p>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-xl border border-white/20 bg-white/10 p-4 text-sm text-white/80">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/60">Resumen</p>
                    <div className="flex items-center justify-between">
                      <span>Negocios activos</span>
                      <span className="font-semibold text-white">{stats.activeBusinesses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tipos de negocio</span>
                      <span className="font-semibold text-white">{businessTypes.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tipos de precio</span>
                      <span className="font-semibold text-white">{priceTypes.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition shadow ${
                activeSection === 'clients'
                  ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                  : 'bg-white/70 text-lead-600 hover:bg-white'
              }`}
              onClick={() => setActiveSection('clients')}
            >
              Clientes
            </button>
            <button
              type="button"
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition shadow ${
                activeSection === 'businesses'
                  ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                  : 'bg-white/70 text-lead-600 hover:bg-white'
              }`}
              onClick={() => setActiveSection('businesses')}
            >
              Negocios
            </button>
          </div>

          {/* Content */}
          <section className="card shadow-xl ring-1 ring-black/5">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-brand-900">{getSectionTitle()}</h3>
                <p className="text-sm text-lead-500">
                  {getSectionCount()} registro(s) — Página {page} de {totalPages}
                </p>
              </div>
              <button
                type="button"
                className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2"
                onClick={handleCreateNew}
              >
                {getCreateButtonLabel()}
              </button>
            </div>

            {isLoading ? (
              <Loader />
            ) : (
              <>
                {/* Clients Table */}
                {activeSection === 'clients' && (
                  <ClientTable
                    clients={paginatedData as Client[]}
                    onEdit={setEditingClient}
                    onDelete={setToDeleteClient}
                  />
                )}

                {/* Businesses Table */}
                {activeSection === 'businesses' && (
                  <BusinessesTable
                    businesses={paginatedData as Business[]}
                    clients={clients}
                    businessTypes={businessTypes}
                    areas={areas}
                    onEdit={setEditingBusiness}
                    onToggleActive={setToDeleteBusiness}
                    onRemove={setToRemoveBusiness}
                    onChangeArea={handleChangeArea}
                  />
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-lead-100 pt-4">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-lead-300 px-4 py-2 text-sm font-medium text-lead-700 hover:bg-lead-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-lead-600">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-lg border border-lead-300 px-4 py-2 text-sm font-medium text-lead-700 hover:bg-lead-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* ============ MODALS ============ */}

      {/* Client Form Modal */}
      {(creatingClient || editingClient) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="mx-4 my-10 w-full max-w-2xl overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
              <h2 className="text-lg font-semibold tracking-wide">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setCreatingClient(false);
                  setEditingClient(null);
                }}
                className="text-brand-100 hover:text-white transition-colors"
                disabled={clientSubmitting}
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-6">
              <ClientForm
                onSubmit={handleSaveClient}
                onCancel={() => {
                  setCreatingClient(false);
                  setEditingClient(null);
                }}
                isSubmitting={clientSubmitting}
                initialData={editingClient || undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* Business Form Modal */}
      {(creatingBusiness || editingBusiness) && (
        <BusinessFormModal
          business={editingBusiness}
          clients={clients}
          businessTypes={businessTypes}
          priceTypes={priceTypes}
          areas={areas}
          onClose={() => {
            setCreatingBusiness(false);
            setEditingBusiness(null);
          }}
          onSave={handleSaveBusiness}
          saving={businessesLoading}
        />
      )}

      {/* ============ CONFIRM DIALOGS ============ */}

      {toDeleteClient && (
        <ConfirmDialog
          open={!!toDeleteClient}
          title={`Eliminar cliente "${toDeleteClient.name}"`}
          description={`¿Confirmas eliminar al cliente "${`${toDeleteClient.lastName || ''} ${toDeleteClient.secondLastName || ''} ${toDeleteClient.name}`.trim()}"?`}
          confirmLabel="Eliminar"
          onConfirm={confirmDeleteClient}
          onCancel={() => setToDeleteClient(null)}
        />
      )}

      {toDeleteBusiness && (
        <ConfirmDialog
          open={!!toDeleteBusiness}
          title={`${toDeleteBusiness.isActive ? 'Desactivar' : 'Activar'} negocio "${toDeleteBusiness.name}"`}
          description={`¿Confirmas ${toDeleteBusiness.isActive ? 'desactivar' : 'activar'} el negocio "${toDeleteBusiness.name}"?`}
          confirmLabel={toDeleteBusiness.isActive ? 'Desactivar' : 'Activar'}
          onConfirm={confirmDeleteBusiness}
          onCancel={() => setToDeleteBusiness(null)}
        />
      )}

      {toRemoveBusiness && (
        <ConfirmDialog
          open={!!toRemoveBusiness}
          title={`Eliminar negocio "${toRemoveBusiness.name}"`}
          description={`¿Confirmas eliminar el negocio "${toRemoveBusiness.name}"? Esta acción lo eliminará del sistema.`}
          confirmLabel={`Eliminar`}
          onConfirm={confirmRemoveBusiness}
          onCancel={() => setToRemoveBusiness(null)}
        />
      )}

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};

export default BusinessesPage;
