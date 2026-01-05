import React, { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import '../../../types/leaflet-draw.d'; // Tipos para leaflet-draw
import {
  Area,
  AreaPoint,
  LeafletPolygonCoords,
} from '../../../domain/entities/Area';
import {
  leafletToApi,
  apiToLeaflet,
  getAreaColor,
} from '../../utils/areaHelpers';
import {
  areaPointsToPoints,
  isPointInPolygon,
  closestPointOnPolygonEdge,
  distance,
  areaPolygonsOverlap,
  isAreaPolygonValid,
  Point,
} from '../../../domain/utils/geometry';

// Fix para iconos de Leaflet en Vite/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ══════════════════════════════════════════════════════════════════════════════

/** Distancia mínima para activar snap (en grados, ~50 metros) */
const SNAP_THRESHOLD = 0.0005;

/** Offset para separar polígonos (en grados, ~5 metros) */
const SNAP_OFFSET = 0.00005;

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ══════════════════════════════════════════════════════════════════════════════

interface AreaMapProps {
  /** Áreas a mostrar en el mapa */
  areas?: Area[];
  /** ID del área seleccionada (se resalta) */
  selectedAreaId?: number | null;
  /** Modo de edición: permite dibujar/editar polígonos */
  editMode?: boolean;
  /** Polígono inicial para edición (array de {lat, lng}) */
  initialPolygon?: AreaPoint[] | null;
  /** Callback cuando se dibuja/edita un polígono */
  onPolygonChange?: (polygon: AreaPoint[] | null) => void;
  /** Callback cuando se hace clic en un área */
  onAreaClick?: (area: Area) => void;
  /** Callback para editar un área */
  onAreaEdit?: (area: Area) => void;
  /** Callback para eliminar un área */
  onAreaDelete?: (area: Area) => void;
  /** Centro inicial del mapa [lat, lng] */
  center?: [number, number];
  /** Zoom inicial */
  zoom?: number;
  /** Altura del contenedor */
  height?: string;
  /** ID del área que se está editando (para excluir de validación) */
  editingAreaId?: number;
  /** Habilitar snap to edge */
  enableSnapToEdge?: boolean;
  /** Callback para notificar errores de solapamiento */
  onOverlapError?: (areaName: string) => void;
  /** Callback cuando el solapamiento se resuelve */
  onOverlapResolved?: () => void;
}

// ══════════════════════════════════════════════════════════════════════════════
// FUNCIONES HELPER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Aplica snap-to-edge a un punto si está cerca del borde de un polígono existente
 */
function applySnapToEdge(
  point: AreaPoint,
  existingPolygons: AreaPoint[][],
  threshold: number = SNAP_THRESHOLD
): AreaPoint {
  const p: Point = { x: point.lng, y: point.lat };
  let bestSnap: Point | null = null;
  let minDist = Infinity;

  for (const polygon of existingPolygons) {
    const polyPoints = areaPointsToPoints(polygon);
    const closest = closestPointOnPolygonEdge(p, polyPoints);
    const d = distance(p, closest);

    if (d < threshold && d < minDist) {
      minDist = d;
      bestSnap = closest;
    }
  }

  if (bestSnap) {
    return { lat: bestSnap.y, lng: bestSnap.x };
  }

  return point;
}

/**
 * Ajusta un punto que está dentro de un polígono existente,
 * moviéndolo al borde más cercano + un pequeño offset
 */
function snapPointOutsidePolygons(
  point: AreaPoint,
  existingPolygons: AreaPoint[][],
  offset: number = SNAP_OFFSET
): AreaPoint {
  const p: Point = { x: point.lng, y: point.lat };

  for (const polygon of existingPolygons) {
    const polyPoints = areaPointsToPoints(polygon);

    if (isPointInPolygon(p, polyPoints)) {
      // Encontrar el punto más cercano en el borde
      const closestOnEdge = closestPointOnPolygonEdge(p, polyPoints);

      // Calcular dirección desde el centro hacia afuera
      const centerX = polyPoints.reduce((s, pt) => s + pt.x, 0) / polyPoints.length;
      const centerY = polyPoints.reduce((s, pt) => s + pt.y, 0) / polyPoints.length;

      let dx = closestOnEdge.x - centerX;
      let dy = closestOnEdge.y - centerY;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len > 0) {
        dx /= len;
        dy /= len;
      }

      // Devolver punto en el borde + offset hacia afuera
      return {
        lat: closestOnEdge.y + dy * offset,
        lng: closestOnEdge.x + dx * offset,
      };
    }
  }

  return point;
}

