# SAORIX ERP

ERP/CRM/POS de escritorio para PyMEs, construido con Electron + React + Fastify + Prisma.

## Estado actual

- Objetivo activo: `Beta interna Windows`.
- Alcance `v1` activo:
  - Compras (ordenes y recepcion con stock automatico)
  - CRM Pipeline (leads y recordatorios)
  - Cotizaciones, POS, inventario, clientes, finanzas, personal y reportes
  - Asistente de primer usuario cuando la DB no tiene usuarios

## Stack

- Frontend: React 18 + TypeScript + TailwindCSS + Zustand
- Backend embebido: Fastify + JWT + Prisma
- DB: SQLite
- Desktop: Electron
- Build: Vite + esbuild + electron-builder

## Arquitectura resumida

- Renderer React consume API local.
- API Fastify corre embebida dentro de Electron.
- API escucha en `127.0.0.1:3001` para seguridad local-first.
- Prisma usa `DATABASE_URL` y en produccion persiste DB en `userData`.
- En instalador, si no existe DB en `userData`, se copia una DB plantilla migrada desde recursos empaquetados.
- Login requiere backend real (sin fallback mock).
- Setup inicial disponible en API: `GET /api/setup/status`, `POST /api/setup/first-user`.

## Configuracion de entorno

Crear `.env` a partir de `.env.example`:

```env
JWT_SECRET=replace-with-64-char-random-secret
PORT=3001
API_HOST=127.0.0.1
DATABASE_URL="file:./prisma/saori.db"
```

Notas:
- En produccion Electron, `JWT_SECRET` y `DATABASE_URL` se resuelven automaticamente en runtime si no existen.
- No subir `.env` a control de versiones.

## Comandos

```bash
# Desarrollo web
npm run dev

# Compilar proceso Electron (main/preload/server)
npm run electron:compile

# Generar DB plantilla para instalador
npm run prepare:db-template

# Tests unitarios
npm test

# Smoke E2E de flujos criticos
npm run test:e2e

# Build frontend
npx vite build

# Build desktop (instalador)
npm run electron:build
```

## Manual de usuario

- Ver `MANUAL_USUARIO.md` para instalacion, primer acceso, operacion diaria, respaldos y troubleshooting.

## Base de datos y migraciones

```bash
# Aplicar migraciones en desarrollo
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Seed de datos demo
npm run prisma:seed
```

Migraciones recientes:
- `add_procurement_crm_v1`
- `align_expense_user_and_optional_category`

## Usuarios demo

- `admin@saori.local` / `admin123`
- `empleado@saori.local` / `empleado123`

## Endpoints nuevos v1

- Proveedores: `/api/suppliers`
- Compras: `/api/purchases`, `/api/purchases/:id/receive`
- CRM Leads: `/api/leads`, `/api/leads/reminders`

## Pendiente antes de release beta formal

- QA manual por rol
- Instalador Windows firmado para distribucion interna
- Exportacion PDF formal de cotizaciones
