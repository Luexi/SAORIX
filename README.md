# 🏪 Saori ERP

Sistema ERP de escritorio para gestión de negocios pequeños y medianos.

---

## 📋 Resumen del Proyecto

**Saori ERP** es una aplicación de escritorio multiplataforma construida con Electron + React + TypeScript. Ofrece módulos completos para punto de venta, inventario, clientes, finanzas y recursos humanos.

### Características Principales

| Módulo | Funcionalidad |
|--------|--------------|
| **Dashboard** | Métricas en tiempo real, gráficas de ventas |
| **POS** | Punto de venta con carrito, métodos de pago, selección cliente |
| **Inventario** | CRUD productos, control de stock, alertas bajo stock |
| **Clientes (CRM)** | Gestión clientes, tags, historial compras |
| **Finanzas** | Registro gastos, gráficas ingresos vs gastos |
| **Personal (RH)** | Empleados, puestos, nómina, horarios |
| **Logs** | Auditoría de acciones (solo Admin) |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    ELECTRON (Main)                       │
│  ┌─────────────────┐    ┌──────────────────────────┐    │
│  │   Fastify API   │◄───│   Prisma ORM (SQLite)    │    │
│  │   localhost:3000│    │   saori.db               │    │
│  └────────┬────────┘    └──────────────────────────┘    │
│           │                                              │
├───────────┼──────────────────────────────────────────────┤
│           ▼                                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │              REACT (Renderer)                    │    │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐      │    │
│  │   │  Zustand │  │  Router  │  │ Recharts │      │    │
│  │   │  (State) │  │  (Nav)   │  │ (Charts) │      │    │
│  │   └──────────┘  └──────────┘  └──────────┘      │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Patrón de Comunicación

```
Browser (React) ──HTTP──► Fastify API ──Prisma──► SQLite
```

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.3 | UI Components |
| TypeScript | 5.6 | Type Safety |
| Tailwind CSS | 3.4 | Estilos |
| React Router | 6.x | Navegación |
| Zustand | 5.x | Estado Global |
| Recharts | 2.x | Gráficas |

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Electron | 33.x | App Desktop |
| Fastify | 5.x | API REST |
| Prisma | 5.22 | ORM |
| SQLite | - | Base de Datos |
| JWT (fastify-jwt) | - | Autenticación |
| bcryptjs | - | Hash Passwords |

### Herramientas
| Herramienta | Uso |
|-------------|-----|
| Vite | Bundler/Dev Server |
| electron-builder | Empaquetado |
| Prisma CLI | Migraciones |

---

## 📁 Estructura del Proyecto

```
Saori/
├── electron/                 # Proceso principal Electron
│   ├── main.ts              # Entry point Electron
│   └── server/
│       └── index.ts         # API Fastify (~1000 líneas)
│
├── src/                     # Frontend React
│   ├── App.tsx              # Router principal
│   ├── main.tsx             # Entry point React
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.tsx   # Layout principal
│   │       ├── Sidebar.tsx  # Navegación lateral
│   │       └── Header.tsx   # Barra superior
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── POS.tsx
│   │   ├── Inventario.tsx
│   │   ├── Clientes.tsx
│   │   ├── Finanzas.tsx
│   │   ├── Personal.tsx
│   │   ├── Logs.tsx
│   │   └── Login.tsx
│   ├── stores/
│   │   ├── authStore.ts     # Estado autenticación
│   │   └── cartStore.ts     # Estado carrito POS
│   └── styles/
│       └── index.css        # Tailwind + Custom
│
├── prisma/
│   ├── schema.prisma        # 18 modelos de BD
│   ├── seed.ts              # Datos iniciales
│   └── migrations/          # Historial migraciones
│
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## 💾 Modelos de Base de Datos

```
Usuarios:     User
Sucursales:   Branch
Productos:    Product, Category, ProductStock
Clientes:     Customer
Ventas:       Sale, SaleItem
Finanzas:     Expense, ExpenseCategory
Personal:     Employee, Position, Payroll, Schedule
Proveedores:  Supplier, PurchaseOrder
Auditoría:    ActivityLog
Caja:         CashRegister
```

---

## 📊 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Perfil usuario |
| GET/POST | `/api/products` | Productos |
| PUT/DELETE | `/api/products/:id` | CRUD producto |
| GET/POST | `/api/customers` | Clientes |
| PUT/DELETE | `/api/customers/:id` | CRUD cliente |
| POST | `/api/sales` | Crear venta |
| GET/POST | `/api/expenses` | Gastos |
| DELETE | `/api/expenses/:id` | Eliminar gasto |
| GET/POST | `/api/employees` | Empleados |
| PUT/DELETE | `/api/employees/:id` | CRUD empleado |
| GET | `/api/positions` | Puestos |
| GET | `/api/logs` | Logs (Admin) |

---

## 📏 Tamaño Estimado

### Código Fuente
- **35 archivos** de código (~540 KB sin node_modules)

### Ejecutable Compilado (Estimado)
| Plataforma | Tamaño Aproximado |
|------------|-------------------|
| Windows (.exe) | 80-120 MB |
| macOS (.dmg) | 90-130 MB |
| Linux (.AppImage) | 85-125 MB |

> El tamaño incluye Chromium (~70MB), Node.js runtime, y dependencias.

---

## 👤 Usuarios Demo

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@saori.local | admin123 | Administrador |
| empleado@saori.local | empleado123 | Vendedor |

---

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Generar ejecutable
npm run electron:build
```

---

## 🔄 Migración Futura

El proyecto está preparado para migrar de SQLite a **Supabase/PostgreSQL**:

```prisma
// Cambiar en schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 📝 Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).

Copyright (c) 2026 Luis Angel Gonzalez Gonzalez

---

## 👤 Autor

**Luis Angel Gonzalez Gonzalez**
- Email: luexigonzalez@gmail.com
- GitHub: [@Luexi](https://github.com/Luexi)
