# DECISIONS.md - Decisiones Arquitectónicas

## ADR-001: SQLite como base de datos inicial

**Fecha**: 2026-02-05
**Estado**: Aceptado

### Contexto

Necesitamos una base de datos para la aplicación de escritorio.

### Decisión

Usar SQLite con Prisma ORM, con plan de migración a PostgreSQL/Supabase en el futuro.

### Consecuencias

- ✅ Zero configuración para usuarios
- ✅ Archivo único para backup
- ⚠️ Limitaciones de concurrencia (aceptable para single-user)

---

## ADR-002: Fastify sobre Express

**Fecha**: 2026-02-05
**Estado**: Aceptado

### Contexto

Necesitamos un framework API para el backend embebido.

### Decisión

Usar Fastify por su rendimiento superior y sistema de plugins.

### Consecuencias

- ✅ ~2x más rápido que Express
- ✅ Validación de schemas integrada
- ✅ Soporte JWT nativo

---

## ADR-003: Zustand sobre Redux

**Fecha**: 2026-02-05
**Estado**: Aceptado

### Contexto

Manejo de estado global en React.

### Decisión

Usar Zustand por su simplicidad.

### Consecuencias

- ✅ Boilerplate mínimo
- ✅ TypeScript first-class
- ✅ Sin providers necesarios
