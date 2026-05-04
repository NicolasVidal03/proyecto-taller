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
  const [searchTerm, setSearchTerm] = useState('');
  const [statsOpen, setStatsOpen] = useState(false);

  const handleCreate = () => { setModalMode('create'); setEditingArea(null); setModalOpen(true); };
  const handleEdit = (area: Area) => { setModalMode('edit'); setEditingArea(area); setModalOpen(true); };
  const handleSelect = (area: Area) => {
    setSelectedAreaId(area.id != null && area.id === selectedAreaId ? null : (area.id ?? null));
  };
  const handleDeleteClick = (area: Area) => setDeleteConfirm(area);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm || !deleteConfirm.id) return;
    try {
      await deleteArea(deleteConfirm.id);
      setDeleteConfirm(null);
      if (selectedAreaId === deleteConfirm.id) setSelectedAreaId(null);
      toast.success('Área eliminada correctamente');
    } catch {
      toast.error('Error al eliminar el área');
    }
  };

  const handleSubmit = async (data: { name: string; area: AreaPoint[] }) => {
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await createArea(data.name.trim().replace(/\s+/g, ' '), data.area);
        toast.success('Área creada correctamente');
      } else if (editingArea && editingArea.id) {
        await updateArea(editingArea.id, data.name, data.area);
        toast.success('Área actualizada correctamente');
      }
      setModalOpen(false);
    } catch {
      toast.error('Error al guardar el área');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedArea = areas.find(a => a.id === selectedAreaId);

  const sortedAreas = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let filtered = [...areas];
    if (term) filtered = filtered.filter(a => (a.name || '').toLowerCase().includes(term));
    return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [areas, searchTerm]);

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
                    <p className="text-[0.6rem] uppercase tracking-[0.45em] text-white/70">Gestión de Territorio</p>
                    <h2 className="text-xl font-semibold leading-tight sm:text-2xl md:text-3xl lg:text-4xl">
                      Áreas Geográficas
                    </h2>
                    <p className="text-sm text-white/80 hidden sm:block">
                      Define y gestiona las zonas de cobertura para tus prevendedores y rutas de distribución.
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

                <button
                  onClick={handleCreate}
                  className="self-start flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white text-brand-700 rounded-xl hover:bg-brand-50 transition-colors shadow-lg font-bold text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Área
                </button>

                {statsOpen && (
                  <div className="lg:hidden">
                    <div className="relative rounded-2xl border border-white/20 bg-white/10 px-5 py-6 backdrop-blur space-y-4">
                      <p className="text-[0.6rem] uppercase tracking-[0.35em] text-white/60">Resumen</p>
                      <div className="rounded-xl bg-gradient-to-br from-brand-900 to-brand-600 px-4 py-4 shadow-lg">
                        <p className="text-xs uppercase tracking-wide text-white/80">Total Áreas</p>
                        <p className="mt-1.5 text-3xl font-semibold text-white">{areas.length}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                  <div className="relative space-y-5 rounded-[2rem] border border-white/20 bg-white/10 px-7 py-8 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/60">Resumen</p>
                    <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-600 px-4 py-5 shadow-lg">
                      <p className="text-xs uppercase tracking-wide text-white/80">Total Áreas</p>
                      <p className="mt-2 text-4xl font-semibold text-white">{areas.length}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="relative px-5 pb-7 sm:px-8 md:px-12">
              <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl shadow-xl overflow-hidden border border-emerald-400/30 p-1">
                <div className="bg-white/95 backdrop-blur rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="Buscar áreas por nombre..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <AreaTable
                    areas={sortedAreas}
                    loading={loading}
                    selectedAreaId={selectedAreaId}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
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
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>🗺️</span> Mapa de Cobertura
              </h3>
              {selectedArea && (
                <span className="text-xs sm:text-sm bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full font-medium border border-brand-200 truncate max-w-[160px] sm:max-w-none">
                  📍 {selectedArea.name}
                </span>
              )}
            </div>
            <AreaMap
              areas={sortedAreas}
              selectedAreaId={selectedAreaId}
              onAreaClick={area => handleSelect(area)}
              onAreaEdit={handleEdit}
              onAreaDelete={handleDeleteClick}
              height="450px"
            />
          </section>

        </div>
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
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6" style={{ zIndex: 100000 }}>
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Eliminar Área</h3>
                <p className="text-xs sm:text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-700 mb-5 sm:mb-6">
              ¿Estás seguro que deseas eliminar el área <strong>"{deleteConfirm.name}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};

export default AreasPage;