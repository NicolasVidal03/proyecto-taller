import React from 'react';
import { Area } from '../../../domain/entities/Area';
import { getAreaColor } from '../../utils/areaHelpers';

interface AreaTableProps {

  areas: Area[];
  loading?: boolean;
  selectedAreaId?: number | null;
  onSelect?: (area: Area) => void;
  onEdit?: (area: Area) => void;
  onDelete?: (area: Area) => void;
}

const AreaTable: React.FC<AreaTableProps> = ({
  areas,
  loading = false,
  selectedAreaId,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const getPointCount = (area: Area): number => {
    return area.area?.length || 0;
  };

  if (loading) {
    return (
      <div className="bg-lead-50 rounded-xl shadow-sm border border-lead-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-lead-200 bg-lead-100">
          <h3 className="text-sm font-semibold text-lead-700">Lista de Zonas</h3>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-500 mx-auto"></div>
          <p className="mt-3 text-sm text-lead-500">Cargando áreas...</p>
        </div>
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <div className="bg-lead-50 rounded-xl shadow-sm border border-lead-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-lead-200 bg-lead-100">
          <h3 className="text-sm font-semibold text-lead-700">Lista de Zonas</h3>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-lead-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🗺️</span>
          </div>
          <p className="text-lead-600 font-medium">No hay áreas registradas</p>
          <p className="text-sm text-lead-400 mt-1">Crea tu primera zona de cobertura</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-lead-50 rounded-xl shadow-sm border border-lead-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-lead-200 bg-lead-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-lead-700">Lista de Zonas</h3>
        <span className="text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded-full font-medium">
          {areas.length}
        </span>
      </div>

      <div className={`divide-y divide-lead-100 ${areas.length >= 4 ? 'max-h-[250px] overflow-y-auto' : ''}`}>
        {areas.map((area) => {
          const isSelected = selectedAreaId === area.id;
          const color = getAreaColor(area.id || 0);
          
          return (
            <div
              key={area.id}
              onClick={() => onSelect?.(area)}
              className={`p-3 transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-accent-50 border-l-4 border-l-accent-500' 
                  : 'hover:bg-lead-100 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-sm shrink-0 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                
               
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm truncate ${
                    isSelected ? 'text-accent-700' : 'text-lead-800'
                  }`}>
                    {area.name}
                  </h4>
                  <p className="text-xs text-lead-400">
                    {getPointCount(area)} puntos
                  </p>
                </div>

               
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit?.(area); }}
                    title="Editar"
                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete?.(area); }}
                    title="Eliminar"
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AreaTable;
