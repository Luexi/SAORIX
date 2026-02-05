# 🚀 SETUP_INSTRUCTIONS.md - Guía para Usuarios

<!-- 
Este documento es para TI, el usuario (no técnico).
Te guía paso a paso para configurar y usar la plantilla Vibecoding.
-->

---

## 📋 Antes de Empezar - Checklist

Marca cada item cuando lo completes:

### Software Requerido

- [ ] **Node.js 18 o superior** instalado
  - Descarga en: https://nodejs.org
  - Verifica con: `node --version` en terminal

- [ ] **Git** instalado
  - Descarga en: https://git-scm.com
  - Verifica con: `git --version` en terminal

- [ ] **Editor de código** (recomendado: VSCode)
  - Descarga VSCode: https://code.visualstudio.com

### Cuentas Necesarias

- [ ] **Cuenta de GitHub**
  - Regístrate en: https://github.com
  - Necesaria para guardar tu código

- [ ] **Cuenta de Context7** (obligatorio)
  - Regístrate en: https://context7.com
  - Crea un API Key en el dashboard
  - Guarda tu API key en lugar seguro

### Cuentas Opcionales (según tu proyecto)

- [ ] **Supabase** (si necesitas base de datos/auth)
  - Regístrate en: https://supabase.com

- [ ] **Vercel** (para deployment gratis)
  - Regístrate en: https://vercel.com

---

## 🛠️ Instalación - Paso a Paso

### Paso 1: Clonar la Plantilla (Ya completado)

Como esta es tu plantilla privada, ya tienes todo listo en tu carpeta.

**Recomendación**: Mantén esta carpeta como tu "Master Template" y no trabajes directamente en ella.
Para cada nuevo proyecto, copiaremos los archivos necesarios a una carpeta nueva (ver sección "Cómo Trabajar").

---

### Paso 2: Configurar Variables de Entorno

#### 2.1 Copiar el template

```powershell
# Windows
Copy-Item .env.template .env.local
```

```bash
# Mac/Linux
cp .env.template .env.local
```

#### 2.2 Editar .env.local

Abre el archivo `.env.local` con tu editor de código y completa:

```env
# ⚠️ OBLIGATORIO - Sin esto Context7 MCP no funciona
CONTEXT7_API_KEY=ctx7sk-TU-API-KEY-AQUI

# Opcional - Solo si usas Supabase
SUPABASE_URL=tu-url-de-supabase
SUPABASE_ANON_KEY=tu-anon-key

# Opcional - Solo si usas Vercel
VERCEL_TOKEN=tu-vercel-token
```

**¿Dónde obtengo mi Context7 API Key?**
1. Ve a https://context7.com
2. Inicia sesión
3. Ve a "API Keys" en el dashboard
4. Click en "Create API Key"
5. Copia la key que empieza con `ctx7sk-...`

---

### Paso 3: Configurar MCPs en Antigravity

#### 3.1 Ubicar el archivo de configuración

El archivo ya está creado en:
```
.gemini/antigravity/mcp_config.json
```

#### 3.2 Actualizar con tu API Key

Abre `.gemini/antigravity/mcp_config.json` y reemplaza:

```json
{
  "mcpServers": {
    "astro-docs": {
      "serverUrl": "https://mcp.docs.astro.build/mcp"
    },
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "ctx7sk-TU-API-KEY-AQUI"  ← Pon tu key aquí
      }
    }
  }
}
```

#### 3.3 Activar MCPs en Antigravity

1. Abre **Google Antigravity**
2. Ve a **Settings** (⚙️)
3. Click en **"Manage MCPs"**
4. Click en **"Refresh"**
5. Verifica que aparezcan:
   - ✅ astro-docs
   - ✅ context7

---

### Paso 4: Verificar Configuración con Antigravity

Una vez que hayas configurado todo, abre Antigravity y dile:

**"Verifica que mi entorno y los MCPs estén configurados correctamente"**

El agente revisará:
1. API Keys
2. Conexión con MCPs
3. Acceso a Skills
4. Variables de entorno

Si algo falta, te dirá exactamente qué corregir.

⚠️ **Nota**: Esto descarga 552+ skills. Si solo quieres algunos, consulta `.agent/skills/README.md` después.

---

## 🎮 Cómo Trabajar con la Plantilla

### Tu "Diccionario de Comandos"

No necesitas aprender comandos técnicos. Habla naturalmente con Antigravity:

