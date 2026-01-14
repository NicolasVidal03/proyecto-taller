import React, { useState, useEffect, useCallback } from 'react';
import AreaMap from './AreaMap';
import { Area, AreaPoint } from '../../../domain/entities/Area';
import { isValidAreaPoints } from '../../utils/areaHelpers';

interface AreaFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: Area | null;
  submitting?: boolean;
  existingAreas?: Area[];
  onClose: () => void;
  onSubmit: (data: { name: string; area: AreaPoint[] }) => void;
}


const AreaFormModal: React.FC<AreaFormModalProps> = ({
  open,
  mode,
  initialData,
  submitting = false,
  existingAreas = [],
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [areaPoints, setAreaPoints] = useState<AreaPoint[] | null>(null);
  const [errors, setErrors] = useState<{ name?: string; polygon?: string }>({});
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setName(initialData.name);
        setAreaPoints(initialData.area || null);
      } else {
        setName('');
        setAreaPoints(null);
      }
      setErrors({});
      setOverlapWarning(null);
    }
  }, [open, mode, initialData]);

  const handlePolygonChange = useCallback((points: AreaPoint[] | null) => {
    setAreaPoints(points);
    if (points && points.length >= 3) {
      setErrors(prev => ({ ...prev, polygon: undefined }));
    }
  }, []);

  const handleOverlapError = useCallback((areaName: string) => {
    setOverlapWarning(`El polígono se solapa con "${areaName}"`);
  }, []);

  const handleOverlapResolved = useCallback(() => {
    setOverlapWarning(null);
  }, []);

  const validate = (): boolean => {
    const newErrors: { name?: string; polygon?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!areaPoints) {
      newErrors.polygon = 'Debes dibujar un polígono en el mapa';
    } else if (!isValidAreaPoints(areaPoints)) {
      newErrors.polygon = 'El polígono debe tener al menos 3 puntos';
    }

    if (overlapWarning) {
      newErrors.polygon = overlapWarning;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !areaPoints) return;
    onSubmit({ name: name.trim(), area: areaPoints });
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, submitting, onClose]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!submitting ? onClose : undefined}
      />
      
      
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
        style={{ zIndex: 100000 }}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-100 rounded-xl">
              <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'create' ? '✨ Nueva Área Geográfica' : '✏️ Editar Área'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Dibuja un polígono con los puntos que necesites
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
            title="Cerrar (Esc)"
          >
            <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

  
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="max-w-xl">
              <label htmlFor="area-name" className="block text-sm font-semibold text-gray-700 mb-2">
                📝 Nombre del Área <span className="text-red-500">*</span>
              </label>
              <input
                id="area-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name && e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder="Ej: Zona Centro, Área Industrial Norte, Barrio Sur..."
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.name 
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                    : 'border-gray-200 focus:ring-brand-500 focus:border-brand-500'
                } focus:outline-none focus:ring-2 transition-all`}
                disabled={submitting}
                autoFocus
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Mapa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🗺️ Polígono del Área <span className="text-red-500">*</span>
              </label>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                
                {/* Instrucciones de dibujo */}
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 border border-blue-100">
                  <p className="font-semibold mb-1">📍 Cómo dibujar:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                    <li>Clic en el <strong>hexágono</strong> (arriba derecha) para empezar.</li>
                    <li>Clic en el mapa para añadir puntos (¡sin límite!).</li>
                    <li>Clic en el <strong>primer punto</strong> para cerrar el polígono.</li>
                  </ul>
                </div>

                <AreaMap
                  editMode
                  areas={existingAreas}
                  editingAreaId={initialData?.id}
                  initialPolygon={areaPoints}
                  onPolygonChange={handlePolygonChange}
                  onOverlapError={handleOverlapError}
                  onOverlapResolved={handleOverlapResolved}
                  enableSnapToEdge={true}
                  height="450px"
                />

                <div className="space-y-2">
                  
                  {errors.polygon && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700 border border-red-200">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="font-medium">{errors.polygon}</span>
                    </div>
                  )}

                  {/* Warning de solapamiento */}
                  {overlapWarning && !errors.polygon && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-sm text-amber-700 border border-amber-200">
                      <svg className="w-5 h-5 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="font-medium">⚠️ {overlapWarning} - Ajusta el polígono</span>
                    </div>
                  )}

                  {/* Polígono válido */}
                  {areaPoints && areaPoints.length >= 3 && !errors.polygon && !overlapWarning && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-700 border border-green-200">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">
                        ✅ Polígono válido con {areaPoints.length} puntos
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
            {/* Info adicional */}
            <div className="text-xs text-gray-500 hidden sm:block">
              💡 Tip: El snap automático ajusta los puntos a los bordes de áreas cercanas
            </div>
            
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-400 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !!overlapWarning}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  submitting || overlapWarning
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40'
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {mode === 'create' ? 'Crear Área' : 'Guardar Cambios'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AreaFormModal;
