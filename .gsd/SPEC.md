# SPEC.md - Especificación del Proyecto

## Nombre del Proyecto

**SAORIX** (Saori Extended) - Sistema ERP/CRM/POS para Negocios

## Visión

Un ERP de escritorio moderno, rápido y completo para pequeños y medianos negocios en México.

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript + TailwindCSS + Zustand + Recharts
- **Backend**: Fastify + Prisma + SQLite (migrable a PostgreSQL)
- **Desktop**: Electron
- **Build**: Vite + electron-builder

## Módulos Core (MVP)

### ✅ Implementados

1. **Dashboard** - Métricas en tiempo real
2. **POS** - Punto de venta con carrito
3. **Inventario** - CRUD productos y categorías
4. **Clientes** - CRM con tags
5. **Finanzas** - Registro de gastos
6. **Personal** - Gestión básica de empleados
7. **Reportes** - Reportes de ventas
8. **Logs** - Auditoría (Admin only)

### 🔧 Por Implementar

1. **Historial Ventas** - Ver ventas pasadas
2. **Usuarios UI** - CRUD usuarios desde frontend
3. **Proveedores** - Gestión de proveedores
4. **Configuración** - Settings de la app
5. **Caja Registradora** - Apertura/cierre de caja

### 🔮 Futuro (Post-MVP)

- Facturación electrónica CFDI
- Nómina completa con cálculos
- Contabilidad
- Multi-sucursal
- Sincronización cloud

## Roles de Usuario

- **ADMIN**: Acceso total
- **SUPERVISOR**: Acceso intermedio
- **VENDEDOR**: Solo ventas y productos

## Autor

Luis González <luexigonzalez@gmail.com>
