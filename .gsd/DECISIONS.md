# Architecture Decision Records (ADR)

<!-- 
INSTRUCCIONES:
Documenta aquí las DECISIONES TÉCNICAS importantes.
Cada decisión debe explicar: QUÉ decidiste, POR QUÉ, y qué ALTERNATIVAS consideraste.
-->

## 📝 Formato de Decisión

Para cada decisión, usa este formato:

```
### [ADR-XXX] Título de la decisión

**Fecha:** YYYY-MM-DD
**Estado:** Propuesta | Aceptada | Rechazada | Obsoleta
**Contexto:** [Por qué necesitamos tomar esta decisión]
**Decisión:** [Qué decidimos hacer]
**Consecuencias:** [Implicaciones positivas y negativas]
**Alternativas consideradas:** [Otras opciones que evaluamos]
```

---

## Decisiones del Proyecto

### [ADR-001] Ejemplo: Selección de Framework

**Fecha:** 2026-01-28
**Estado:** Propuesta

**Contexto:**
Necesitamos elegir el framework principal para el proyecto. Requisitos: rendimiento, SEO, facilidad de uso.

**Decisión:**
Usar Astro como framework principal.

**Consecuencias:**
- ✅ Excelente rendimiento (HTML estático por defecto)
- ✅ Componentes islas para JavaScript mínimo
- ⚠️ Curva de aprendizaje para el equipo
- ⚠️ Ecosistema más pequeño que Next.js

**Alternativas consideradas:**
- Next.js: Mayor ecosistema pero más JavaScript en cliente
- SvelteKit: Excelente DX pero menos recursos de aprendizaje

---

<!-- Agrega más decisiones abajo siguiendo el mismo formato -->
