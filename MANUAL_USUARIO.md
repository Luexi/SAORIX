# MANUAL_USUARIO.md

Manual operativo para uso diario de SAORIX (version desktop Windows).

## 1. Inicio rapido

1. Instala la app con el instalador de Windows (`Saori Setup 1.0.0.exe`).
2. Abre SAORIX desde el acceso directo.
3. Si es una instalacion nueva sin usuarios:
   - Aparece el asistente "Configuracion inicial del sistema".
   - Crea sucursal, usuario administrador, email y contrasena.
4. Si la base ya trae datos demo:
   - Inicia sesion con:
     - `admin@saori.local / admin123`
     - `empleado@saori.local / empleado123`

## 2. Primer usuario (asistente inicial)

El asistente aparece automaticamente cuando el sistema detecta que no existen usuarios.

Campos:
- `Sucursal principal`
- `Nombre del administrador`
- `Email del administrador`
- `Contrasena`
- `Confirmar contrasena`

Reglas:
- Contrasena minima: 8 caracteres.
- Solo se permite una inicializacion.
- Despues de crear el primer admin, se habilita login normal.

## 3. Modulos principales

- `Dashboard`: resumen de ventas, estado comercial y actividad reciente.
- `POS`: ventas de mostrador.
- `Historial de ventas`: consulta de ventas registradas.
- `Inventario`: productos, precios y existencia.
- `Clientes`: base de clientes.
- `Proveedores`: catalogo para compras.
- `Compras`: ordenes de compra y recepcion de mercancia (actualiza stock).
- `CRM Pipeline`: leads, etapas y recordatorios.
- `Finanzas`: gastos y control financiero basico.
- `Personal`: empleados y datos de RH.
- `Reportes`: analitica operativa.
- `Usuarios`: administracion de usuarios (solo ADMIN).
- `Logs`: auditoria de eventos (solo ADMIN).

## 4. Roles

- `ADMIN`: acceso total.
- `SUPERVISOR`: operacion comercial, compras y CRM.
- `VENDEDOR`: ventas y seguimiento comercial limitado.

## 5. Datos y respaldos

SAORIX guarda datos en SQLite local.

Ubicacion habitual en Windows (instalador):
- `%APPDATA%\\Saori\\saori.db`

Respaldo recomendado:
1. Cierra SAORIX.
2. Copia `saori.db` a una carpeta externa.
3. Guarda copia con fecha (`saori-YYYY-MM-DD.db`).

Restauracion:
1. Cierra SAORIX.
2. Reemplaza `saori.db` por el respaldo.
3. Abre SAORIX e inicia sesion.

## 6. Problemas frecuentes

### A. "Failed to fetch"

Causa:
- La API local no esta corriendo o no responde en `127.0.0.1:3001`.

Acciones:
1. Cierra y vuelve a abrir SAORIX.
2. Si usas entorno de desarrollo, ejecuta `npm run electron:dev`.
3. Verifica firewall local si bloquea loopback.

### B. No puedo iniciar sesion

Acciones:
1. Verifica email y contrasena.
2. Si es primer uso y no existen usuarios, usa el asistente inicial.
3. Si hubo restauracion de DB, valida que corresponda a la version actual.

### C. Compras no actualiza stock

Revisa:
1. Que la orden no este en estado `CANCELLED`.
2. Que se haya ejecutado "Recibir mercancia".
3. Que el usuario tenga permisos de compras.

## 7. Buenas practicas operativas

- Realiza respaldo diario al cierre.
- Limita credenciales ADMIN a personal autorizado.
- Usa `SUPERVISOR` y `VENDEDOR` para operacion diaria.
- Documenta cambios de precios y ajustes criticos.
