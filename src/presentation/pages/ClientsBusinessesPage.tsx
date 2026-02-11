import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useBusinesses from '../hooks/useBusinesses';
import { useClients } from '../hooks/useClients';
import { useAreasSimple } from '../hooks/useAreas';
import ClientDetailsModal from '../components/clients/ClientDetailsModal';
import BusinessDetailsModal from '../components/businesses/BusinessDetailsModal';
import BusinessFormModal from '../components/businesses/BusinessFormModal';
import BusinessesTable from '../components/businesses/BusinessesTable';
import ClientForm from '../components/clients/ClientForm';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Loader from '../components/shared/Loader';
import Pagination from '../components/shared/Pagination';
import { ToastContainer, useToast } from '../components/shared/Toast';
import { http } from '../../infrastructure/http/httpClient';
import { Business } from '../../domain/entities/Business';
import { Client } from '../../domain/entities/Client';
import { BusinessType } from '../../domain/entities/BusinessType';
import { PriceType } from '../../domain/entities/PriceType';
import { CreateClientDTO, UpdateClientDTO } from '../../domain/ports/IClientRepository';

type ActiveSection = 'clients' | 'businesses';


export const ClientsBusinessesPage: React.FC = () => {
  const toast = useToast();

  // Data hooks
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

  const { areas, areaMap, fetchAreas } = useAreasSimple();

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
  const [toToggleBusiness, setToToggleBusiness] = useState<Business | null>(null);
  const [toRemoveBusiness, setToRemoveBusiness] = useState<Business | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Client modal states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [toDeleteClient, setToDeleteClient] = useState<Client | null>(null);
  const [clientSubmitting, setClientSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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
  }, [businessesError, clearBusinessesError]);

  useEffect(() => {
    if (clientsError) {
      toast.error(clientsError.message);
      clearClientsError();
    }
  }, [clientsError, clearClientsError]);

  // Reset page on search/section change
  useEffect(() => setPage(1), [search, activeSection]);

  // ============ FILTERING AND PAGINATION ============

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    const terms = term.split(/\s+/).filter(t => t.length > 0);
    const list = clients || [];
    return list
      .filter((c) => {
        if (terms.length === 0) return true;
        const searchString = `${c.lastName || ''} ${c.secondLastName || ''} ${c.name} ${c.ci || ''} ${c.phone}`.toLowerCase();
        return terms.every(t => searchString.includes(t));
      })
      .sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
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

  const currentData = activeSection === 'clients' ? filteredClients : filteredBusinesses;
  const totalItems = currentData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
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

  // Toggle isActive for business
  const confirmToggleBusiness = async () => {
    if (!toToggleBusiness) return;
    // Toggle is_active via update endpoint (send snake_case)
    const okUpdate = await updateBusiness(toToggleBusiness.id, { is_active: !toToggleBusiness.isActive } as any);
    if (okUpdate) {
      toast.success(!toToggleBusiness.isActive ? 'Negocio activado' : 'Negocio desactivado');
      // refresh list to reflect change
      fetchBusinesses();
    } else {
      toast.error('No se pudo cambiar el estado');
    }
    setToToggleBusiness(null);
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

  // ============ CLIENT TYPE MAP ============

  // ============ RENDER ============

  const isLoading =
    (activeSection === 'clients' && clientsLoading) ||
    (activeSection === 'businesses' && (businessesLoading || businessTypesLoading || priceTypesLoading));

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
      <div className="relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-8 px-6 py-8 lg:px-10 lg:py-12">
          
          {/* Header Section */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)',
              }}
            />
            <div className="px-8 py-10 md:px-12">
              <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Gestión</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">Clientes y Negocios</h2>
              <p className="mt-2 text-white/80">Administra tu cartera de clientes y sus negocios asociados</p>
              
              {/* Search */}
              <div className="mt-6 max-w-3xl">
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      className="input-plain flex-1"
                      placeholder="Buscar por apellidos y nombres, CI o teléfono..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs - Similar to image with rounded pills */}
          <div className="flex gap-3">
            <button
              type="button"
              className={`rounded-full px-8 py-3 text-sm font-semibold transition-all shadow-md ${
                activeSection === 'clients'
                  ? 'bg-white text-brand-700 ring-2 ring-brand-300'
                  : 'bg-white/80 text-lead-600 hover:bg-white hover:shadow-lg'
              }`}
              onClick={() => setActiveSection('clients')}
            >
              Clientes
            </button>
            <button
              type="button"
              className={`rounded-full px-8 py-3 text-sm font-semibold transition-all shadow-md ${
                activeSection === 'businesses'
                  ? 'bg-white text-brand-700 ring-2 ring-brand-300'
                  : 'bg-white/80 text-lead-600 hover:bg-white hover:shadow-lg'
              }`}
              onClick={() => setActiveSection('businesses')}
            >
              Negocios
            </button>
          </div>

          {/* Content Card */}
          <section className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-brand-900">
                  {activeSection === 'clients' ? 'Listado de Clientes' : 'Listado de Negocios'}
                </h3>
                <p className="text-sm text-lead-500">
                  {getSectionCount()} registro(s) — Página {page} de {totalPages}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 transition-all flex items-center gap-2"
                onClick={handleCreateNew}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {getCreateButtonLabel()}
              </button>
            </div>

            {isLoading ? (
              <Loader />
            ) : (
              <>
                {/* Clients Table */}
                {activeSection === 'clients' && (
                  <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
                        <tr>
                          <th className="px-4 py-4 text-left font-semibold">Nombre completo</th>
                          <th className="px-4 py-4 text-left font-semibold">Teléfono</th>
                          <th className="px-4 py-4 text-left font-semibold">CI</th>
                          <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-lead-200">
                        {(paginatedData as Client[]).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-sm text-lead-600">
                              No hay clientes registrados
                            </td>
                          </tr>
                        ) : (
                          (paginatedData as Client[]).map((client) => (
                            <tr key={client.id} className="transition-colors hover:bg-white">
                              <td className="px-4 py-3 font-medium text-brand-900">
                                {`${client.lastName || ''} ${client.secondLastName || ''} ${client.name}`.trim()}
                              </td>
                              <td className="px-4 py-3 text-lead-600">{client.phone}</td>
                              <td className="px-4 py-3 text-lead-600">{client.ci || '-'}</td>
                              <td className="px-4 py-3 text-center align-middle">
                                                <div className="flex items-center justify-center gap-2">
                                                <button
                                                  onClick={() => setSelectedClient(client)}
                                                  className="rounded bg-blue-100 px-3 py-1.5 font-medium text-blue-700 transition hover:bg-blue-200"
                                                  title="Ver"
                                                >
                                                  Ver
                                                </button>
                                  <button
                                    onClick={() => setEditingClient(client)}
                                    className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200"
                                    title="Editar"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => setToDeleteClient(client)}
                                    className="rounded bg-red-100 px-3 py-1.5 font-medium text-red-700 transition hover:bg-red-200"
                                    title="Eliminar"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Businesses Table */}
                {activeSection === 'businesses' && (
                  <BusinessesTable
                    businesses={paginatedData as Business[]}
                    clients={clients}
                    businessTypes={businessTypes}
                    areas={areas}
                    onEdit={setEditingBusiness}
                    onToggleActive={setToToggleBusiness}
                    onRemove={setToRemoveBusiness}
                    onView={setSelectedBusiness}
                    onChangeArea={handleChangeArea}
                  />
                )}

                {/* Pagination */}
                {totalPages > 0 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={pageSize}
                    onPageChange={setPage}
                    isLoading={activeSection === 'clients' ? clientsLoading : businessesLoading}
                  />
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
          title="Eliminar cliente"
          description={`¿Confirmas eliminar al cliente "${`${toDeleteClient.lastName || ''} ${toDeleteClient.secondLastName || ''} ${toDeleteClient.name}`.trim()}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={confirmDeleteClient}
          onCancel={() => setToDeleteClient(null)}
        />
      )}

      {toToggleBusiness && (
        <ConfirmDialog
          open={!!toToggleBusiness}
          title={`${toToggleBusiness.isActive ? 'Desactivar' : 'Activar'} negocio`}
          description={`¿Confirmas ${toToggleBusiness.isActive ? 'desactivar' : 'activar'} el negocio "${toToggleBusiness.name}"? ${
            toToggleBusiness.isActive
              ? 'El negocio se marcará como inactivo pero seguirá visible en el sistema.'
              : 'El negocio se marcará como activo nuevamente.'
          }`}
          confirmLabel={toToggleBusiness.isActive ? 'Desactivar' : 'Activar'}
          onConfirm={confirmToggleBusiness}
          onCancel={() => setToToggleBusiness(null)}
        />
      )}

      {toRemoveBusiness && (
        <ConfirmDialog
          open={!!toRemoveBusiness}
          title={`Eliminar negocio`}
          description={`¿Confirmas eliminar el negocio "${toRemoveBusiness.name}"? Esta acción lo eliminará del sistema.`}
          confirmLabel={`Eliminar`}
          onConfirm={confirmRemoveBusiness}
          onCancel={() => setToRemoveBusiness(null)}
        />
      )}

      {/* View Modals */}
      {selectedClient && (
        <ClientDetailsModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}

      {selectedBusiness && (
        <BusinessDetailsModal
          business={selectedBusiness}
          clients={clients}
          businessTypes={businessTypes}
          areaMap={areaMap}
          onClose={() => setSelectedBusiness(null)}
        />
      )}

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};

export default ClientsBusinessesPage;