/**
 * Procesa todo un polígono aplicando snap-to-edge y ajuste de puntos internos
 */
function processPolygonWithSnap(
  polygon: AreaPoint[],
  existingPolygons: AreaPoint[][],
  enableSnap: boolean
): AreaPoint[] {
  if (!enableSnap || polygon.length < 3) return polygon;

  return polygon.map(point => {
    // Primero intentar snap to edge si está cerca
    let processed = applySnapToEdge(point, existingPolygons);
    
    // Luego mover afuera si está dentro de algún polígono
    processed = snapPointOutsidePolygons(processed, existingPolygons);
    
    return processed;
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Componente de Mapa con Leaflet + OpenStreetMap
 * 
 * Características:
 * - Visualiza áreas como polígonos coloreados
 * - Modo edición con leaflet-draw para crear/editar polígonos
 * - Snap-to-edge: ajusta puntos al borde de áreas existentes
 * - Detección de solapamiento en tiempo real
 * - Permite polígonos de cualquier número de puntos (mínimo 3)
 * - Click en áreas para seleccionar
 */
const AreaMap: React.FC<AreaMapProps> = ({
  areas = [],
  selectedAreaId,
  editMode = false,
  initialPolygon,
  onPolygonChange,
  onAreaClick,
  onAreaEdit,
  onAreaDelete,
  center = [-17.3935, -66.1570], // Cochabamba, Bolivia
  zoom = 12,
  height = '500px',
  editingAreaId,
  enableSnapToEdge = true,
  onOverlapError,
  onOverlapResolved,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const areasLayerRef = useRef<L.FeatureGroup | null>(null);
  const drawLayerRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const [hasOverlap, setHasOverlap] = useState(false);
  const [invalidPolygon, setInvalidPolygon] = useState(false);

  // Obtener polígonos existentes (excluyendo el que se está editando)
  const getExistingPolygons = useCallback((): AreaPoint[][] => {
    return areas
      .filter(a => a.id !== editingAreaId && a.area && a.area.length >= 3)
      .map(a => a.area!)
      .filter((area): area is AreaPoint[] => area !== undefined);
  }, [areas, editingAreaId]);

  // Verificar solapamiento y notificar
  const checkAndNotifyOverlap = useCallback((
    polygon: AreaPoint[]
  ): boolean => {
    if (polygon.length < 3) return false;

    for (const area of areas) {
      if (editingAreaId && area.id === editingAreaId) continue;
      if (!area.area || area.area.length < 3) continue;

      if (areaPolygonsOverlap(polygon, area.area)) {
        setHasOverlap(true);
        onOverlapError?.(area.name);
        return true;
      }
    }

    setHasOverlap(false);
    onOverlapResolved?.();
    return false;
  }, [areas, editingAreaId, onOverlapError, onOverlapResolved]);

  // Refs para acceso en handlers sin reiniciar efecto
  const onPolygonChangeRef = useRef(onPolygonChange);
  onPolygonChangeRef.current = onPolygonChange;
  
  const checkAndNotifyOverlapRef = useRef(checkAndNotifyOverlap);
  checkAndNotifyOverlapRef.current = checkAndNotifyOverlap;

  const enableSnapToEdgeRef = useRef(enableSnapToEdge);
  enableSnapToEdgeRef.current = enableSnapToEdge;

  const getExistingPolygonsRef = useRef(getExistingPolygons);
  getExistingPolygonsRef.current = getExistingPolygons;

  const onOverlapErrorRef = useRef(onOverlapError);
  onOverlapErrorRef.current = onOverlapError;

  const onOverlapResolvedRef = useRef(onOverlapResolved);
  onOverlapResolvedRef.current = onOverlapResolved;

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(center, zoom);

    // Capa de tiles con estilo limpio
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    areasLayerRef.current = new L.FeatureGroup().addTo(map);
    drawLayerRef.current = new L.FeatureGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Manejar modo edición con leaflet-draw
  useEffect(() => {
    const map = mapRef.current;
    const drawLayer = drawLayerRef.current;
    if (!map || !drawLayer) return;

    // Limpiar control anterior
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    if (editMode) {
      // Configurar control de dibujo - permite N puntos
      const drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
          polygon: {
            allowIntersection: true,  // Permitir mientras dibuja para fluidez
            showArea: true,
            showLength: true, // Mostrar longitud de lados
            metric: true,
            drawError: {
              color: '#e1e1e1',
              message: '<strong>¡Error!</strong>' // Esto solo sale si allowIntersection es false
            },
            shapeOptions: {
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.2,
              weight: 2,
            },
            // Guía visual mientras dibujas
            guidelineDistance: 10,
            // Repetir modo (para crear múltiples polígonos seguidos)
            repeatMode: false,
          },
          // Deshabilitar otras formas
          polyline: false,
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
        },
        edit: {
          featureGroup: drawLayer,
          remove: true,
        },
      });

      map.addControl(drawControl);
      drawControlRef.current = drawControl;

      // Handler: Polígono creado
      const handleCreated = (e: L.LeafletEvent) => {
        const event = e as L.DrawEvents.Created;
        
        // Limpiar capas anteriores
        drawLayer.clearLayers();
        
        // Obtener coordenadas del polígono dibujado
        const latLngs = (event.layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
        const coords: LeafletPolygonCoords = latLngs.map(ll => [ll.lat, ll.lng]);
        let apiPoints = leafletToApi(coords);

        // Validar auto-intersección
        if (!isAreaPolygonValid(apiPoints)) {
          setInvalidPolygon(true);
          // Dibujar en rojo para indicar error
          const invalidPoly = L.polygon(latLngs, {
            color: '#EF4444',
            fillColor: '#EF4444',
            fillOpacity: 0.3,
            dashArray: '5, 5'
          });
          drawLayer.addLayer(invalidPoly);
          onPolygonChangeRef.current?.(null); // No guardar
          return;
        }
        setInvalidPolygon(false);

        // Aplicar snap-to-edge si está habilitado
        if (enableSnapToEdgeRef.current) {
          apiPoints = processPolygonWithSnap(
            apiPoints,
            getExistingPolygonsRef.current(),
            true
          );

          // Recrear el polígono con los puntos ajustados
          const adjustedCoords = apiToLeaflet(apiPoints);
          const adjustedPolygon = L.polygon(adjustedCoords, {
            color: '#3B82F6', // Color base, luego se actualiza si hay overlap
            fillColor: '#3B82F6',
            fillOpacity: 0.3,
            weight: 2,
          });
          drawLayer.addLayer(adjustedPolygon);
        } else {
          drawLayer.addLayer(event.layer);
        }

        // Verificar solapamiento
        const overlaps = checkAndNotifyOverlapRef.current(apiPoints);
        
        // Actualizar color si hay solapamiento
        drawLayer.eachLayer((layer) => {
          if (layer instanceof L.Polygon) {
            if (overlaps) {
              layer.setStyle({ color: '#EF4444', fillColor: '#EF4444' });
            } else {
              layer.setStyle({ color: '#3B82F6', fillColor: '#3B82F6' });
            }
          }
        });
        
        // Notificar cambio
        onPolygonChangeRef.current?.(apiPoints);
      };

      // Handler: Polígono editado
      const handleEdited = (e: L.LeafletEvent) => {
        const event = e as L.DrawEvents.Edited;
        
        event.layers.eachLayer((layer) => {
          const latLngs = (layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
          const coords: LeafletPolygonCoords = latLngs.map(ll => [ll.lat, ll.lng]);
          let apiPoints = leafletToApi(coords);

          // Validar auto-intersección
          if (!isAreaPolygonValid(apiPoints)) {
            setInvalidPolygon(true);
            (layer as L.Polygon).setStyle({
              color: '#EF4444',
              fillColor: '#EF4444',
              dashArray: '5, 5'
            });
            onPolygonChangeRef.current?.(null);
            return;
          }
          setInvalidPolygon(false);

          // Aplicar snap-to-edge
          if (enableSnapToEdgeRef.current) {
            apiPoints = processPolygonWithSnap(
              apiPoints,
              getExistingPolygonsRef.current(),
              true
            );

            // Actualizar el polígono visualmente
            const adjustedCoords = apiToLeaflet(apiPoints);
            (layer as L.Polygon).setLatLngs(adjustedCoords);
          }

          // Verificar solapamiento
          const overlaps = checkAndNotifyOverlapRef.current(apiPoints);

          // Actualizar estilo
          if (overlaps) {
            (layer as L.Polygon).setStyle({ color: '#EF4444', fillColor: '#EF4444', dashArray: undefined });
          } else {
            (layer as L.Polygon).setStyle({ color: '#3B82F6', fillColor: '#3B82F6', dashArray: undefined });
          }

          onPolygonChangeRef.current?.(apiPoints);
        });
      };

      // Handler: Polígono eliminado
      const handleDeleted = () => {
        setHasOverlap(false);
        setInvalidPolygon(false);
        onOverlapResolvedRef.current?.();
        onPolygonChangeRef.current?.(null);
      };

      // Registrar eventos
      map.on(L.Draw.Event.CREATED, handleCreated);
      map.on(L.Draw.Event.EDITED, handleEdited);
      map.on(L.Draw.Event.DELETED, handleDeleted);

      return () => {
        map.off(L.Draw.Event.CREATED, handleCreated);
        map.off(L.Draw.Event.EDITED, handleEdited);
        map.off(L.Draw.Event.DELETED, handleDeleted);
      };
    }
  }, [editMode]); // Solo depende de editMode para evitar reinicios

  // Cargar polígono inicial en modo edición
  useEffect(() => {
    const drawLayer = drawLayerRef.current;
    const map = mapRef.current;
    if (!drawLayer || !editMode) return;

    drawLayer.clearLayers();

    if (initialPolygon && initialPolygon.length >= 3) {
      const leafletCoords = apiToLeaflet(initialPolygon);
      
      // Verificar si hay solapamiento inicial
      const overlaps = checkAndNotifyOverlap(initialPolygon);
      
      const polygon = L.polygon(leafletCoords, {
        color: overlaps ? '#EF4444' : '#3B82F6',
        fillColor: overlaps ? '#EF4444' : '#3B82F6',
        fillOpacity: 0.3,
        weight: 2,
      });
      
      drawLayer.addLayer(polygon);
      map?.fitBounds(polygon.getBounds(), { padding: [50, 50] });
    }
  }, [initialPolygon, editMode, checkAndNotifyOverlap]);

  // Dibujar áreas en modo visualización
  useEffect(() => {
    const areasLayer = areasLayerRef.current;
    const map = mapRef.current;
    if (!areasLayer || !map) return;

    areasLayer.clearLayers();

    if (!areas || areas.length === 0) return;

    // En modo edición, mostrar áreas existentes como referencia (semi-transparentes)
    const displayAreas = editMode 
      ? areas.filter(a => a.id !== editingAreaId)
      : areas;

    displayAreas.forEach((area) => {
      if (!area.area || area.area.length < 3) return;
      
      const leafletCoords = apiToLeaflet(area.area);
      const isSelected = selectedAreaId === area.id;
      const color = getAreaColor(area.id || 0);

      // En modo edición: mostrar áreas existentes más transparentes
      const opacity = editMode ? 0.25 : (isSelected ? 0.6 : 0.45);
      const borderOpacity = editMode ? 0.5 : (isSelected ? 1 : 0.8);

      const polygon = L.polygon(leafletCoords, {
        color: isSelected ? '#000000' : color,
        fillColor: color,
        fillOpacity: opacity,
        weight: isSelected ? 3 : 2,
        opacity: borderOpacity,
      });

      // Tooltip con nombre
      if (!editMode || area.id !== editingAreaId) {
        polygon.bindTooltip(area.name, {
          permanent: !editMode,
          direction: 'center',
          className: 'area-label',
        });
      }

      // Click solo en modo visualización
      if (!editMode) {
        // Si hay callbacks de editar/eliminar, mostrar popup con opciones
        if (onAreaEdit || onAreaDelete) {
          const popupContent = document.createElement('div');
          popupContent.className = 'area-popup-content';
          popupContent.innerHTML = `
            <div style="padding: 8px; min-width: 150px;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px; color: #1f2937;">${area.name}</h4>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #6b7280;">${area.area?.length || 0} puntos</p>
              <div style="display: flex; gap: 8px;">
                ${onAreaEdit ? `<button id="edit-area-${area.id}" style="flex: 1; padding: 6px 12px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">✏️ Editar</button>` : ''}
                ${onAreaDelete ? `<button id="delete-area-${area.id}" style="flex: 1; padding: 6px 12px; background: #EF4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">🗑️ Eliminar</button>` : ''}
              </div>
            </div>
          `;
          
          polygon.bindPopup(popupContent, { 
            closeButton: true,
            className: 'area-popup'
          });

          polygon.on('popupopen', () => {
            const editBtn = document.getElementById(`edit-area-${area.id}`);
            const deleteBtn = document.getElementById(`delete-area-${area.id}`);
            
            if (editBtn && onAreaEdit) {
              editBtn.onclick = () => {
                polygon.closePopup();
                onAreaEdit(area);
              };
            }
            if (deleteBtn && onAreaDelete) {
              deleteBtn.onclick = () => {
                polygon.closePopup();
                onAreaDelete(area);
              };
            }
          });
        }

        polygon.on('click', () => {
          onAreaClick?.(area);
        });

        // Hover effect
        polygon.on('mouseover', () => {
          if (!isSelected) {
            polygon.setStyle({ fillOpacity: 0.65, weight: 3 });
          }
        });
        polygon.on('mouseout', () => {
          if (!isSelected) {
            polygon.setStyle({ fillOpacity: 0.45, weight: 2 });
          }
        });
      }

      areasLayer.addLayer(polygon);
    });

    // Ajustar vista si no hay área seleccionada y no estamos en modo edición
    if (!editMode && areas.length > 0 && !selectedAreaId) {
      try {
        map.fitBounds(areasLayer.getBounds(), { padding: [50, 50] });
      } catch (e) {
        // Si no hay bounds válidos, no hacer nada
      }
    }
  }, [areas, selectedAreaId, editMode, editingAreaId, onAreaClick]);

  // Centrar en área seleccionada
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedAreaId || editMode) return;

    const selectedArea = areas.find(a => a.id === selectedAreaId);
    if (!selectedArea || !selectedArea.area || selectedArea.area.length < 3) return;

    const leafletCoords = apiToLeaflet(selectedArea.area);
    const polygon = L.polygon(leafletCoords);
    map.fitBounds(polygon.getBounds(), { padding: [100, 100] });
  }, [selectedAreaId, areas, editMode]);

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="rounded-xl overflow-hidden border border-gray-200 shadow-sm"
      />
      
      {/* Indicador de modo edición */}
      {editMode && (
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
          <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
            <span className="animate-pulse">●</span>
            Modo Edición
          </div>
          
          {hasOverlap && (
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs animate-pulse">
              ⚠️ Solapamiento detectado
            </div>
          )}
          
          {invalidPolygon && (
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs animate-pulse">
              ❌ Polígono inválido (se cruza)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AreaMap;
