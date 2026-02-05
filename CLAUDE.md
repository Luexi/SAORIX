# Claude Code - Guía de Contexto

Esta plantilla fue diseñada para **Antigravity** pero es 100% compatible con **Claude Code**.

## 🎯 Resumen del Proyecto

**Vibecoding Master Template** - Plantilla para crear proyectos sin código manual usando:
- **GSD (Get Shit Done)**: Metodología de organización en `.gsd/`
- **548 Skills pre-instalados**: En `.agent/skills/`
- **MCPs configurados**: Astro Docs y Context7

## 📁 Estructura Importante

```
.gsd/           → Documentación del proyecto (SPEC, ROADMAP, STATE)
.agent/skills/  → 548 skills especializados (frontend, backend, etc.)
src/            → Código fuente del proyecto
```

## ⚡ Comandos Rápidos

El usuario usará lenguaje natural. Interpreta:
- "Nuevo proyecto" → Lee `.gsd/SPEC.md`, crea estructura
- "Status/Estado" → Actualiza `.gsd/STATE.md`
- "Siguiente paso" → Consulta `.gsd/ROADMAP.md`

## 🛠️ Skills Disponibles

Invoca skills con `@nombre-skill`. Ejemplos:
- `@brainstorming` - Planear antes de codear
- `@frontend-design` - Diseño UI profesional
- `@react-best-practices` - Patrones React
- `@senior-fullstack` - Arquitectura completa

Ver `.agent/skills/README.md` para lista completa.

## 📋 Reglas Críticas

1. **Lee primero**: Siempre consulta `.gsd/SPEC.md` antes de crear código
2. **Actualiza STATE**: Al terminar sesión, actualiza `.gsd/STATE.md`
3. **Usa skills**: Invoca skills relevantes para código profesional
4. **Español**: El usuario prefiere comunicación en español

## 🔄 Flujo de Trabajo GSD

1. **SPEC.md** → Define QUÉ hacer
2. **ROADMAP.md** → Define CUÁNDO hacerlo
3. **STATE.md** → Rastrea progreso de sesión
4. **DECISIONS.md** → Documenta decisiones técnicas

## ⚠️ Diferencias con Antigravity

- **MCPs no disponibles**: Claude Code no tiene Astro Docs ni Context7 MCPs
- **Workaround**: Usa web search cuando necesites documentación actualizada
- **Skills funcionan igual**: Los archivos `.agent/skills/` son compatibles

## 📚 Documentación Completa

- `GUIDE.md` - Guía técnica detallada
- `SETUP_INSTRUCTIONS.md` - Instrucciones de usuario
- `SKILLS_MATRIX.md` - Qué skills usar por proyecto

---

**El usuario no tiene experiencia en programación. Usa lenguaje simple y guíalo paso a paso.**
