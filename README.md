# Frontend — Sistema de Sorteos (React + Vite + Tailwind)

Frontend moderno conectado al backend de `sorteo-backend`: formulario público de inscripción,
login de administrador, dashboard, gestión de depósitos y el módulo de sorteo (ruleta).

## Instalación

```bash
npm install
cp .env.example .env
# edita .env: VITE_API_URL debe apuntar a tu backend (ej: http://localhost:4000/api)
npm run dev
```

Abre `http://localhost:5173`.

- El backend debe estar corriendo (`npm run dev` en `sorteo-backend`) y tener CORS habilitado
  hacia `http://localhost:5173` (variable `FRONTEND_URL` del `.env` del backend).
- Crea el primer administrador con `npm run seed:admin` en el backend antes de iniciar sesión.

## Estructura

```
src/
  api/client.js          -> instancia de axios, adjunta el token JWT automáticamente
  context/AuthContext.jsx-> sesión del admin (login, logout, persistencia en localStorage)
  routes/ProtectedRoute.jsx -> redirige a /admin/login si no hay sesión
  components/
    public/RegistrationModal.jsx -> formulario de inscripción (nombre, celular,
                                     nombre de cuenta del depositante, comprobante)
    admin/AdminLayout.jsx  -> sidebar + topbar del panel
    admin/StatCard.jsx     -> tarjetas del dashboard
    admin/StatusBadge.jsx  -> pastilla de estado (pendiente/aprobado/rechazado)
    admin/DepositDetailDrawer.jsx -> panel lateral para revisar/aprobar/rechazar un depósito
  pages/
    LandingPage.jsx   -> página pública con el botón "Inscribirme"
    LoginPage.jsx      -> login de administrador
    DashboardPage.jsx  -> resumen / estadísticas
    DepositsPage.jsx   -> listado y filtros de depósitos
    WinnerPage.jsx      -> módulo de sorteo (Girar / Detener / Limpiar)
```

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Landing + formulario de inscripción |
| `/admin/login` | Público | Login de administrador |
| `/admin` | Protegida | Dashboard / estadísticas |
| `/admin/depositos` | Protegida | Listado, búsqueda, aprobar/rechazar depósitos |
| `/admin/sorteo` | Protegida | Ruleta del sorteo (solo visible autenticado) |

## Reglas de negocio respetadas en el frontend

- El número de celular se valida en el formulario y, si el backend responde `409` por
  duplicado, se muestra el mensaje de error tal cual lo envía la API (una sola inscripción
  por número).
- El campo **nombre de la cuenta del depositante** es obligatorio en el formulario público y
  se muestra únicamente en el panel de depósitos (para conciliar el comprobante); **nunca**
  se muestra en el módulo de sorteo.
- El módulo de sorteo (`/admin/sorteo`) vive detrás de `ProtectedRoute` y del layout de admin:
  solo es accesible con sesión iniciada, igual que el resto del panel.
- Mientras la ruleta gira, únicamente se pinta el `fullName` del participante.

## Build de producción

```bash
npm run build
npm run preview
```
