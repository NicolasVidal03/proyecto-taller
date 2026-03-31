import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

type Props = {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
  disabled?: boolean;
  error?: string;
};

const COCHABAMBA = [-17.393, -66.157] as [number, number];

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

export const BusinessMapLocationPicker: React.FC<Props> = ({ lat, lng, onChange, disabled, error }) => {
  const position = lat && lng ? [Number(lat), Number(lng)] as [number, number] : null;

  function MapCenterUpdater({ position }: { position: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.setView(position, map.getZoom());
      }
    }, [position]);
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-lead-700 mb-2">Ubicación</label>

      <div className="flex gap-4">
        <div style={{ width: '60%' }}>
          <div className={`rounded-lg overflow-hidden border border-lead-300 ${error ? 'border-red-500' : 'border-lead-300 bg-white'}`} style={{ height: 240 }}>
            <MapContainer
              center={position ?? COCHABAMBA}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapCenterUpdater position={position} />
              <ClickHandler onMapClick={(lat, lng) => {
                if (!disabled) onChange(lat.toFixed(6), lng.toFixed(6));
              }} />
              {position && <Marker position={position} />}
            </MapContainer>
          </div>
        </div>

        <div className="flex flex-col gap-3 justify-center" style={{ width: 'calc(35% - 1rem)' }}>
          <div>
            <label className="block text-sm font-medium text-lead-700">Latitud</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => onChange(e.target.value, lng)}
              placeholder="-17.393"
              className={`mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${error ? 'border-red-500' : 'border-lead-300 bg-white'
                }`}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-lead-700">Longitud</label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => onChange(lat, e.target.value)}
              placeholder="-66.157"
              className={`mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${error ? 'border-red-500' : 'border-lead-300 bg-white'
                }`}
              disabled={disabled}
            />
          </div>
          {(lat && lng) && (
            <button
              type="button"
              onClick={() => onChange('', '')}
              className="text-xs text-lead-400 hover:text-red-500 transition-colors text-left"
            >
              Limpiar ubicación
            </button>
          )}
          {(!lat || !lng) && (
            <p className="text-xs text-lead-400">Haz clic en el mapa para marcar</p>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
};