/**
 * GenerateRouteModal - Modal para generar rutas de prevendedores
 */
import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../../domain/entities/User';
import { Area } from '../../../domain/entities/Area';
import SingleAreaMap from './SingleAreaMap';

interface GenerateRouteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { assignedIdUser: number; assignedIdArea: number; assignedDate: string }) => Promise<void>;
  users: User[];
  areas: Area[];
  isSubmitting?: boolean;
}

const GenerateRouteModal: React.FC<GenerateRouteModalProps> = ({
  open,
  onClose,
  onSubmit,
  users,
  areas,
  isSubmitting = false,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedAreaId, setSelectedAreaId] = useState<number | ''>('');
  const [assignedDate, setAssignedDate] = useState('');
  const [errors, setErrors] = useState<{ user?: string; area?: string; date?: string }>({});

 
  const prevendedores = useMemo(() => {
    return users.filter(u => u.role === 'prevendedor');
  }, [users]);

  const selectedArea = useMemo(() => {
    if (!selectedAreaId) return null;
    return areas.find(a => a.id === selectedAreaId) || null;
  }, [areas, selectedAreaId]);

  useEffect(() => {
    if (open) {
      setSelectedUserId('');
      setSelectedAreaId('');
      setAssignedDate('');
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, isSubmitting, onClose]);

  const validate = (): boolean => {
    const newErrors: { user?: string; area?: string; date?: string } = {};

    if (!selectedUserId) {
      newErrors.user = 'Selecciona un prevendedor';
    }
    if (!selectedAreaId) {
      newErrors.area = 'Selecciona un área';
    }
    if (!assignedDate) {
      newErrors.date = 'Selecciona una fecha';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      assignedIdUser: selectedUserId as number,
      assignedIdArea: selectedAreaId as number,
      assignedDate: new Date(assignedDate).toISOString(),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ zIndex: 100000 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-brand-50 to-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-100 rounded-xl">
              <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Generar Ruta para Prevendedor</h2>
              <p className="text-sm text-gray-500 mt-0.5">Asigna un área y fecha a un prevendedor</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Vendedor/Distribuidor <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value ? Number(e.target.value) : '');
                    if (errors.user) setErrors(prev => ({ ...prev, user: undefined }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.user
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50'
                      : 'border-gray-200 focus:ring-brand-500 focus:border-brand-500'
                  } focus:outline-none focus:ring-2 transition-all`}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar prevendedor...</option>
                  {prevendedores.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.names} {user.lastName} - {user.userName}
                    </option>
                  ))}
                </select>
                {errors.user && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.user}
                  </p>
                )}
                {prevendedores.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600">
                    ⚠️ No hay prevendedores disponibles
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🗺️ Área a Designar <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedAreaId}
                  onChange={(e) => {
                    setSelectedAreaId(e.target.value ? Number(e.target.value) : '');
                    if (errors.area) setErrors(prev => ({ ...prev, area: undefined }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.area
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50'
                      : 'border-gray-200 focus:ring-brand-500 focus:border-brand-500'
                  } focus:outline-none focus:ring-2 transition-all`}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar área...</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name} (ID: {area.id})
                    </option>
                  ))}
                </select>
                {errors.area && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.area}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Fecha Designada <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={assignedDate}
                  onChange={(e) => {
                    setAssignedDate(e.target.value);
                    if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.date
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50'
                      : 'border-gray-200 focus:ring-brand-500 focus:border-brand-500'
                  } focus:outline-none focus:ring-2 transition-all`}
                  disabled={isSubmitting}
                />
                {errors.date && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.date}
                  </p>
                )}
              </div>

              {(selectedUserId || selectedAreaId || assignedDate) && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">📋 Resumen</h4>
                  <div className="space-y-2 text-sm">
                    {selectedUserId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Prevendedor:</span>
                        <span className="font-medium text-gray-800">
                          {prevendedores.find(u => u.id === selectedUserId)?.names || '-'}
                        </span>
                      </div>
                    )}
                    {selectedAreaId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Área:</span>
                        <span className="font-medium text-gray-800">
                          {areas.find(a => a.id === selectedAreaId)?.name || '-'}
                        </span>
                      </div>
                    )}
                    {assignedDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fecha:</span>
                        <span className="font-medium text-gray-800">
                          {new Date(assignedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                🗺️ Vista Previa del Área
              </label>
              {selectedArea ? (
                <SingleAreaMap area={selectedArea} height="350px" />
              ) : (
                <div className="h-[350px] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="font-medium">Selecciona un área</p>
                    <p className="text-sm mt-1">El mapa se mostrará aquí</p>
                  </div>
                </div>
              )}
              {selectedArea && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 border border-blue-100">
                  <p className="font-medium">📍 {selectedArea.name}</p>
                  <p className="text-blue-600 mt-1">
                    {selectedArea.area?.length || 0} puntos en el polígono
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-400 transition-all disabled:opacity-50"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generar Ruta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateRouteModal;
