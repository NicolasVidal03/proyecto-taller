import React, { useState } from 'react';
import AreaMap from '../components/areas/AreaMap';
import AreaTable from '../components/areas/AreaTable';
import AreaFormModal from '../components/areas/AreaFormModal';
import { useAreas } from '../hooks/useAreas';
import { Area, AreaPoint } from '../../domain/entities/Area';
import { ToastContainer, useToast } from '../components/shared/Toast';

const AreasPage: React.FC = () => {
  const {
    areas,
    loading,
    error,
    createArea,
    updateArea,
    deleteArea,
    clearError,
  } = useAreas();

  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Area | null>(null);

  const handleCreate = () => {
    setModalMode('create');
    setEditingArea(null);
    setModalOpen(true);
  };

  const handleEdit = (area: Area) => {
    setModalMode('edit');
    setEditingArea(area);
    setModalOpen(true);
  };

  const handleSelect = (area: Area) => {
    setSelectedAreaId(area.id != null && area.id === selectedAreaId ? null : (area.id ?? null));
  };

  const handleDeleteClick = (area: Area) => {
    setDeleteConfirm(area);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm || !deleteConfirm.id) return;

    try {
      await deleteArea(deleteConfirm.id);
      setDeleteConfirm(null);
      if (selectedAreaId === deleteConfirm.id) {
        setSelectedAreaId(null);
      }
      toast.success('Área eliminada correctamente');
    } catch (err) {
      console.error('Error deleting area:', err);
      toast.error('Error al eliminar el área');
    }
  };

  const handleSubmit = async (data: { name: string; area: AreaPoint[] }) => {
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await createArea(data.name, data.area);
        toast.success('Área creada correctamente');
      } else if (editingArea && editingArea.id) {
        await updateArea(editingArea.id, data.name, data.area);
        toast.success('Área actualizada correctamente');
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving area:', err);
      toast.error('Error al guardar el área');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedArea = areas.find(a => a.id === selectedAreaId);
  const totalPoints = areas.reduce((sum, a) => sum + (a.area?.length || 0), 0);

  return (
    <div className="relative overflow-hidden min-h-screen bg-gray-50/50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.08),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.05),transparent_55%)] pointer-events-none" />
      <div className="relative space-y-8 px-6 py-8 lg:px-10 lg:py-12">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
          />

          <div className="relative z-10 grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr,1fr] xl:grid-cols-[1.5fr,1fr] items-start">
            <div className="space-y-8">
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-white/70 mb-2">Gestión de Territorio</p>
                <h1 className="text-3xl font-bold leading-tight md:text-4xl mb-4">
                  Áreas Geográficas
                </h1>
                <p className="text-white/80 text-lg max-w-xl">
                  Define y gestiona las zonas de cobertura para tus prevendedores y rutas de distribución.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-brand-700 rounded-xl hover:bg-brand-50 transition-colors shadow-lg font-bold"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Área
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="rounded-2xl bg-white/10 border border-white/20 px-5 py-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wide text-white/70">Total Áreas</p>
                  <p className="mt-1 text-3xl font-bold text-white">{areas.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/20 px-5 py-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wide text-white/70">Puntos Totales</p>
                  <p className="mt-1 text-3xl font-bold text-white">{totalPoints}</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full transform translate-y-4" />
              <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl shadow-xl overflow-hidden border border-emerald-400/30 p-1">
                <div className="bg-white/95 backdrop-blur rounded-xl overflow-hidden h-full">
                  <AreaTable
                    areas={areas}
                    loading={loading}
                    selectedAreaId={selectedAreaId}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
            <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <section className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>🗺️</span> Mapa de Cobertura
            </h3>
            {selectedArea && (
              <span className="text-sm bg-brand-100 text-brand-700 px-3 py-1 rounded-full font-medium border border-brand-200">
                📍 {selectedArea.name}
              </span>
            )}
          </div>
          <AreaMap
            areas={areas}
            selectedAreaId={selectedAreaId}
            onAreaClick={(area) => handleSelect(area)}
            onAreaEdit={handleEdit}
            onAreaDelete={handleDeleteClick}
            height="650px"
          />
        </section>
      </div>
      <AreaFormModal
        open={modalOpen}
        mode={modalMode}
        initialData={editingArea}
        submitting={submitting}
        existingAreas={areas}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
      {deleteConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" style={{ zIndex: 100000 }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Eliminar Área</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              ¿Estás seguro que deseas eliminar el área{' '}
              <strong>"{deleteConfirm.name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </div>
  );
};

export default AreasPage;
