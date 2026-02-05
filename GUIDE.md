# 🧠 GUIDE.md - Guía Técnica para Agentes IA

<!-- 
Este documento es para la IA (Antigravity/Claude/Gemini), no para el usuario.
Explica cómo trabajar con la plantilla Vibecoding usando GSD + Skills + MCPs.
-->

---

## 🎯 Filosofía de Vibecoding

**Vibecoding** = Especificar QUÉ quieres en lugar de escribir CÓMO hacerlo.

- El usuario **describe** su idea
- **Get Shit Done (GSD)** organiza el proyecto en fases
- Los **Skills** te dan capacidades especializadas
- Los **MCPs** inyectan documentación actualizada en tiempo real
- La IA **ejecuta** con calidad profesional

---

## 📐 Arquitectura: Get Shit Done (GSD)

### Sistema Operativo del Proyecto

GSD es el **contexto engineering layer** que mantiene la coherencia del proyecto.

### Archivos Core (.gsd/)

| Archivo | Propósito | Cuándo editarlo |
|---------|-----------|----------------|
| **SPEC.md** | Define QUÉ se construye | Al inicio con `/new-project` |
| **ROADMAP.md** | Organiza el proyecto en fases | Actualizado por `/plan N` |
| **STATE.md** | Contexto de sesión actual | Actualizado automáticamente |
| **DECISIONS.md** | Decisiones arquitectónicas (ADRs) | Cuando tomes decisiones técnicas importantes |
| **ARCHITECTURE.md** | Diseño del sistema | Generado con `/map` |

### Flujo de Trabajo GSD

```
1. INICIO: /new-project
   → Pregunta al usuario sobre su proyecto
   → Genera SPEC.md completo
   → Inicializa ROADMAP.md

2. PLANIFICACIÓN: /plan [N]
   → Lee SPEC.md y ROADMAP.md
   → Investiga y descubre requisitos
   → Genera plan detallado con tareas XML
   → Actualiza ROADMAP.md

3. EJECUCIÓN: /execute [N]
   → Lee el plan de la fase N
   → Ejecuta tareas en "waves" (grupos de 2-3 tareas)
   → Hace commits atómicos
   → Actualiza STATE.md

4. VERIFICACIÓN: /verify [N]
   → Valida que los must-haves funcionen
   → Captura evidencia (screenshots, logs)
   → Actualiza ROADMAP.md con estado

5. REPETIR: Para cada fase siguiente
```

### Comandos GSD Disponibles

#### Core Workflow
- `/map` - Genera diagrama arquitectónico
- `/plan [N]` - Planifica la fase N
- `/execute [N]` - Ejecuta la fase N
- `/verify [N]` - Verifica la fase N
- `/debug [descripción]` - Debugging guiado

#### Gestión de Proyecto
- `/new-project` - Inicializa nuevo proyecto
- `/new-milestone` - Define nuevo milestone
- `/complete-milestone` - Marca milestone como completo
- `/progress` - Muestra estado del proyecto

#### Gestión de Fases
- `/add-phase` - Agrega nueva fase al roadmap
- `/discuss-phase [N]` - Discute alcance de fase
- `/research-phase [N]` - Investiga requisitos de fase

#### Utilidades
- `/add-todo` - Agrega ToDo rápido
- `/pause` - Pausa sesión guardando contexto
- `/resume` - Retoma sesión previa

---

## 🛠️ Skills Catalog Integration

### Qué son los Skills

Los skills son **archivos markdown** que te enseñan cómo realizar tareas específicas de manera profesional.

### Ubicación

**✅ Skills Pre-Instalados**: Esta plantilla incluye **548 skills** ya instalados y listos para usar.

```
.agent/skills/
├── 3d-web-experience/
├── brainstorming/
├── frontend-design/
├── react-best-practices/
├── senior-fullstack/
└── ... (548 skills totales pre-instalados)
```

**No necesitas instalarlos**, ya están disponibles.

### Cómo Invocar Skills

Cuando el usuario dice:
- "Usa @brainstorming para..."
- "Aplica @react-best-practices a..."
- "Ejecuta @seo-audit en..."

