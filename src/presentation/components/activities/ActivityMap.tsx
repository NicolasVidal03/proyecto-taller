import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ActivityWork } from '../../../domain/entities/ActivityWork';

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Iconos personalizados por estado de actividad
const createCustomIcon = (color: string, borderColor: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      "></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const ICONS = {
  visited: createCustomIcon('#22c55e', '#166534'),   // Verde - visitado
  sold: createCustomIcon('#3b82f6', '#1d4ed8'),      // Azul - vendido
  rejected: createCustomIcon('#ef4444', '#b91c1c'), // Rojo - rechazado
  pending: createCustomIcon('#94a3b8', '#64748b'),  // Gris - sin actividad
};

const getActivityStatus = (activity: ActivityWork['activity']): keyof typeof ICONS => {
  if (!activity.action) return 'pending';
  const action = activity.action.toLowerCase();
  if (action === 'sold' || action === 'venta') return 'sold';
  if (action === 'rejected' || action === 'rechazado') return 'rejected';
  if (action === 'visited' || action === 'visitado') return 'visited';
  return 'visited';
};

const getStatusLabel = (status: keyof typeof ICONS): string => {
  switch (status) {
    case 'sold': return 'Venta realizada';
    case 'rejected': return 'Rechazado';
    case 'visited': return 'Visitado';
    case 'pending': return 'Sin visitar';
    default: return 'Desconocido';
  }
};

const getStatusColor = (status: keyof typeof ICONS): string => {
  switch (status) {
    case 'sold': return 'text-blue-600';
    case 'rejected': return 'text-red-600';
    case 'visited': return 'text-green-600';
    case 'pending': return 'text-gray-500';
    default: return 'text-gray-500';
  }
};

interface ActivityMapProps {
  activities: ActivityWork[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (activity: ActivityWork) => void;
}

const ActivityMap: React.FC<ActivityMapProps> = ({
  activities,
  height = '500px',
  center = [-17.3935, -66.1570],
  zoom = 13,
  onMarkerClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = new L.FeatureGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Actualizar marcadores cuando cambien las actividades
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (activities.length === 0) return;

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    activities.forEach((activityWork) => {
      const { business, activity } = activityWork;
      
      if (!business.position || !business.position.lat || !business.position.lng) return;

      const status = getActivityStatus(activity);
      const icon = ICONS[status];
      
      const marker = L.marker([business.position.lat, business.position.lng], { icon });

      // Crear contenido del popup
      const popupContent = `
        <div style="min-width: 200px; font-family: 'Inter', system-ui, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #1e293b;">
            ${business.name}
          </h3>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #475569;">
            ${business.nit ? `<p style="margin: 0;"><strong>NIT:</strong> ${business.nit}</p>` : ''}
            ${business.address ? `<p style="margin: 0;"><strong>Dirección:</strong> ${business.address}</p>` : ''}
          </div>
          <hr style="margin: 10px 0; border: none; border-top: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="
              width: 10px; 
              height: 10px; 
              border-radius: 50%; 
              background: ${status === 'sold' ? '#3b82f6' : status === 'rejected' ? '#ef4444' : status === 'visited' ? '#22c55e' : '#94a3b8'};
            "></span>
            <span style="font-size: 12px; font-weight: 600; color: ${status === 'sold' ? '#1d4ed8' : status === 'rejected' ? '#b91c1c' : status === 'visited' ? '#166534' : '#64748b'};">
              ${getStatusLabel(status)}
            </span>
          </div>
          ${activity.createdAt ? `
            <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">
              ${new Date(activity.createdAt).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'activity-popup',
      });

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(activityWork));
      }

      markersLayer.addLayer(marker);
      bounds.extend([business.position.lat, business.position.lng]);
    });

    // Ajustar vista para mostrar todos los marcadores
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [activities, onMarkerClick]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = activities.length;
    const visited = activities.filter(a => getActivityStatus(a.activity) === 'visited').length;
    const sold = activities.filter(a => getActivityStatus(a.activity) === 'sold').length;
    const rejected = activities.filter(a => getActivityStatus(a.activity) === 'rejected').length;
    const pending = activities.filter(a => getActivityStatus(a.activity) === 'pending').length;
    
    return { total, visited, sold, rejected, pending };
  }, [activities]);

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="rounded-xl overflow-hidden border border-gray-200 shadow-sm"
      />
      
      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Leyenda</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-700"></span>
            <span className="text-xs text-gray-600">Visitado ({stats.visited})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-700"></span>
            <span className="text-xs text-gray-600">Venta ({stats.sold})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700"></span>
            <span className="text-xs text-gray-600">Rechazado ({stats.rejected})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400 border-2 border-gray-600"></span>
            <span className="text-xs text-gray-600">Sin visitar ({stats.pending})</span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-1">Total de negocios</p>
        <p className="text-2xl font-bold text-brand-700">{stats.total}</p>
      </div>
    </div>
  );
};

export default ActivityMap;
