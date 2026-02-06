# SPEC.md - Especificacion del Proyecto

## 1) Producto

Nombre: `SAORIX` (Saori Extended)  
Tipo: ERP/CRM/POS de escritorio para PyMEs en Mexico  
Release objetivo actual: `Beta Interna Windows`

## 2) Problema y Objetivo

- Problema: pequeños negocios usan hojas sueltas o sistemas separados para ventas, inventario y seguimiento comercial.
- Objetivo: concentrar operacion comercial y administrativa en una app local, rapida, con baja friccion de instalacion.

## 3) Alcance v1 (Must-Have)

Modulos funcionales:
- Dashboard
- POS
- Historial de ventas
- Inventario
- Clientes (CRM base)
- CRM Pipeline (leads por etapas + recordatorios)
- Proveedores
- Compras (orden de compra + recepcion de mercancia con ajuste de stock)
- Finanzas (gastos)
- Personal
- Reportes
- Usuarios (CRUD UI)
- Logs (solo Admin)
- Configuracion
- Cotizaciones (alta, listado, cambio de estado, conversion a venta)
- Asistente de primer usuario (alta de admin inicial cuando no hay usuarios)

Requisitos de plataforma:
- App desktop para Windows (beta interna)
- Persistencia local en SQLite
- API embebida local en loopback

## 4) Fuera de Alcance v1 (Post-Beta)

- Multiusuario en red / sincronizacion cloud
- Facturacion CFDI productiva
- Nomina completa
- Firma digital de instalador corporativo automatizada en pipeline

## 5) Requisitos No Funcionales

- Seguridad local:
  - API solo en `127.0.0.1`
  - JWT secret obligatorio en runtime
- Portabilidad:
  - DB en carpeta de usuario de la app en instalador
- Trazabilidad:
  - Decisiones en ADRs
  - Estado por fase con evidencia de verify
- Calidad:
  - Tests unitarios en verde
  - Smoke tests de APIs criticas

## 6) Roles y Permisos

- `ADMIN`: acceso total
- `SUPERVISOR`: operacion comercial + compras + seguimiento
- `VENDEDOR`: venta y seguimiento comercial limitado

## 7) Criterios de Aceptacion para Beta Interna Windows

- Build de app y backend compila sin errores.
- Instalacion nueva no depende de Prisma CLI para crear tablas iniciales.
- Instalacion nueva sin usuarios permite inicializar admin mediante asistente de primer usuario.
- Login, POS, compras y pipeline CRM funcionan contra datos reales.
- Recepcion de compras incrementa stock automaticamente.
- Cotizacion se puede convertir a venta.
- Migraciones Prisma aplican sobre base limpia.
- Smoke E2E critico (`npm run test:e2e`) pasa en entorno de validacion.
- Manual de usuario disponible y alineado al estado real.
- Documentacion `.gsd` refleja estado real con metodologia `/plan -> /execute -> /verify`.
