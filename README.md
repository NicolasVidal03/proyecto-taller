# Proyecto Grado Frontend

Frontend React + Vite + TypeScript + Tailwind para consumir el backend.

## Requisitos
- Node 18+

## Variables de entorno
Crea `.env` (opcional) basado en `.env.example`:
```
VITE_API_BASE_URL=http://localhost:3000
```

## Scripts
```bash
npm install
npm run dev      # modo desarrollo (http://localhost:5173)
npm run build    # build producción
npm run preview  # previsualizar build
```

## Estructura
- `src/api` cliente axios y endpoints
- `src/pages` páginas (Login, Users)
- `src/hooks` hooks personalizados (auth)
- `src/components` componentes reutilizables

## Autenticación
Login envía CI y password (formato `sicme{ci}`) al backend (`/auth/login`). Se guarda `access_token` en `localStorage` y se añade en `Authorization` header.

## Estilos
Tailwind + utilidades personalizadas: `.btn-primary`, `.input`, `.card`. Paleta `brand` para colores principales.

## Próximos pasos
- Agregar manejo de roles y ocultar acciones según rol.
- Paginación y búsqueda en usuarios.
- Dark mode.
- Manejo de refresh token si se expira el access_token.