**Debes:**
1. Leer el archivo `SKILL.md` del skill correspondiente
2. Seguir sus instrucciones exactamente
3. Aplicar sus patrones y mejores prácticas

### Skills por Tipo de Proyecto

#### 🎨 Portafolio Personal

**Fase de Diseño:**
- `@frontend-design` - Diseño UI/UX profesional
- `@ui-ux-pro-max` - Patrones avanzados de diseño
- `@brainstorming` - Ideas creativas

**Fase de Desarrollo:**
- `@react-best-practices` - Código React limpio
- `@astro-expert` (si usa Astro) - Mejores prácticas Astro
- `@performance-optimization` - Optimizar velocidad

**Fase de Contenido:**
- `@content-creator` - Copywriting profesional
- `@seo-audit` - Optimización SEO

---

#### 💰 Sistema POS (Point of Sale)

**Fase de Arquitectura:**
- `@senior-fullstack` - Arquitectura completa
- `@api-design` - Diseño de APIs RESTful
- `@database-design` - Diseño de schemas

**Fase de Backend:**
- `@backend-guidelines` - Mejores prácticas backend
- `@api-security-best-practices` - Seguridad
- `@postgresql-expert` - Base de datos avanzada

**Fase de Frontend:**
- `@react-ui-patterns` - Interfaces de aplicación
- `@form-validation` - Validación de formularios
- `@data-visualization` - Reportes y gráficos

---

#### 📊 Dashboard / Admin Panel

**Fase Inicial:**
- `@react-patterns` - Patrones React avanzados
- `@data-visualization` - Charts y tablas
- `@api-design` - Conexión con backend

**Fase de Features:**
- `@real-time-features` - Actualizaciones en tiempo real
- `@state-management` - Manejo de estado complejo
- `@authentication-patterns` - Auth y permisos

---

#### 🚀 Landing Page

**Fase de Diseño:**
- `@frontend-design` - Diseño impactante
- `@brainstorming` - Propuesta de valor clara
- `@conversion-optimization` - Maximizar conversiones

**Fase de Desarrollo:**
- `@astro-expert` - Performance máxima
- `@tailwind-patterns` - Estilos profesionales
- `@responsive-design` - Mobile-first

**Fase de Marketing:**
- `@seo-audit` - SEO optimizado
- `@content-creator` - Copy persuasivo
- `@analytics-setup` - Tracking de conversiones

---

## 🔌 Model Context Protocol (MCP) Integration

### MCPs Disponibles en esta Plantilla

#### 1. 🚀 Astro Docs MCP

**Configuración:**
```json
{
  "mcpServers": {
    "astro-docs": {
      "serverUrl": "https://mcp.docs.astro.build/mcp"
    }
  }
}
```

**Cuándo usarlo:**
- Usuario pide crear proyecto con Astro
- Necesitas sintaxis específica de Astro
- Dudas sobre componentes, layouts, o routing

**Cómo invocarlo:**
- Automático cuando detectas "Astro" en contexto
- Consulta docs antes de escribir código Astro
- Usa como fuente de verdad para sintaxis

**Ejemplo:**
```
Usuario: "Crea un componente Astro para el header"
→ 1. Consulta Astro Docs MCP para sintaxis actual
→ 2. Genera componente siguiendo docs oficiales
→ 3. Implementa con mejores prácticas
```

---

#### 2. 📚 Context7 MCP

**Configuración:**
```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "tu-api-key-aqui"
      }
    }
  }
}
```

**Cuándo usarlo:**
- Usuario menciona librerías: React, Vue, Supabase, TailwindCSS
- Necesitas documentación actualizada de cualquier librería
- Dudas sobre APIs de terceros

**Cómo invocarlo:**
- Automático cuando detectas librerías conocidas
- Busca en Context7 antes de asumir sintaxis
- Prefiere docs de Context7 sobre conocimiento pretrained

**Librerías soportadas:**
- Frontend: React, Vue, Svelte, Solid, Alpine.js
- Backend: Supabase, Firebase, Prisma, tRPC
- Styling: TailwindCSS, shadcn/ui, DaisyUI
- [Lista completa en context7.com]

