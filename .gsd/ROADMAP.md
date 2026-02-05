# ROADMAP.md - Plan de Desarrollo

## Fase 1: Fundamentos ✅ COMPLETADA

> Completada: 2026-02-05

- [x] Inicializar estructura `.gsd/`
- [x] Crear `electron/main.ts` funcional
- [x] Crear `electron/preload.ts`
- [x] Agregar Error Boundary global en React
- [x] Setup básico de tests (Vitest)

---

## Fase 2: Módulos Faltantes ✅ COMPLETADA

> Completada: 2026-02-05

- [x] Implementar página Historial de Ventas (`HistorialVentas.tsx`)
- [x] Implementar página de Usuarios (CRUD UI - ya existía `Usuarios.tsx`)
- [x] Implementar página de Proveedores (`Proveedores.tsx`)
- [x] Implementar página de Configuración (`Configuracion.tsx`)
- [x] Agregar endpoint `/api/sales` con paginación

---

## Fase 3: Polish & QA 🔄 EN PROGRESO

- [x] Test utilities con mock factories (`testUtils.tsx`)
- [x] Tests de Configuracion (6 tests)
- [x] Tests de ErrorBoundary (3 tests) - 9 tests total
- [ ] Build producción Windows
- [ ] Documentación de usuario

---

## Notas

- Fase 4 (Features Avanzados) pospuesta post-MVP
- Prioridad: estabilidad sobre nuevas features
- Total tests pasando: 9