| Lo que tú dices (natural) | Lo que hace Antigravity | Comando GSD interno |
|----------------------------|-------------------------|----------------------|
| "Quiero crear un portafolio personal" | Hace preguntas y crea SPEC.md | `/new-project` |
| "Planea la primera fase" | Investiga y genera plan | `/plan 1` |
| "Construye la primera fase" | Escribe el código | `/execute 1` |
| "Verifica que funcione" | Prueba todo y captura evidencia | `/verify 1` |
| "Muéstrame el progreso" | Resumen del proyecto | `/progress` |
| "Pausa el trabajo" | Guarda contexto | `/pause` |

### ⚠️ Regla de Oro: NO Contaminar la Plantilla

Para cada nuevo proyecto, crea una carpeta limpia y **pide al agente que genere el proyecto ahí**.

**La forma correcta:**

1. Crea carpeta nueva: `mkdir mi-nuevo-proyecto`
2. Copia SOLO lo esencial (ver abajo)
3. Abre Antigravity en esa carpeta nueva

**O mejor aún, dile al agente:**

> "Quiero crear un nuevo proyecto llamado 'Portafolio 2026'. Por favor crea una carpeta nueva para él, no uses esta carpeta raíz para no mezclar archivos."

El agente se encargará de copiar `.gsd`, `.agent`, y configs a la nueva carpeta.

### Flujo de Trabajo Recomendado

```
1️⃣ INICIO - Nueva carpeta
   Tú: "Crea una carpeta nueva para mi proyecto [Nombre]"

2️⃣ SETUP - Copia inteligente
   Tú: "Prepara la estructura en esa carpeta copiando los templates y skills necesarios"

3️⃣ PLANIFICACIÓN - Spec
   Tú: "En la nueva carpeta, genera el SPEC.md para [descripción]"

4️⃣ CONSTRUCCIÓN
   Tú: "Construye la primera fase"
```

---

## 📂 Entendiendo la Estructura

```
mi-proyecto/
│
├── .gsd/                    ← 🧠 Cerebro del proyecto (no tocar)
│   ├── SPEC.md             ← QUÉ se construye (importante leer)
│   ├── ROADMAP.md          ← Fases del proyecto
│   ├── STATE.md            ← Estado actual
│   ├── DECISIONS.md        ← Decisiones técnicas
│   └── ARCHITECTURE.md     ← Cómo está construido
│
├── .agent/
│   └── skills/             ← 🛠️ Superpoderes de la IA
│
├── .gemini/
│   └── antigravity/
│       └── mcp_config.json ← ⚙️ Configuración de MCPs
│
├── src/                    ← 💻 Tu código (se genera aquí)
│
├── .env.local              ← 🔐 Tus API keys (NUNCA subir a GitHub)
├── .env.template           ← Template de variables
├── .gitignore              ← Qué NO subir a GitHub
│
├── GUIDE.md                ← Para la IA (referencia técnica)
├── SETUP_INSTRUCTIONS.md   ← Este archivo (para ti)
├── SKILLS_MATRIX.md        ← Qué skill usar cuándo
└── README.md               ← Resumen del proyecto
```

### Archivos que SÍ debes leer:

- ✅ **SPEC.md** - Para ver qué se está construyendo
- ✅ **ROADMAP.md** - Para ver el progreso
- ✅ **README.md** - Resumen rápido

### Archivos que NO debes editar:

- ❌ **STATE.md** - Lo actualiza Antigravity automáticamente
- ❌ **GUIDE.md** - Es para la IA, no para humanos
- ❌ **mcp_config.json** - Solo lo editaste una vez al inicio

---

## 🤔 Preguntas Frecuentes

### ¿Qué es un MCP?

**MCP** = Model Context Protocol.

Es una manera de que la IA acceda a documentación actualizada en tiempo real.

**Sin MCP:**
- IA usa conocimiento viejo (entrenado hace meses)
- Puede dar código obsoleto

**Con MCP:**
- IA consulta docs oficiales en vivo
- Código siempre actualizado

### ¿Por qué necesito Context7?

Context7 da acceso a documentación de 100+ librerías:
- React, Vue, Svelte
- TailwindCSS
- Supabase, Firebase
- Y más...

Sin Context7, la IA usa conocimiento viejo. Con Context7, siempre está actualizada.

### ¿Puedo usar esta plantilla sin Skills?

Sí, pero **NO es recomendado**.

Los skills enseñan a la IA mejores prácticas:
- Código más limpio
- Mejor arquitectura
- Menos bugs

**Sin skills**: Código funcional pero básico
**Con skills**: Código profesional de alta calidad

### ¿Qué pasa si olvido mi Context7 API Key?

1. Ve a https://context7.com
2. Inicia sesión
3. Ve a "API Keys"
4. Puedes ver tus keys existentes o crear una nueva
5. Actualiza `.env.local` con la nueva key

