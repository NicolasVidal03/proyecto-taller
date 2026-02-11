import React, { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import '../../../types/leaflet-draw.d';
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

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SNAP_THRESHOLD = 0.0005;
const SNAP_OFFSET = 0.00005;

interface AreaMapProps {
  areas?: Area[];
  selectedAreaId?: number | null;
  editMode?: boolean;
  initialPolygon?: AreaPoint[] | null;
  onPolygonChange?: (polygon: AreaPoint[] | null) => void;
  onAreaClick?: (area: Area) => void;
  onAreaEdit?: (area: Area) => void;
  onAreaDelete?: (area: Area) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  editingAreaId?: number;
  enableSnapToEdge?: boolean;
  onOverlapError?: (areaName: string) => void;
  onOverlapResolved?: () => void;
}

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

function snapPointOutsidePolygons(
  point: AreaPoint,
  existingPolygons: AreaPoint[][],
  offset: number = SNAP_OFFSET
): AreaPoint {
  const p: Point = { x: point.lng, y: point.lat };

  for (const polygon of existingPolygons) {
    const polyPoints = areaPointsToPoints(polygon);

    if (isPointInPolygon(p, polyPoints)) {
      const closestOnEdge = closestPointOnPolygonEdge(p, polyPoints);

      const centerX = polyPoints.reduce((s, pt) => s + pt.x, 0) / polyPoints.length;
      const centerY = polyPoints.reduce((s, pt) => s + pt.y, 0) / polyPoints.length;

      let dx = closestOnEdge.x - centerX;
      let dy = closestOnEdge.y - centerY;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len > 0) {
        dx /= len;
        dy /= len;
      }
      return {
        lat: closestOnEdge.y + dy * offset,
        lng: closestOnEdge.x + dx * offset,
      };
    }
  }

  return point;
}

function processPolygonWithSnap(
  polygon: AreaPoint[],
  existingPolygons: AreaPoint[][],
  enableSnap: boolean
): AreaPoint[] {
  if (!enableSnap || polygon.length < 3) return polygon;

  return polygon.map(point => {
    let processed = applySnapToEdge(point, existingPolygons);
    processed = snapPointOutsidePolygons(processed, existingPolygons);
    return processed;
  });
}

