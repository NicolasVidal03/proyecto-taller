# 🗺️ Módulo de Áreas Geográficas (GIS)

## Descripción

Módulo de Gestión de Áreas Geográficas implementado con arquitectura GIS profesional, utilizando **tecnologías 100% Open Source** sin dependencias de servicios de pago como Google Maps.

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Base de Datos** | PostgreSQL + PostGIS | Extensión espacial líder en la industria |
| **Formato de Datos** | GeoJSON RFC 7946 | Estándar interoperabilidad web |
| **Sistema de Coordenadas** | SRID 4326 (WGS84) | Estándar GPS mundial |
| **Mapas Frontend** | Leaflet + OpenStreetMap | 100% gratuito y open source |
| **Herramientas de Dibujo** | leaflet-draw | Plugin oficial de Leaflet |
| **Backend** | Node.js + Express + TypeORM | Stack TypeScript consistente |

### Diagrama de Flujo de Datos

```
┌──────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐    │
│   │   Leaflet   │────│ leaflet-draw │────│ Conversión GeoJSON  │    │
│   │   (Mapa)    │    │  (Dibujo)    │    │ [lat,lng]⇄[lng,lat] │    │
│   └─────────────┘    └──────────────┘    └─────────────────────┘    │
│         │                    │                      │                │
│         └────────────────────┴──────────────────────┘                │
│                              │                                       │
│                    ┌─────────▼──────────┐                           │
│                    │  HTTP Repository   │                           │
│                    │  (Axios Client)    │                           │
│                    └────────────────────┘                           │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │    REST API          │
                    │    GeoJSON I/O       │
                    └──────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────┐
│                           BACKEND                                     │
├──────────────────────────────┼───────────────────────────────────────┤
│                    ┌─────────▼──────────┐                           │
│                    │  Area Controller   │                           │
│                    │  (PostGIS)         │                           │
│                    └────────────────────┘                           │
│                              │                                       │
│                    ┌─────────▼──────────┐                           │
│                    │  Area Repository   │                           │
│                    │  ST_* Functions    │                           │
│                    └────────────────────┘                           │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │    PostgreSQL        │
                    │    + PostGIS         │
                    │    GEOMETRY(4326)    │
                    └──────────────────────┘
```

---

## 📁 Estructura de Archivos

### Backend
```
src/
├── domain/area/
│   ├── Area.ts                    # Entidad de dominio
│   ├── AreaRepository.ts          # Interface del repositorio
│   └── GeoJSON.types.ts           # Tipos GeoJSON RFC 7946
│
├── infrastructure/
│   ├── db/migrations/
│   │   └── 001_create_areas_postgis.sql  # Script SQL PostGIS
│   │
│   ├── Express/area/
│   │   ├── AreaControllerPostGIS.ts      # Controller con GeoJSON
│   │   └── AreaPostGISRoutes.ts          # Rutas REST
│   │
│   └── repositories/
│       └── PostGISAreaRepository.ts      # Queries espaciales
```

### Frontend
```
src/
├── domain/entities/
│   └── AreaGeoJSON.ts             # Tipos + conversores
│
├── infrastructure/http/repositories/
│   └── HttpAreaGeoJSONRepository.ts
│
├── presentation/
│   ├── components/areas/
│   │   ├── AreaMap.tsx            # Componente Leaflet
│   │   ├── AreaTable.tsx          # Lista de áreas
│   │   └── AreaFormModal.tsx      # Modal crear/editar
│   │
│   ├── hooks/
│   │   └── useAreasGeoJSON.ts     # Hook de estado
│   │
│   └── pages/areas/
│       └── AreasPage.tsx          # Página principal
```

---

## 🗄️ Modelo de Datos

### Tabla `areas` (PostGIS)

```sql
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    geometry GEOMETRY(Polygon, 4326) NOT NULL,  -- PostGIS
    state BOOLEAN DEFAULT true,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice espacial GiST (crítico para rendimiento)
CREATE INDEX idx_areas_geometry ON areas USING GIST (geometry);
```

