import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { useAreas } from '../hooks/useAreas';
import ClientForm from '../components/clients/ClientForm';
import { CreateClientDTO, UpdateClientDTO } from '../../domain/ports/IClientRepository';
import { ToastContainer, useToast } from '../components/shared/Toast';

export const NewClientPage: React.FC = () => {
  const navigate = useNavigate();
  const { createClient } = useClients();
  const { areas, isLoading: areasLoading } = useAreas();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateClientDTO | UpdateClientDTO) => {
    setIsSubmitting(true);
    try {
      // Este formulario es para creación; forzamos el tipo a CreateClientDTO
      const payload = data as CreateClientDTO;
      const newClient = await createClient(payload);
      if (newClient) {
        toast.success('Cliente creado correctamente');
        setTimeout(() => {
          navigate('/clients');
        }, 1000);
      } else {
        toast.error('No se pudo crear el cliente');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error al crear cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  return (
    <>
      <div className="relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-6 px-6 py-8 lg:px-10 lg:py-12 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleCancel}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-lead-200 text-lead-700 hover:bg-lead-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-lead-900">Nuevo Cliente</h1>
              <p className="text-sm text-lead-500">Complete los datos para registrar un nuevo cliente</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="card shadow-xl ring-1 ring-black/5">
            <div className="mb-6 border-b border-lead-100 pb-4">
              <h2 className="text-lg font-bold text-brand-900">Información del cliente</h2>
              <p className="text-sm text-lead-500">Los campos marcados con * son obligatorios</p>
            </div>

            {areasLoading ? (
              <div className="py-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
                <p className="mt-2 text-sm text-lead-600">Cargando áreas...</p>
              </div>
            ) : (
              <ClientForm
                areas={areas}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};
