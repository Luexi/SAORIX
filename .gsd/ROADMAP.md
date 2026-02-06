# ROADMAP.md - Plan por Fases (Metodologia GSD)

Estructura por fase:
- `/plan N`: definir tareas y criterios
- `/execute N`: implementar tareas
- `/verify N`: validar con evidencia

## Fase 1 - Fundamentos

Estado: `COMPLETADA` (2026-02-05)

### Plan
- Estructura `.gsd`
- Electron main/preload
- ErrorBoundary global
- Setup base de tests

### Execute
- Tareas implementadas y consolidadas en codigo

### Verify (evidencia)
- App y rutas base funcionan
- Tests iniciales ejecutables

---

## Fase 2 - Modulos Base

Estado: `COMPLETADA` (2026-02-05)

### Plan
- Historial de ventas
- Usuarios CRUD UI
- Proveedores UI
- Configuracion

### Execute
- Modulos implementados

### Verify (evidencia)
- Navegacion y pantallas habilitadas
- Operaciones basicas disponibles

---

## Fase 3 - Features Criticos v1

Estado: `COMPLETADA` (2026-02-05)

### Plan
- Cotizaciones end-to-end
- Compras (procurement) end-to-end
- CRM Pipeline end-to-end

### Execute
- Cotizaciones: modelo + API + UI + conversion a venta
- Compras: `PurchaseOrder` + recepcion con ajuste de stock
- CRM: `Lead` + etapas + recordatorios

### Verify (evidencia)
- Migraciones aplicadas:
  - `add_procurement_crm_v1`
  - `align_expense_user_and_optional_category`
- Smoke API:
  - login
  - suppliers/products
  - create/receive purchase
  - create lead
  - reminders

---

## Fase 4 - Hardening Beta Windows

Estado: `EN PROGRESO`

### Plan
- Seguridad runtime Electron/API
- Pipeline de build reproducible
- Validacion tecnica y QA beta

### Execute
- API en `127.0.0.1`
- CORS para dev + `Origin: null` en empaquetado
- `JWT_SECRET` y `DATABASE_URL` por runtime
- Paso `electron:compile` con `esbuild`
- Login sin fallback mock cuando backend no responde
- Endpoints de catalogos (`/api/categories`, `/api/expense-categories`) ahora protegidos por auth + permisos
- Code-splitting por ruta con `React.lazy` + `Suspense`
- Smoke E2E automatizado en `npm run test:e2e`
- DB plantilla migrada + seed empaquetada para primer arranque sin Prisma CLI
- Asistente de primer usuario (API + UI en login) cuando no hay usuarios
- Manual de usuario operativo (`MANUAL_USUARIO.md`)

### Verify (evidencia actual)
- `npx tsc --noEmit` OK
- `npm test` OK (9/9)
- `npx vite build` OK
- `npm run electron:compile` OK
- `DATABASE_URL=file:./saori.db npm run prisma:seed` OK
- `npm run prepare:db-template` OK (genera `build-resources/saori-template.db`)
- `npm run test:e2e` OK
- Smoke API runtime OK:
  - login
  - alta de proveedor
  - listado de productos
  - crear y recibir orden de compra (`RECEIVED`)
  - alta de lead y `GET /api/leads/reminders`
- `npm run electron:build` OK (genera instalador NSIS y empaqueta `resources/db/saori-template.db`)

### Pendientes para cerrar fase
- QA manual por rol (ADMIN/SUPERVISOR/VENDEDOR)

---

## Definicion de Done para Beta Interna

- Fase 4 en `COMPLETADA`
- Checklist `/verify 4` con evidencia de comandos y prueba manual
- Instalador Windows generado y probado en al menos 1 equipo limpio
