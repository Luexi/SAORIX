# DECISIONS.md - ADRs (Architectural Decision Records)

## ADR-001 - SQLite local para beta

Fecha: 2026-02-05  
Estado: Aceptado

Decision:
- Usar SQLite en beta interna para instalacion simple y operacion local.

Impacto:
- Pro: cero infraestructura externa para arrancar.
- Contra: sin colaboracion multi-PC nativa.

---

## ADR-002 - API Fastify embebida en Electron

Fecha: 2026-02-05  
Estado: Aceptado

Decision:
- Mantener backend embebido para exponer contrato API interno al frontend.

Impacto:
- Pro: separacion limpia de UI y logica.
- Contra: requiere hardening de superficie local.

---

## ADR-003 - Seguridad local-first

Fecha: 2026-02-05  
Estado: Aceptado

Decision:
- API en `127.0.0.1` (no `0.0.0.0`).
- CORS restringido a origenes validos y `Origin: null` de app empaquetada.
- `JWT_SECRET` obligatorio y persistido por instalacion.

Impacto:
- Reduce riesgo de exposicion en LAN.
- Mejora consistencia de sesiones entre reinicios.

---

## ADR-004 - `DATABASE_URL` runtime y DB portable

Fecha: 2026-02-05  
Estado: Aceptado

Decision:
- `DATABASE_URL` por entorno.
- Desarrollo: `prisma/saori.db`.
- Instalador: DB en carpeta `userData` de Electron.

Impacto:
- Evita escribir dentro de rutas de instalacion no apropiadas.
- Facilita backup por archivo de usuario.

---

## ADR-005 - Compras y CRM Pipeline obligatorios en v1

Fecha: 2026-02-05  
Estado: Aceptado

Decision:
- Incluir `PurchaseOrder`/`PurchaseOrderItem` con recepcion y ajuste de stock.
- Incluir `Lead` con pipeline y recordatorios.

Impacto:
- Cubre ciclo completo: prospecto -> venta -> reabasto.
- Aumenta valor de validacion en beta interna.

---

## ADR-006 - Compilacion explicita de Electron

Fecha: 2026-02-05  
Estado: Aceptado

Decision:
- Agregar `electron:compile` antes de empaquetado.

Impacto:
- Evita empaquetar `dist-electron` desactualizado.
- Build mas deterministico.

---

## ADR-007 - Estado del empaquetado Windows

Fecha: 2026-02-05  
Estado: Abierto

Decision propuesta:
- Ejecutar build en host con privilegios de symlink (`Developer Mode` o terminal Admin).

Razon:
- `electron-builder` requiere extraer artefactos con symlinks (`winCodeSign`) y falla en entornos sin privilegio.

---

## ADR-008 - Hardening de Auth/API y optimizacion de carga UI

Fecha: 2026-02-05  
Estado: Aceptado

Decision:
- Eliminar fallback de login mock cuando no responde el backend.
- Proteger endpoints de catalogos con auth + permisos.
- Activar code-splitting por rutas para reducir bundle inicial.
- Agregar smoke E2E automatizado para flujos criticos (`npm run test:e2e`).

Impacto:
- Pro: menor riesgo de bypass de autenticacion y mejor tiempo de carga inicial.
- Pro: regresiones criticas detectables en pipeline local.
- Contra: smoke E2E usa `saori.db` del entorno y no una base temporal aislada.

---

## ADR-009 - DB plantilla empaquetada para primer arranque

Fecha: 2026-02-06  
Estado: Aceptado

Decision:
- Generar en build una SQLite plantilla aplicando `migration.sql` en orden + datos base (`prisma:seed`).
- Empaquetar esa DB como `extraResources` en Electron.
- En runtime empaquetado, si no existe `userData/saori.db`, copiar la plantilla.

Impacto:
- Pro: evita crash por tablas inexistentes en instalaciones nuevas sin Prisma CLI.
- Pro: mantiene credenciales/demo y catalogos base para iniciar sesion al primer uso.
- Contra: requiere paso adicional de build (`npm run prepare:db-template`).

---

## ADR-010 - Asistente de primer usuario y manual operativo

Fecha: 2026-02-06  
Estado: Aceptado

Decision:
- Exponer `GET /api/setup/status` para detectar si el sistema requiere inicializacion.
- Exponer `POST /api/setup/first-user` para alta controlada del primer ADMIN.
- Mostrar asistente en pantalla de login cuando no hay usuarios.
- Publicar `MANUAL_USUARIO.md` como guia operativa oficial.

Impacto:
- Pro: reduce friccion en instalaciones limpias y evita bloqueos de acceso.
- Pro: mejora onboarding de usuarios no tecnicos.
- Contra: agrega flujo adicional de setup que debe cubrirse en QA manual.
