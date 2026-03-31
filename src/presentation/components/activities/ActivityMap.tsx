import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity, ActivityBusinesses, ActivityDetails } from '../../../domain/entities/Activity';

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
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="-2 -2 32 40">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
          fill="${color}" stroke="${borderColor}" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="white"/>
      </svg>
    `,
    iconSize: [32, 36],
    iconAnchor: [16, 36],
    popupAnchor: [0, -36],
  });
};

const ICONS = {
  visited: createCustomIcon('#22c55e', '#166534'),   // Verde - visitado
  sold: createCustomIcon('#2e7d32', '#215724'),      // Azul - vendido
  rejected: createCustomIcon('#ef4444', '#b91c1c'),  // Rojo - rechazado
  presale: createCustomIcon('#E65100', '#a04310'),
  pending: createCustomIcon('#f50000', '#b40e0e'),  // Gris - sin actividad
};

const getActivityStatus = (activityDetail: ActivityDetails | null): keyof typeof ICONS => {
  if (!activityDetail) return 'pending';
  if (activityDetail.rejectionId) return 'rejected';
  const action = activityDetail.action.toLowerCase();
  if (action === 'venta') return 'sold';
  if (action === 'preventa') return 'presale';
  if (action === 'visitado') return 'visited';
  return 'pending';
};

const getStatusLabel = (status: keyof typeof ICONS): string => {
  switch (status) {
    case 'sold': return 'Venta realizada';
    case 'presale': return 'Preventa';
    case 'visited': return 'Visitado';
    case 'pending': return 'Sin visitar';
    case 'rejected': return 'Cancelado';
    default: return 'Desconocido';
  }
};

// const getStatusColor = (status: keyof typeof ICONS): string => {
//   switch (status) {
//     case 'sold': return 'text-blue-600';
//     case 'presale': return 'text-red-600';
//     case 'visited': return 'text-green-600';
//     case 'pending': return 'text-gray-500';
//     default: return 'text-gray-500';
//   }
// };

interface ActivityMapProps {
  activities: Activity;
  height?: string;
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (activity: ActivityBusinesses) => void;
  userRole?: string;
}

const ActivityMap: React.FC<ActivityMapProps> = ({
  activities,
  userRole,
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

  console.log(activities)

  // Actualizar marcadores cuando cambien las actividades
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (!activities.businesses) return;

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    activities.businesses.forEach((Activity) => {
      const { business, activityDetail } = Activity;

      if (!business.position || !business.position.lat || !business.position.lng) return;

      const status = getActivityStatus(activityDetail);
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
              background: ${status === 'sold' ? '#3b82f6' : status === 'presale' ? '#962bd4' : status === 'visited' ? '#22c55e' : status === 'rejected' ? '#ef4444' : '#94a3b8'};
            "></span>
            <span style="font-size: 12px; font-weight: 600; color: ${status === 'sold' ? '#1d4ed8' : status === 'presale' ? '#741ba8' : status === 'visited' ? '#166534' : status === 'rejected' ? '#b91c1c' : '#64748b'};">
              ${getStatusLabel(status)}
            </span>
          </div>
          ${activityDetail ? `
            <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">
              ${new Date(activityDetail.createdAt).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'activity-popup',
        autoClose: true,
      });

      marker.on('popupopen', () => {
        setTimeout(() => {
          marker.closePopup();
        }, 2500);
      });

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(Activity));
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
    const total = activities.businesses?.length;
    const visited = activities.businesses?.filter(a => getActivityStatus(a.activityDetail) === 'visited').length;
    const sold = activities.businesses?.filter(a => getActivityStatus(a.activityDetail) === 'sold').length;
    const presale = activities.businesses?.filter(a => getActivityStatus(a.activityDetail) === 'presale').length;
    const rejected = activities.businesses?.filter(a => getActivityStatus(a.activityDetail) === 'presale').length;
    const pending = activities.businesses?.filter(a => getActivityStatus(a.activityDetail) === 'pending').length;

    return { total, visited, sold, rejected, pending, presale };
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
          {userRole === 'transportista' && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-700"></span>
              <span className="text-xs text-gray-600">Venta ({stats.sold})</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 border-2 border-purple-700"></span>
            <span className="text-xs text-gray-600">Preventa ({stats.presale})</span>
          </div>
          {userRole === 'transportista' && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700"></span>
              <span className="text-xs text-gray-600">Rechazado ({stats.rejected})</span>
            </div>
          )}
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