**Ejemplo:**
```
Usuario: "Configura autenticación con Supabase"
→ 1. Consulta Context7 para docs de Supabase Auth
→ 2. Obtiene sintaxis y mejores prácticas actuales
→ 3. Implementa con código actualizado
```

---

#### 3. 🐙 GitHub MCP

**Funciones:**
- Crear repos, branches, PRs
- Gestionar issues
- Commits y tags
- Code reviews

**Cuándo usarlo:**
- Usuario pide "sube esto a GitHub"
- Workflow de deployment
- Gestión de versiones

---

#### 4. 🗄️ Supabase MCP

**Funciones:**
- Ejecutar migraciones
- Consultar base de datos
- Gestionar auth y RLS policies
- Desplegar funciones edge

**Cuándo usarlo:**
- Usuario usa Supabase como backend
- Necesitas crear/modificar tablas
- Configurar autenticación

---

### Reglas de Activación de MCPs

#### Triggers Automáticos

| Palabras Clave | MCP a Activar | Acción |
|----------------|---------------|--------|
| "Astro", "componente .astro" | Astro Docs | Consultar sintaxis |
| "React", "useState", "useEffect" | Context7 | Buscar docs de React |
| "Supabase", "auth", "database" | Context7 + Supabase | Docs + operaciones DB |
| "TailwindCSS", "className" | Context7 | Docs de Tailwind |
| "subir a GitHub", "crear PR" | GitHub | Operaciones Git |

#### Prioridad de Documentación

1. **MCPs (máxima prioridad)** - Docs actualizadas en tiempo real
2. **Skills** - Patrones y mejores prácticas
3. **Conocimiento pretrained** - Solo si los anteriores no aplican

---

## 🔄 Workflow Completo: Ejemplo Práctico

### Escenario: Usuario pide crear un Portafolio con Astro

```
Usuario: "Quiero crear mi portafolio personal con Astro"
```

**Tu proceso:**

#### 1. Inicializar con GSD
```
→ Ejecutar: /new-project
→ Hacer preguntas al usuario:
  - ¿Qué secciones quieres? (About, Projects, Contact)
  - ¿Tienes referencia de diseño?
  - ¿Necesitas blog?
→ Generar SPEC.md completo
→ Generar ROADMAP.md con fases
```

#### 2. Activar MCPs y Skills
```
→ Detectar: "Astro" → Activar Astro Docs MCP
→ Tipo de proyecto: Portafolio → Cargar skills:
  - @frontend-design
  - @ui-ux-pro-max
  - @astro-expert (si existe)
  - @seo-audit
```

#### 3. Planificar Fase 1
```
→ Ejecutar: /plan 1
→ Consultar Astro Docs MCP para:
  - Estructura de proyecto recomendada
  - Sintaxis de componentes
  - Best practices de layouts
→ Generar plan con tareas:
  - Inicializar proyecto Astro
  - Crear layout base
  - Implementar navegación
```

#### 4. Ejecutar Fase 1
```
→ Ejecutar: /execute 1
→ Para cada tarea:
  1. Consultar Astro Docs MCP para sintaxis actual
  2. Aplicar @frontend-design para estética
  3. Escribir código
  4. Commit atómico
→ Actualizar STATE.md
```

#### 5. Verificar Fase 1
```
→ Ejecutar: /verify 1
→ Validar:
  - ✓ Proyecto arranca sin errores
  - ✓ Navegación funciona
  - ✓ Layout responsive
→ Capturar screenshots
→ Marcar fase como completa en ROADMAP.md
```

#### 6. Siguiente Fase
```
→ Ejecutar: /plan 2 (Sección Projects)
→ Continuar flujo...
```

---

## ⚠️ Reglas Críticas

### 1. SPEC.md es Sagrado
- **SIEMPRE** lee SPEC.md antes de planificar
- **NO** asumas requisitos fuera del SPEC
- Si algo no está claro → pregunta al usuario

### 2. Contexto Limpio > Contexto Contaminado
- Actualiza STATE.md regularmente
- Usa dumps de estado para evitar alucinaciones
- Fresh context es mejor que context largo

### 3. Proof Over Trust
- Captura screenshots de resultados
- Muestra outputs de comandos
- No digas "funciona", **muéstralo**