const AreaMap: React.FC<AreaMapProps> = ({
  areas = [],
  selectedAreaId,
  editMode = false,
  initialPolygon,
  onPolygonChange,
  onAreaClick,
  onAreaEdit,
  onAreaDelete,
  center = [-17.3935, -66.1570],
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

  const getExistingPolygons = useCallback((): AreaPoint[][] => {
    return areas
      .filter(a => a.id !== editingAreaId && a.area && a.area.length >= 3)
      .map(a => a.area!)
      .filter((area): area is AreaPoint[] => area !== undefined);
  }, [areas, editingAreaId]);

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

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(center, zoom);

    if (editMode) {
      map.zoomControl.setPosition('bottomright');
    } else {
      map.zoomControl.setPosition('topleft');
    }

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (editMode) {
      map.zoomControl.setPosition('bottomright');
    } else {
      map.zoomControl.setPosition('topleft');
    }
  }, [editMode]);

  useEffect(() => {
    const map = mapRef.current;
    const drawLayer = drawLayerRef.current;
    if (!map || !drawLayer) return;

    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    if (editMode) {
      const drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
          polygon: {
            allowIntersection: true,
            showArea: true,
            showLength: true,
            metric: true,
            drawError: {
              color: '#e1e1e1',
              message: '<strong>¡Error!</strong>'
            },
            shapeOptions: {
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.2,
              weight: 2,
            },
            guidelineDistance: 10,
            repeatMode: false,
          },
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

      const handleCreated = (e: L.LeafletEvent) => {
        const event = e as L.DrawEvents.Created;
        
        drawLayer.clearLayers();
        
        const latLngs = (event.layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
        const coords: LeafletPolygonCoords = latLngs.map(ll => [ll.lat, ll.lng]);
        let apiPoints = leafletToApi(coords);

        if (!isAreaPolygonValid(apiPoints)) {
          setInvalidPolygon(true);
          const invalidPoly = L.polygon(latLngs, {
            color: '#EF4444',
            fillColor: '#EF4444',
            fillOpacity: 0.3,
            dashArray: '5, 5'
          });
          drawLayer.addLayer(invalidPoly);
          onPolygonChangeRef.current?.(null);
          return;
        }
        setInvalidPolygon(false);

        if (enableSnapToEdgeRef.current) {
          apiPoints = processPolygonWithSnap(
            apiPoints,
            getExistingPolygonsRef.current(),
            true
          );

          const adjustedCoords = apiToLeaflet(apiPoints);
          const adjustedPolygon = L.polygon(adjustedCoords, {
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.3,
            weight: 2,
          });
          drawLayer.addLayer(adjustedPolygon);
        } else {
          drawLayer.addLayer(event.layer);
        }

        const overlaps = checkAndNotifyOverlapRef.current(apiPoints);
        
        drawLayer.eachLayer((layer) => {
          if (layer instanceof L.Polygon) {
            if (overlaps) {
              layer.setStyle({ color: '#EF4444', fillColor: '#EF4444' });
            } else {
              layer.setStyle({ color: '#3B82F6', fillColor: '#3B82F6' });
            }
          }
        });
        
        onPolygonChangeRef.current?.(apiPoints);
      };

      const handleEdited = (e: L.LeafletEvent) => {
        const event = e as L.DrawEvents.Edited;
        
        event.layers.eachLayer((layer) => {
          const latLngs = (layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
          const coords: LeafletPolygonCoords = latLngs.map(ll => [ll.lat, ll.lng]);
          let apiPoints = leafletToApi(coords);

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

          if (enableSnapToEdgeRef.current) {
            apiPoints = processPolygonWithSnap(
              apiPoints,
              getExistingPolygonsRef.current(),
              true
            );

            const adjustedCoords = apiToLeaflet(apiPoints);
            (layer as L.Polygon).setLatLngs(adjustedCoords);
          }

          const overlaps = checkAndNotifyOverlapRef.current(apiPoints);

          if (overlaps) {
            (layer as L.Polygon).setStyle({ color: '#EF4444', fillColor: '#EF4444', dashArray: undefined });
          } else {
            (layer as L.Polygon).setStyle({ color: '#3B82F6', fillColor: '#3B82F6', dashArray: undefined });
          }

          onPolygonChangeRef.current?.(apiPoints);
        });
      };

      const handleDeleted = () => {
        setHasOverlap(false);
        setInvalidPolygon(false);
        onOverlapResolvedRef.current?.();
        onPolygonChangeRef.current?.(null);
      };

      map.on(L.Draw.Event.CREATED, handleCreated);
      map.on(L.Draw.Event.EDITED, handleEdited);
      map.on(L.Draw.Event.DELETED, handleDeleted);

      return () => {
        map.off(L.Draw.Event.CREATED, handleCreated);
        map.off(L.Draw.Event.EDITED, handleEdited);
        map.off(L.Draw.Event.DELETED, handleDeleted);
      };
    }
  }, [editMode]);

  useEffect(() => {
    const drawLayer = drawLayerRef.current;
    const map = mapRef.current;
    if (!drawLayer || !editMode) return;

    drawLayer.clearLayers();

    if (initialPolygon && initialPolygon.length >= 3) {
      const leafletCoords = apiToLeaflet(initialPolygon);
      
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

  useEffect(() => {
    const areasLayer = areasLayerRef.current;
    const map = mapRef.current;
    if (!areasLayer || !map) return;

    areasLayer.clearLayers();

    if (!areas || areas.length === 0) return;

    const displayAreas = editMode 
      ? areas.filter(a => a.id !== editingAreaId)
      : areas;

    displayAreas.forEach((area) => {
      if (!area.area || area.area.length < 3) return;
      
      const leafletCoords = apiToLeaflet(area.area);
      const isSelected = selectedAreaId === area.id;
      const color = getAreaColor(area.id || 0);

      const opacity = editMode ? 0.25 : (isSelected ? 0.6 : 0.45);
      const borderOpacity = editMode ? 0.5 : (isSelected ? 1 : 0.8);

      const polygon = L.polygon(leafletCoords, {
        color: isSelected ? '#000000' : color,
        fillColor: color,
        fillOpacity: opacity,
        weight: isSelected ? 3 : 2,
        opacity: borderOpacity,
      });

      if (!editMode || area.id !== editingAreaId) {
        polygon.bindTooltip(area.name, {
          permanent: !editMode,
          direction: 'center',
          className: 'area-label',
        });
      }

      if (!editMode) {
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

    if (!editMode && areas.length > 0 && !selectedAreaId) {
      try {
        map.fitBounds(areasLayer.getBounds(), { padding: [50, 50] });
      } catch (e) {
      }
    }
  }, [areas, selectedAreaId, editMode, editingAreaId, onAreaClick]);

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
