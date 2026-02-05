# Source Code Directory

Este directorio contendrá el código fuente de tu proyecto.

## 📁 Estructura Sugerida

La estructura exacta dependerá del framework que elijas, pero aquí hay una guía general:

### Para Astro:
```
src/
├── components/     # Componentes reutilizables (.astro, .jsx, .vue, etc.)
├── layouts/        # Layouts de página
├── pages/          # Páginas (rutas automáticas)
├── styles/         # CSS global y módulos
└── lib/            # Utilidades y helpers
```

### Para Next.js:
```
src/
├── app/            # App router (Next.js 13+)
├── components/     # Componentes React
├── lib/            # Utilidades
└── styles/         # Estilos CSS
```

### Para SvelteKit:
```
src/
├── routes/         # Páginas y endpoints
├── lib/            # Componentes y utilidades
└── app.css         # Estilos globales
```

## 🚀 Próximos Pasos

1. Ejecuta `/new-project` en Antigravity para inicializar tu proyecto
2. Define tu stack tecnológico en `.gsd/SPEC.md`
3. Deja que GSD configure la estructura por ti

## 📝 Nota

Este directorio está vacío intencionalmente. Se llenará cuando inicies tu primer proyecto usando esta plantilla.
