# MCP Configuration Guide

Este archivo documenta la configuración de Model Context Protocol (MCP) servers para la plantilla Vibecoding.

---

## 📋 MCPs Configurados

### 1. Astro Docs MCP

**Estado**: ✅ Incluido y configurado

**Propósito**: Documentación oficial de Astro en tiempo real

**Configuración**:
```json
{
  "astro-docs": {
    "serverUrl": "https://mcp.docs.astro.build/mcp"
  }
}
```

**Cuándo se activa**: 
- Usuario menciona "Astro"
- Proyectos que usan Astro framework
- Necesitas sintaxis específica de Astro

**Ejemplos de uso**:
- Componentes .astro
- Layouts y routing
- Content collections
- Optimizaciones de build

---

### 2. Context7 MCP

**Estado**: ✅ Incluido (requiere API Key)

**Propósito**: Documentación de 100+ librerías populares

**Configuración**:
```json
{
  "context7": {
    "type": "http",
    "url": "https://mcp.context7.com/mcp",
    "headers": {
      "CONTEXT7_API_KEY": "ctx7sk-346598f6-a24e-4129-80c0-64927abf915f"
    }
  }
}
```

**Cómo obtener API Key**:
1. Ve a https://context7.com
2. Crea cuenta gratuita
3. Dashboard → API Keys
4. Click "Create API Key"
5. Copia la key que empieza con `ctx7sk-`

**Librerías soportadas**:
- **Frontend**: React, Vue, Svelte, Solid, Alpine.js
- **Backend**: Supabase, Firebase, Prisma, tRPC
- **Styling**: TailwindCSS, shadcn/ui, DaisyUI, styled-components
- **Full-stack**: Next.js, Astro, Remix, SvelteKit
- **Tools**: Vite, Turbopack, esbuild
- [Lista completa](https://context7.com/libraries)

**Cuándo se activa**:
- Usuario menciona cualquier librería soportada
- Proyectos React, Vue, etc.
- Necesitas documentación actualizada

**Ejemplos de uso**:
```
"Configura Supabase Auth"
→ Context7 provee docs actuales de Supabase

"Crea un form con React Hook Form"
→ Context7 provee sintaxis actualizada

"Integra TailwindCSS con Next.js"
→ Context7 muestra el setup correcto
```

---

## 🔌 MCPs Adicionales (Opcionales)

### GitHub MCP

**Estado**: ✅ Incluido por defecto en Antigravity

**No requiere configuración adicional**

**Funciones**:
- Crear repositorios
- Gestionar branches y PRs
- Issues y projects
- Code reviews

---

### Supabase MCP

**Estado**: ✅ Incluido por defecto en Antigravity

**No requiere configuración adicional**

**Funciones**:
- Ejecutar migraciones
- Queries a la base de datos
- Gestionar RLS policies
- Desplegar Edge Functions

**Nota**: Necesitas credenciales de Supabase en `.env.local`

---

### Vercel MCP (Opcional)

**Estado**: ⚠️ No configurado por defecto

**Propósito**: Deployment y gestión de proyectos Vercel

**Cómo agregar**:

1. Obtén tu Vercel token:
   - Ve a https://vercel.com/account/tokens
   - Crea nuevo token

2. Agrega a `mcp_config.json`:
```json
{
  "mcpServers": {
    "astro-docs": { ... },
    "context7": { ... },
    "vercel": {
      "type": "http",
      "url": "https://mcp.vercel.com/mcp",
      "headers": {
        "Authorization": "Bearer tu-vercel-token"
      }
    }
  }
}
```

3. Agrega token a `.env.local`:
```env
VERCEL_TOKEN=tu-vercel-token
```

---

## ⚙️ Instalación y Activación

### Ubicación del Archivo

El archivo de configuración está en:
```
.gemini/antigravity/mcp_config.json
```

### Pasos de Activación

1. **Edita mcp_config.json**
   - Abre `.gemini/antigravity/mcp_config.json`
   - Reemplaza `YOUR_API_KEY_HERE` con tu Context7 API key

2. **Configura variables de entorno**
   - Copia `.env.template` a `.env.local`
   - Agrega tu Context7 API key

3. **Activa en Antigravity** 
   - Abre Google Antigravity
   - Ve a Settings (⚙️)
   - Click "Manage MCPs"
   - Click "Refresh"
   - Verifica lista de MCPs activos

### Verificación

Después de refrescar, deberías ver:

✅ astro-docs
✅ context7
✅ github-mcp-server (por defecto)
✅ supabase-mcp-server (por defecto)

---

## 🔍 Debugging MCPs

### Problema: Context7 no se conecta

**Error común**: "Failed to connect to MCP server"

**Soluciones**:
1. Verifica que tu API key sea correcta
2. Asegúrate que no tenga espacios extras
3. Verifica que el formato JSON sea válido
4. Intenta crear una nueva API key

### Problema: Astro Docs no aparece

**Soluciones**:
1. Verifica la URL exacta: `https://mcp.docs.astro.build/mcp`
2. Asegúrate que no falten comillas o comas en el JSON
3. Reinicia Antigravity
4. Click "Refresh" nuevamente

### Problema: API Key en texto plano

**Seguridad**: Las API keys están en archivos locales que NO se suben a GitHub (.gitignore las excluye).

**Mejores prácticas**:
- Usa `.env.local` para keys sensibles
- NUNCA hagas commit de `.env.local`
- Rota keys regularmente en Context7

---

## 📊 Prioridad de MCPs

Cuando la IA necesita información, el orden de prioridad es:

1. **MCPs** (máxima prioridad) - Docs actualizadas
2. **Skills** - Patrones y mejores prácticas  
3. **Conocimiento pretrained** - Solo como fallback

**Ejemplo**:
```
Usuario pide: "Crea componente React con estado"

Flujo:
1. Context7 MCP → Consulta docs de React
2. @react-best-practices skill → Aplica patrones
3. Conocimiento base → Complementa si necesario
```

---

## 🔄 Actualizar MCPs

Context7 actualiza su catálogo regularmente. Para obtener nuevas librerías:

1. No necesitas hacer nada, Context7 se actualiza automáticamente
2. Si agregaron soporte para una librería nueva, ya estará disponible
3. Verifica librerías soportadas en: https://context7.com/libraries

---

## 📝 Notas Importantes

### Context7 API Key es Obligatoria

Sin Context7, la plantilla funciona pero:
- ❌ No habrá docs actualizadas de librerías
- ❌ La IA usará conocimiento viejo
- ⚠️ Puede generar código obsoleto

**Recomendación**: Crea tu API key aunque uses la tier gratuita.

### Astro Docs MCP

Este MCP es específico para proyectos Astro. Si no usas Astro:
- No hace nada (no afecta otros proyectos)
- Puedes dejarlo configurado por si acaso
- Se activa solo cuando detecta Astro

### Costo de Context7

- **Tier gratuito**: 1000 requests/mes
- **Tier Pro**: Ilimitado (precio en su web)
- Para uso personal/proyectos pequeños, gratis es suficiente

---

## 🚀 Próximos Pasos

Después de configurar MCPs:

1. ✅ Verifica que aparezcan en "Manage MCPs"
2. ✅ Prueba con un proyecto simple
3. ✅ Observa si Antigravity consulta docs antes de escribir código
4. ✅ Lee [GUIDE.md](../GUIDE.md) para entender cómo se usan

---

**Con los MCPs configurados, tu IA tendrá acceso a documentación actualizada en tiempo real. Esto es crítico para generar código moderno y correcto.** 🎯
