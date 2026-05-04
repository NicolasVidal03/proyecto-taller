import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useBusinesses from '../hooks/useBusinesses';
import { useClients } from '../hooks/useClients';
import { useAreasSimple } from '../hooks/useAreas';
import { useDebounce } from '../hooks';
import ClientDetailsModal from '../components/clients/ClientDetailsModal';
import BusinessDetailsModal from '../components/businesses/BusinessDetailsModal';
import BusinessFormModal from '../components/businesses/BusinessFormModal';
import BusinessesTable from '../components/businesses/BusinessesTable';
import ClientForm from '../components/clients/ClientModalForm';
import ClientsTable from '@presentation/components/clients/ClientsTable';
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
import { BusinessFilters } from '../../domain/ports/IBusinessRepository';

type ActiveSection = 'clients' | 'businesses';

const ITEMS_PER_PAGE = 10;

export const ClientsBusinessesPage: React.FC = () => {
  const toast = useToast();
  const {
    businesses,
    isLoading: businessesLoading,
    error: businessesError,
    page: businessesPage,
    total: businessesTotal,
    totalPages: businessesTotalPages,
    goToPage,
    applyFilters,
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

  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [businessTypesLoading, setBusinessTypesLoading] = useState(false);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [priceTypesLoading, setPriceTypesLoading] = useState(false);

  const [activeSection, setActiveSection] = useState<ActiveSection>('clients');
  const [clientsPage, setClientsPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statsOpen, setStatsOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [creatingBusiness, setCreatingBusiness] = useState(false);
  const [toToggleBusiness, setToToggleBusiness] = useState<Business | null>(null);
  const [toRemoveBusiness, setToRemoveBusiness] = useState<Business | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [toDeleteClient, setToDeleteClient] = useState<Client | null>(null);
  const [clientSubmitting, setClientSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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
    fetchAreas();
    fetchBusinessTypes();
    fetchPriceTypes();
    applyFilters({});
  }, []);

  useEffect(() => {
    if (activeSection !== 'businesses') return;
    const filters: BusinessFilters = {};
    if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
    applyFilters(filters);
  }, [debouncedSearch, activeSection, applyFilters]);

  useEffect(() => setClientsPage(1), [search, activeSection]);

  useEffect(() => {
    if (businessesError) { toast.error(businessesError); clearBusinessesError(); }
  }, [businessesError, clearBusinessesError]);

  useEffect(() => {
    if (clientsError) { toast.error(clientsError.message); clearClientsError(); }
  }, [clientsError, clearClientsError]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    const terms = term.split(/\s+/).filter((t) => t.length > 0);
    return (clients || [])
      .filter((c) => {
        if (terms.length === 0) return true;
        const searchString = `${c.lastName || ''} ${c.secondLastName || ''} ${c.name} ${c.ci || ''} ${c.phone}`.toLowerCase();
        return terms.every((t) => searchString.includes(t));
      })
      .sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
  }, [clients, search]);

  const clientsTotalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const paginatedClients = filteredClients.slice(
    (clientsPage - 1) * ITEMS_PER_PAGE,
    clientsPage * ITEMS_PER_PAGE,
  );

  const handleSaveClient = async (data: CreateClientDTO | UpdateClientDTO) => {
    setClientSubmitting(true);
    try {
      if ('id' in data && data.id) {
        const updated = await updateClient(data.id, data);
        if (updated) { toast.success('Cliente actualizado'); setEditingClient(null); fetchClients(); }
        else toast.error('No se pudo actualizar');
      } else {
        const created = await createClient(data as CreateClientDTO);
        if (created) { toast.success('Cliente creado'); setCreatingClient(false); fetchClients(); }
        else toast.error('No se pudo crear');
      }
    } finally {
      setClientSubmitting(false);
    }
  };

  const confirmDeleteClient = async () => {
    if (!toDeleteClient) return;
    const ok = await deleteClient(toDeleteClient.id);
    if (ok) toast.success('Cliente eliminado');
    else toast.error('No se pudo eliminar');
    setToDeleteClient(null);
  };

  const handleSaveBusiness = async (data: any) => {
    if (data.id) {
      const ok = await updateBusiness(data.id, data);
      if (ok) { toast.success('Negocio actualizado'); setEditingBusiness(null); }
      else toast.error('No se pudo actualizar');
    } else {
      const created = await createBusiness(data);
      if (created) { toast.success('Negocio creado'); setCreatingBusiness(false); }
      else toast.error('No se pudo crear');
    }
  };

  const confirmToggleBusiness = async () => {
    if (!toToggleBusiness) return;
    const ok = await updateBusiness(toToggleBusiness.id, { is_active: !toToggleBusiness.isActive } as any);
    if (ok) toast.success(!toToggleBusiness.isActive ? 'Negocio activado' : 'Negocio desactivado');
    else toast.error('No se pudo cambiar el estado');
    setToToggleBusiness(null);
  };

  const confirmRemoveBusiness = async () => {
    if (!toRemoveBusiness) return;
    const ok = await softDeleteBusiness(toRemoveBusiness.id);
    if (ok) toast.success('Negocio eliminado');
    else toast.error('No se pudo eliminar');
    setToRemoveBusiness(null);
  };

  const handleChangeArea = async (businessId: number, areaId: number | null) => {
    const updated = await updateBusiness(businessId, { area_id: areaId } as any);
    if (updated) toast.success('Área actualizada');
    else toast.error('No se pudo actualizar el área');
  };

  const isLoading =
    (activeSection === 'clients' && clientsLoading) ||
    (activeSection === 'businesses' && (businessesLoading || businessTypesLoading || priceTypesLoading));

  const getSectionCount = () =>
    activeSection === 'clients' ? filteredClients.length : businessesTotal;

  return (
    <>
      <div className="relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-6 px-3 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-12">

          <section className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
            />
            <div className="relative grid gap-6 px-5 py-7 sm:px-8 sm:py-10 md:px-12 lg:grid-cols-[2fr,1.2fr] lg:items-start">

              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[0.6rem] uppercase tracking-[0.45em] text-white/70">Panel de Gestión</p>
                    <h2 className="text-xl font-semibold leading-tight sm:text-2xl md:text-3xl lg:text-4xl">
                      Clientes y Negocios
                    </h2>
                    <p className="text-sm text-white/80 hidden sm:block">Administra tu cartera de clientes y sus negocios asociados</p>
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

                <div className="space-y-3 rounded-2xl bg-white/10 p-3 sm:p-4 backdrop-blur border border-white/10">
                  <input
                    className="input-plain w-full text-sm"
                    placeholder="Buscar por apellidos y nombres, CI o teléfono..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {statsOpen && (
                  <div className="lg:hidden">
                    <div className="relative rounded-2xl border border-white/20 bg-white/10 px-5 py-6 backdrop-blur space-y-3">
                      <div className="rounded-xl bg-gradient-to-br from-brand-900 to-brand-600 px-4 py-4 shadow-lg text-center">
                        <p className="text-xs uppercase tracking-wide text-white/80">
                          {activeSection === 'clients' ? 'Total Clientes' : 'Total Negocios'}
                        </p>
                        <p className="mt-1.5 text-3xl font-semibold text-white">{getSectionCount().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                  <div className="relative flex items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 px-7 py-8 backdrop-blur">
                    <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-600 px-8 py-6 shadow-lg text-center w-full">
                      <p className="text-xs uppercase tracking-wide text-white/80">
                        {activeSection === 'clients' ? 'Total Clientes' : 'Total Negocios'}
                      </p>
                      <p className="mt-2 text-4xl font-semibold text-white">{getSectionCount().toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {(['clients', 'businesses'] as ActiveSection[]).map((sec) => (
              <button
                key={sec}
                type="button"
                className={`rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition shadow ${
                  activeSection === sec
                    ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                    : 'bg-white/70 text-lead-600 hover:bg-white'
                }`}
                onClick={() => setActiveSection(sec)}
              >
                {sec === 'clients' ? 'Clientes' : 'Negocios'}
              </button>
            ))}
          </div>

          <section className="card shadow-xl ring-1 ring-black/5">
            <div className="mb-6 flex flex-col gap-3 border-b border-lead-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-900 sm:text-xl">
                  {activeSection === 'clients' ? 'Listado de Clientes' : 'Listado de Negocios'}
                </h3>
                <p className="text-sm text-lead-500">
                  {getSectionCount()} registro(s) — Página{' '}
                  {activeSection === 'clients' ? clientsPage : businessesPage}
                  {' '}de{' '}
                  {activeSection === 'clients' ? clientsTotalPages : businessesTotalPages}
                </p>
              </div>
              <button
                type="button"
                className="w-full sm:w-auto rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-accent-600 transition-all flex items-center justify-center gap-2"
                onClick={() => activeSection === 'clients' ? setCreatingClient(true) : setCreatingBusiness(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {activeSection === 'clients' ? 'Nuevo cliente' : 'Nuevo negocio'}
              </button>
            </div>

            {isLoading ? (
              <Loader />
            ) : (
              <>
                {activeSection === 'clients' && (
                  <ClientsTable
                    clients={paginatedClients}
                    onEdit={setEditingClient}
                    onDelete={setToDeleteClient}
                    onView={setSelectedClient}
                  />
                )}

                {activeSection === 'businesses' && (
                  <BusinessesTable
                    businesses={businesses}
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

                {activeSection === 'clients' && clientsTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={clientsPage}
                      totalPages={clientsTotalPages}
                      totalItems={filteredClients.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={setClientsPage}
                      isLoading={clientsLoading}
                    />
                  </div>
                )}

                {activeSection === 'businesses' && businessesTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={businessesPage}
                      totalPages={businessesTotalPages}
                      totalItems={businessesTotal}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={(p) => goToPage(p)}
                      isLoading={businessesLoading}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {(creatingClient || editingClient) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
              <h2 className="text-lg font-semibold tracking-wide">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button
                type="button"
                onClick={() => { setCreatingClient(false); setEditingClient(null); }}
                className="text-brand-100 hover:text-white transition-colors"
                disabled={clientSubmitting}
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-6">
              <ClientForm
                onSubmit={handleSaveClient}
                onCancel={() => { setCreatingClient(false); setEditingClient(null); }}
                isSubmitting={clientSubmitting}
                initialData={editingClient || undefined}
              />
            </div>
          </div>
        </div>
      )}

      {(creatingBusiness || editingBusiness) && (
        <BusinessFormModal
          business={editingBusiness}
          clients={clients}
          businessTypes={businessTypes}
          priceTypes={priceTypes}
          areas={areas}
          onClose={() => { setCreatingBusiness(false); setEditingBusiness(null); }}
          onSave={handleSaveBusiness}
          saving={businessesLoading}
        />
      )}

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
          title="Eliminar negocio"
          description={`¿Confirmas eliminar el negocio "${toRemoveBusiness.name}"? Esta acción lo eliminará del sistema.`}
          confirmLabel="Eliminar"
          onConfirm={confirmRemoveBusiness}
          onCancel={() => setToRemoveBusiness(null)}
        />
      )}

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