### GeoJSON Feature (API Response)

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-63.1821, -17.7833],
        [-63.1850, -17.7800],
        [-63.1780, -17.7850],
        [-63.1821, -17.7833]
      ]
    ]
  },
  "properties": {
    "id": 1,
    "name": "Zona Centro",
    "state": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🔌 API Endpoints

| Método | Endpoint | Descripción | Respuesta |
|--------|----------|-------------|-----------|
| `GET` | `/areas` | Listar todas | FeatureCollection |
| `GET` | `/areas/:id` | Obtener una | Feature |
| `POST` | `/areas` | Crear | Feature |
| `PATCH` | `/areas/:id` | Actualizar | Feature |
| `DELETE` | `/areas/:id` | Eliminar (soft) | `{ message }` |
| `GET` | `/areas/containing?lat=X&lng=Y` | Buscar por punto | Feature |

### Ejemplo: Crear Área

```bash
POST /api/areas
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Zona Centro",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-63.1821, -17.7833],
        [-63.1850, -17.7800],
        [-63.1780, -17.7850],
        [-63.1821, -17.7833]
      ]
    ]
  }
}
```

---

## ⚠️ Consideraciones de Coordenadas

### GeoJSON vs Leaflet

| Formato | Orden | Ejemplo |
|---------|-------|---------|
| **GeoJSON** | `[longitude, latitude]` | `[-63.1821, -17.7833]` |
| **Leaflet** | `[latitude, longitude]` | `[-17.7833, -63.1821]` |

### Funciones de Conversión

```typescript
// Leaflet → GeoJSON
function leafletToGeoJSON(leafletCoords: [number, number][]): GeoJSONPolygon {
  const ring = leafletCoords.map(([lat, lng]) => [lng, lat]);
  // Cerrar polígono si es necesario
  if (ring[0] !== ring[ring.length - 1]) {
    ring.push([...ring[0]]);
  }
  return { type: 'Polygon', coordinates: [ring] };
}

// GeoJSON → Leaflet
function geoJSONToLeaflet(polygon: GeoJSONPolygon): [number, number][] {
  return polygon.coordinates[0].slice(0, -1).map(([lng, lat]) => [lat, lng]);
}
```

---

## 🚀 Funciones Espaciales PostGIS

### Disponibles en el Repositorio

| Función | Uso | SQL |
|---------|-----|-----|
| `ST_GeomFromGeoJSON` | Insertar desde JSON | `INSERT ... ST_GeomFromGeoJSON($1)` |
| `ST_AsGeoJSON` | Leer como JSON | `SELECT ST_AsGeoJSON(geometry)` |
| `ST_Contains` | Punto en polígono | `WHERE ST_Contains(geometry, ST_Point($1, $2))` |
| `ST_Intersects` | Polígonos superpuestos | `WHERE ST_Intersects(a.geometry, b.geometry)` |
| `ST_Area` | Calcular área | `SELECT ST_Area(geometry::geography)` |
| `ST_IsValid` | Validar geometría | `SELECT ST_IsValid(ST_GeomFromGeoJSON($1))` |

### Ejemplo: Asignar Cliente a Área

```sql
-- Encontrar área que contiene la ubicación del cliente
SELECT id, name 
FROM areas 
WHERE ST_Contains(
    geometry, 
    ST_SetSRID(ST_Point(-63.1821, -17.7833), 4326)
)
AND state = true;
```

---

## 📦 Dependencias NPM

### Frontend
```bash
npm install leaflet leaflet-draw
npm install -D @types/leaflet
```

### Backend
```bash
npm install typeorm pg reflect-metadata
```

---

## 🔧 Configuración PostGIS

### 1. Instalar PostgreSQL + PostGIS

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib postgis
```

**Windows:** Descargar installer de https://www.postgresql.org/ (incluye PostGIS)

### 2. Habilitar Extensión
```sql
CREATE EXTENSION postgis;
```

### 3. Ejecutar Migración
```bash
psql -U postgres -d mi_base_datos -f migrations/001_create_areas_postgis.sql
```

---

## 🎯 Casos de Uso Futuros

1. **Asignación Automática de Clientes**: Cuando se registra un cliente con coordenadas, asignarle automáticamente el área correspondiente.

2. **Reportes por Zona**: Estadísticas de ventas agrupadas por área geográfica.

3. **Rutas de Distribución**: Optimización de entregas por zonas.

4. **Visualización de Cobertura**: Dashboard con mapa de heat de ventas.

---

## 📚 Referencias

- [RFC 7946 - GeoJSON](https://tools.ietf.org/html/rfc7946)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [OpenStreetMap](https://www.openstreetmap.org/)

---

## 👨‍💻 Autor

Sistema desarrollado como parte del Proyecto de Grado.
Arquitectura escalable preparada para funcionalidades GIS avanzadas.
