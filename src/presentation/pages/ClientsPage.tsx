import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { useAreasSimple } from '../hooks/useAreas';
import ClientTable from '../components/clients/ClientTable';
import ClientDetailsModal from '../components/clients/ClientDetailsModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Loader from '../components/shared/Loader';
import { ToastContainer, useToast } from '../components/shared/Toast';
import { Client } from '../../domain/entities/Client';

type ClientTypeFilter = 'all' | 'Mayorista' | 'Minorista' | 'Regular' | 'Otros';

const CLIENT_TYPE_FILTERS: Array<{ value: ClientTypeFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'Mayorista', label: 'Mayorista' },
  { value: 'Minorista', label: 'Minorista' },
  { value: 'Regular', label: 'Regular' },
  { value: 'Otros', label: 'Otros' },
];

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { clients, isLoading, error, total, currentPage, fetchClients, updateClientArea, deleteClient, clearError } = useClients();
  const { areas, areaMap, isLoading: areasLoading, refreshAreas } = useAreasSimple();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientTypeFilter>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
    // Refrescar áreas para tener las más recientes
    refreshAreas();
  }, [fetchClients, refreshAreas]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      clearError();
    }
  }, [error, toast, clearError]);

  const handleUpdateArea = async (clientId: number, areaId: number) => {
    const success = await updateClientArea(clientId, areaId);
    if (success) {
      toast.success('Área asignada correctamente');
    } else {
      toast.error('No se pudo asignar el área');
    }
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
  };

  const handleEdit = (client: Client) => {
    // Navegamos pasando el cliente en state para que la página de edición
    // pueda usarlo inmediatamente sin esperar un refetch.
    navigate(`/clients/edit/${client.id}`, { state: { client } });
  };

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    const success = await deleteClient(clientToDelete.id);
    if (success) {
      toast.success(`Cliente ${clientToDelete.status ? 'desactivado' : 'activado'} correctamente`);
    } else {
      toast.error('No se pudo cambiar el estado del cliente');
    }
    setClientToDelete(null);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        client.fullName.toLowerCase().includes(term) ||
        client.businessName.toLowerCase().includes(term) ||
        client.nitCi.includes(term);

      const matchesType = clientTypeFilter === 'all' || client.clientType === clientTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [clients, search, clientTypeFilter]);

  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice((page - 1) * pageSize, page * pageSize);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, clientTypeFilter]);

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-10 px-6 py-8 lg:px-10 lg:py-12">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
            />
            <div className="grid gap-10 px-8 py-10 md:px-12 lg:grid-cols-[2fr,1.2fr]">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Gestión de Clientes</p>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Administra tu cartera de clientes
                </h2>
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                      className="input-plain flex-1"
                      placeholder="Buscar por nombre, razón social o NIT..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {CLIENT_TYPE_FILTERS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setClientTypeFilter(option.value)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          clientTypeFilter === option.value
                            ? 'bg-lead-50 text-brand-700 shadow-lg'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="card shadow-xl ring-1 ring-black/5">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-brand-900">Listado de clientes</h3>
                <p className="text-sm text-lead-500">
                  {filteredClients.length} cliente(s) encontrado(s). Página {page} de {totalPages || 1}
                </p>
              </div>
              <button
                type="button"
                className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2"
                onClick={() => navigate('/clients/new')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nuevo cliente
              </button>
            </div>

            {isLoading || areasLoading ? (
              <Loader />
            ) : (
              <>
                <ClientTable
                  clients={paginatedClients}
                  areaMap={areaMap}
                  areas={areas}
                  onUpdateArea={handleUpdateArea}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-lead-100 pt-4">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-lead-300 px-4 py-2 text-sm font-medium text-lead-700 hover:bg-lead-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-lead-600">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

      <ClientDetailsModal
        client={selectedClient}
        areaMap={areaMap}
        onClose={() => setSelectedClient(null)}
      />

      {clientToDelete && (
        <ConfirmDialog
          open={!!clientToDelete}
          title={clientToDelete.status ? "Desactivar cliente" : "Activar cliente"}
          description={`¿Está seguro de que desea ${clientToDelete.status ? 'desactivar' : 'activar'} al cliente "${clientToDelete.fullName}"?`}
          confirmLabel={clientToDelete.status ? "Desactivar" : "Activar"}
          onConfirm={confirmDelete}
          onCancel={() => setClientToDelete(null)}
        />
      )}

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};