### ¿Cómo sé si los MCPs están funcionando?

Cuando hables con Antigravity, si ves que:
- Consulta docs antes de escribir código
- Menciona "según la documentación de Astro..."
- Usa sintaxis muy actualizada

= Los MCPs están funcionando ✅

---

## 🚨 Troubleshooting (Solución de Problemas)

### Problema: Context7 MCP no se conecta

**Síntomas:**
- Error al refrescar MCPs
- Antigravity no puede acceder a Context7

**Soluciones:**
1. Verifica que tu API key sea correcta en `mcp_config.json`
2. Asegúrate de que la key empiece con `ctx7sk-`
3. Verifica que no tenga espacios extras
4. Intenta crear una nueva API key en Context7

### Problema: Astro Docs MCP no aparece

**Síntomas:**
- Solo aparece Context7, no Astro Docs

**Soluciones:**
1. Verifica que el `mcp_config.json` tenga ambos MCPs
2. Asegúrate de que la URL sea exacta: `https://mcp.docs.astro.build/mcp`
3. Click en "Refresh" en Manage MCPs
4. Reinicia Antigravity

### Problema: Skills no se ven

**Síntomas:**
- Antigravity no conoce `@brainstorming` u otros skills

**Soluciones:**
1. Verifica que la carpeta `.agent/skills/` exista
2. Dentro debe haber subcarpetas con archivos `SKILL.md`
3. Re-clona los skills con el comando de instalación
4. Reinicia Antigravity

### Problema: .env.local no funciona

**Síntomas:**
- Variables de entorno no se cargan

**Soluciones:**
1. Asegúrate de que el archivo se llame `.env.local` (con punto al inicio)
2. Verifica que esté en la raíz del proyecto
3. No debe tener espacios en los valores
4. Formato correcto: `CLAVE=valor` (sin espacios alrededor del `=`)

### Problema: Git no encuentra el proyecto

**Síntomas:**
- Errores al hacer `git clone` o `git push`

**Soluciones:**
1. Verifica que Git esté instalado: `git --version`
2. Configura tu identidad si es primera vez:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## 💡 Mejores Prácticas

### 1. Siempre empieza con `/new-project`

No saltes directo a código. Deja que Antigravity te haga preguntas y genere SPEC.md primero.

**Malo:**
```
"Crea un portafolio con estas secciones..."
```

**Bueno:**
```
"Quiero crear un portafolio" 
→ Deja que Antigravity pregunte
→ Se genera SPEC.md completo
→ DESPUÉS empiezas a construir
```

### 2. Una fase a la vez

No pidas "construye todo el proyecto".

**Malo:**
```
"Crea todo: header, footer, blog, contacto, todo"
```

**Bueno:**
```
Fase 1: "Planea y construye el layout base y navegación"
Fase 2: "Ahora la sección de proyectos"
Fase 3: "Ahora el formulario de contacto"
```

### 3. Siempre verifica

Después de cada fase, pide verificación:

```
"Verifica que todo funcione"
```

Esto asegura que cada fase esté bien antes de continuar.

### 4. Guarda tu trabajo

Sube tu código a GitHub regularmente:

```
"Sube estos cambios a GitHub"
```

### 5. Lee SPEC.md al inicio

Antes de empezar a construir, abre `.gsd/SPEC.md` y léelo.

Ahí está documentado exactamente QUÉ se va a construir. Si algo no está claro, pide a Antigravity que lo clarifique.

---

## 🎯 Próximos Pasos

Ya tienes todo configurado. ¿Ahora qué?

### Primer Proyecto

1. Abre Antigravity
2. Di: **"Quiero crear mi portafolio personal"**
3. Responde las preguntas de Antigravity
4. Deja que genere SPEC.md
5. Di: **"Planea la primera fase"**
6. Revisa el plan
7. Di: **"Construye esto"**
8. ¡Observa la magia! ✨

### Recursos Útiles

- **GUIDE.md** - Referencia técnica completa (si quieres entender más)
- **SKILLS_MATRIX.md** - Qué skills usar para cada proyecto
- **Documentación GSD**: https://github.com/toonight/get-shit-done-for-antigravity
- **Skills Catalog**: https://github.com/sickn33/antigravity-awesome-skills

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:

1. Revisa el Troubleshooting arriba
2. Lee GUIDE.md para detalles técnicos
3. Pregunta directamente a Antigravity: "Tengo un problema con [X]"

---

**¡Listo! Ahora puedes crear proyectos profesionales solo describiendo lo que quieres. Bienvenido al Vibecoding.** 🚀
