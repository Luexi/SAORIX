# OpenAI Codex - Guía de Contexto

Esta plantilla fue diseñada para **Antigravity** pero es compatible con **ChatGPT/Codex**.

## 🎯 Resumen del Proyecto

**Vibecoding Master Template** - Genera proyectos mediante especificación, no código manual.

**Componentes principales:**
- `.gsd/` → Metodología Get Shit Done (organización)
- `.agent/skills/` → 548 skills especializados
- `src/` → Código fuente

## 📁 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `.gsd/SPEC.md` | Especificación del proyecto |
| `.gsd/ROADMAP.md` | Fases y milestones |
| `.gsd/STATE.md` | Estado actual de sesión |
| `.gsd/DECISIONS.md` | Decisiones técnicas (ADRs) |

## ⚡ Cómo Interpretar al Usuario

El usuario usa **lenguaje natural** en español:

| Usuario dice | Acción |
|--------------|--------|
| "Nuevo proyecto" | Lee SPEC.md, crea estructura |
| "Continuar" | Lee STATE.md, retoma trabajo |
| "¿Qué sigue?" | Consulta ROADMAP.md |
| "Decisión sobre X" | Documenta en DECISIONS.md |

## 🛠️ Skills Pre-Instalados

548 skills en `.agent/skills/`. Úsalos con `@nombre`:

**Frontend:**
- `@frontend-design` - UI/UX profesional
- `@react-patterns` - Patrones React
- `@tailwind-patterns` - TailwindCSS

**Backend:**
- `@backend-architect` - Arquitectura APIs
- `@api-design-principles` - RESTful design

**General:**
- `@brainstorming` - Planear antes de codear
- `@senior-fullstack` - Fullstack completo

## 📋 Reglas Críticas

1. **Consulta `.gsd/SPEC.md` primero** - Contiene los requisitos
2. **Actualiza `.gsd/STATE.md`** - Al terminar sesión
3. **Usa skills** - Código profesional con mejores prácticas
4. **Comunica en español** - Preferencia del usuario
5. **Explica simple** - Usuario sin experiencia técnica

## ⚠️ Limitaciones vs Antigravity

| Feature | Antigravity | Codex |
|---------|-------------|-------|
| MCPs (Context7, Astro) | ✅ | ❌ |
| Skills (.agent/skills) | ✅ | ✅ |
| GSD Methodology | ✅ | ✅ |
| Web Search | ✅ | Limitado |

**Workaround para MCPs**: Usa tu conocimiento base y pregunta al usuario si necesitas documentación específica.

## 🔄 Flujo Recomendado

```
1. Lee SPEC.md → Entiende el proyecto
2. Consulta ROADMAP.md → Identifica fase actual
3. Lee STATE.md → Retoma contexto previo
4. Usa @skills → Genera código profesional
5. Actualiza STATE.md → Guarda progreso
```

## 📚 Documentación Adicional

- `GUIDE.md` - Guía técnica completa
- `SKILLS_MATRIX.md` - Skills por tipo de proyecto
- `SETUP_INSTRUCTIONS.md` - Para el usuario

---

**Recuerda: El usuario no programa. Tú generas todo el código siguiendo la especificación.**
