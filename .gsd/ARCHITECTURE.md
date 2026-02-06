# ARCHITECTURE.md - Mapa del Sistema

## 1) Vista General

Tipo: app desktop (Electron) con backend embebido (Fastify) y frontend React.

Patron: monolito modular local-first.

Flujo principal:
- Usuario -> React (renderer)
- React -> API local (`http://127.0.0.1:3001/api`)
- API -> Prisma -> SQLite

## 2) Componentes

### Frontend
- React + Router + Zustand
- Carga diferida por ruta (`React.lazy` + `Suspense`) para reducir peso inicial
- Paginas por dominio:
  - ventas, inventario, clientes, proveedores, compras, crm-pipeline, finanzas, personal, reportes

### Backend
- Fastify con JWT y RBAC
- Dominios API:
  - auth, setup, users, logs
  - products, sales, quotes
  - customers, suppliers, purchases
  - leads (pipeline + reminders)
  - expenses, employees

### Persistencia
- Prisma ORM
- SQLite por entorno:
  - Dev: `prisma/saori.db`
  - Instalador: DB en `userData` de Electron
  - Primer arranque instalador: copia de plantilla empaquetada `db/saori-template.db`

## 3) Seguridad y Runtime

- Host API: loopback local (`127.0.0.1`)
- CORS:
  - `http://localhost:5173`, `http://localhost:3000` en dev
  - `Origin: null` para `file://` empaquetado
- Secret JWT:
  - generado/persistido si no existe o es invalido
- Endpoints de catalogos protegidos:
  - `/api/categories` requiere `products:read`
  - `/api/expense-categories` requiere `expenses:read`

## 4) Build

- Frontend: `vite build` -> `dist/`
- Electron main/preload/server: `electron:compile` (`esbuild`) -> `dist-electron/`
- Instalador: `electron-builder` -> `release/`

## 5) Dependencias de Dominio

- Cotizaciones se pueden convertir en ventas.
- Compras impacta stock en recepcion.
- CRM Pipeline mantiene ciclo comercial y alertas de seguimiento.
- Setup inicial crea primer ADMIN y sucursal cuando la DB no tiene usuarios.

## 6) Riesgos Arquitectonicos Abiertos

- E2E smoke cubre flujos criticos, falta ampliar cobertura para mas escenarios.
- Empaquetado Windows depende de permisos de symlink del host.