### 4. Atomicidad Agresiva
- 2-3 tareas por plan (máximo)
- 1 feature = 1 commit
- Planes cortos, ejecución frecuente

### 5. MCPs son Fuente de Verdad
- Cuando hay un MCP disponible, **úsalo**
- No asumas sintaxis de memoria
- Valida con docs actuales

### 6. Skills Definen Calidad
- Si hay un skill para la tarea, **léelo primero**
- Sigue sus patrones exactamente
- No inventes cuando puedes consultar

### 7. AISLAMIENTO TOTAL: Nueva Carpeta Siempre
- **NUNCA** construyas en la raíz de la plantilla
- Al iniciar proyecto, crea `nombre-proyecto/`
- Copia los recursos necesarios ahí
- Mantén la plantilla limpia para futuros usos

---

## 📊 Detección de Conflictos

### Conflictos Posibles

#### 1. GSD vs Skills
- **Problema**: GSD dice "ejecuta 5 tareas", skill dice "una tarea a la vez"
- **Solución**: Skills > GSD. Haz 1 tarea, commit, siguiente tarea.

#### 2. MCP vs Conocimiento Pretrained
- **Problema**: Recuerdas sintaxis vieja, MCP da sintaxis nueva
- **Solución**: MCP > Memoria. Siempre confía en el MCP.

#### 3. Usuario vs SPEC.md
- **Problema**: Usuario pide feature que no está en SPEC
- **Solución**: Pregunta explícitamente: "Esto no está en SPEC, ¿actualizo el SPEC.md?"

### Resolución de Conflictos

```
1. Lee contexto completo (SPEC + ROADMAP + STATE)
2. Identifica fuente de conflicto
3. Reporta al usuario:
   - QUÉ conflicto detectaste
   - DÓNDE está documentado cada enfoque
   - QUÉ recomiendas y por qué
4. Espera confirmación antes de proceder
```

---

## 🎓 Casos de Uso Avanzados

### Multi-MCP Scenario

```
Usuario: "Portafolio con Astro, TailwindCSS, y blog con Supabase"

MCPs a usar:
→ Astro Docs MCP: Estructura de proyecto
→ Context7: TailwindCSS patterns + Supabase integration
→ Supabase MCP: Database setup + auth

Workflow:
1. /new-project → Define SPEC con 3 fases
   - Fase 1: Setup Astro + Tailwind
   - Fase 2: Blog con Supabase
   - Fase 3: Auth y deploy

2. /plan 1
   → Astro Docs: project structure
   → Context7: Tailwind setup con Astro

3. /execute 1
   → Combinar info de ambos MCPs
   → Implementar

4. /plan 2
   → Context7: Supabase client setup
   → Supabase MCP: Create tables, RLS policies

5. /execute 2
   → Implementar integración
```

---

## 🧩 Integración con Herramientas Externas

### Docker
- Usa skills: `@docker-expert`, `@docker-compose`
- Para proyectos que requieren containers

### Testing
- Skills: `@test-driven-development`, `@testing-patterns`
- Integrado en fase de verificación

### CI/CD
- Skills: `@github-actions`, `@vercel-deployment`
- Automatiza deployment en verify phase

---

## 📝 Resumen: Checklist para la IA

Cuando trabajas con esta plantilla:

- [ ] Leer SPEC.md antes de planificar
- [ ] Consultar Astro Docs MCP si el proyecto usa Astro
- [ ] Consultar Context7 MCP para librerías conocidas
- [ ] Cargar skills apropiados según tipo de proyecto
- [ ] Seguir flujo GSD: /plan → /execute → /verify
- [ ] Hacer commits atómicos (1 feature = 1 commit)
- [ ] Actualizar STATE.md y ROADMAP.md regularmente
- [ ] Capturar evidencia en /verify (screenshots, logs)
- [ ] Detectar y reportar conflictos proactivamente
- [ ] Priorizar: MCPs > Skills > Conocimiento pretrained

---

**Esta plantilla convierte "Vibecoding" en un sistema profesional y repetible. El usuario describe, tú ejecutas con máxima calidad.**
