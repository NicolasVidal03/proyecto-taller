import React, { useEffect, useState, useMemo } from 'react';
import { useClients } from '../hooks/useClients';
import ClientTable from '../components/clients/ClientTable';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Loader from '../components/shared/Loader';
import { ToastContainer, useToast } from '../components/shared/Toast';
import { Client } from '../../domain/entities/Client';
import ClientFormModal from '../components/clients/ClientFormModal';
import { CreateClientDTO, UpdateClientDTO } from '../../domain/ports/IClientRepository';

export const ClientsPage: React.FC = () => {
  const { clients, isLoading, error, fetchClients, deleteClient, createClient, updateClient, clearError } = useClients();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      clearError();
    }
  }, [error, toast, clearError]);

  const handleCreate = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleModalSubmit = async (values: CreateClientDTO | UpdateClientDTO) => {
    setIsSubmitting(true);
    let result;

    if (selectedClient) {
      result = await updateClient(selectedClient.id, values as UpdateClientDTO);
      if (result) {
        toast.success('Cliente actualizado exitosamente');
        closeModal();
      }
    } else {
      result = await createClient(values as CreateClientDTO);
      if (result) {
        toast.success('Cliente creado exitosamente');
        closeModal();
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    const success = await deleteClient(clientToDelete.id);
    if (success) {
      toast.success('Cliente eliminado correctamente');
    } else {
      toast.error('No se pudo eliminar el cliente');
    }
    setClientToDelete(null);
  };

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = clients.filter(client => {
      const fullName = `${client.lastName || ''} ${client.secondLastName || ''} ${client.name}`.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        fullName.includes(term) ||
        (client.ci || '').includes(term);

      return matchesSearch;
    });

    return filtered.sort((a, b) => {
      const an = `${a.lastName || ''} ${a.secondLastName || ''} ${a.name}`.trim();
      const bn = `${b.lastName || ''} ${b.secondLastName || ''} ${b.name}`.trim();
      return an.localeCompare(bn);
    });
  }, [clients, search]);

  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-10 px-6 py-8 lg:px-10 lg:py-12">
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
            />
            <div className="grid gap-10 px-8 py-10 md:px-12 lg:grid-cols-[2fr,1.2fr]">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Gestion de Clientes</p>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Administra tu cartera de clientes
                </h2>
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                      className="input-plain flex-1"
                      placeholder="Buscar por nombre o CI..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  {/* Filtro por tipo eliminado: ahora vive en negocio */}
                </div>
              </div>
            </div>
          </section>

          <section className="card shadow-xl ring-1 ring-black/5">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-brand-900">Listado de clientes</h3>
                <p className="text-sm text-lead-500">
                  {filteredClients.length} cliente(s) encontrado(s). Pagina {page} de {totalPages || 1}
                </p>
              </div>
              <button
                type="button"
                className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2"
                onClick={handleCreate}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nuevo cliente
              </button>
            </div>

            {isLoading ? (
              <Loader />
            ) : (
              <>
                <ClientTable
                  clients={paginatedClients}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />

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
                      Pagina {page} de {totalPages}
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

      <ClientFormModal
        open={isModalOpen}
        mode={selectedClient ? 'edit' : 'create'}
        initialClient={selectedClient}
        submitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />

      {clientToDelete && (
        <ConfirmDialog
          open={!!clientToDelete}
          title="Eliminar cliente"
          description={`Esta seguro de que desea eliminar al cliente "${`${clientToDelete.lastName || ''} ${clientToDelete.secondLastName || ''} ${clientToDelete.name}`.trim()}"?`}
          confirmLabel="Eliminar"
          onConfirm={confirmDelete}
          onCancel={() => setClientToDelete(null)}
        />
      )}

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};
