import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Area } from '../../../domain/entities/Area';
import { apiToLeaflet } from '../../utils/areaHelpers';

// Fix para iconos
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface SingleAreaMapProps {
  area: Area;
  height?: string;
  zoom?: number;
}

const SingleAreaMap: React.FC<SingleAreaMapProps> = ({ 
  area, 
  height = '300px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false, // Static feeling
      doubleClickZoom: false,
      boxZoom: false
    }).setView([0, 0], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Actualizar polígono
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !area.area || area.area.length < 3) return;

    if (polygonLayerRef.current) {
      polygonLayerRef.current.remove();
    }

    const leafletCoords = apiToLeaflet(area.area);
    
    const polygon = L.polygon(leafletCoords, {
      color: '#0f766e', 
      fillColor: '#14b8a6', 
      fillOpacity: 0.4,
      weight: 2
    }).addTo(map);

    polygonLayerRef.current = polygon;
    map.fitBounds(polygon.getBounds(), { padding: [20, 20] });

  }, [area]);

  if (!area.area || area.area.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-gray-500">Área sin geometría definida</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef}
      style={{ height, width: '100%' }} 
      className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative z-0" 
    />
  );
};

export default SingleAreaMap;
