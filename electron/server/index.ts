import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const isProduction = process.env.NODE_ENV === 'production'

// Tipos
interface UserPayload {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR'
    branchId: string | null
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: UserPayload
        user: UserPayload
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: any, reply: any) => Promise<void>
        requirePermission: (permission: string) => (request: any, reply: any) => Promise<void>
    }
}

// Permisos por rol
const PERMISSIONS = {
    ADMIN: [
        'sales:create', 'sales:read', 'sales:delete',
        'products:create', 'products:read', 'products:update', 'products:edit', 'products:delete',
        'customers:create', 'customers:read', 'customers:update', 'customers:edit', 'customers:delete',
        'expenses:create', 'expenses:read', 'expenses:delete',
        'employees:create', 'employees:read', 'employees:update', 'employees:edit', 'employees:delete',
        'suppliers:create', 'suppliers:read', 'suppliers:update', 'suppliers:delete',
        'purchases:create', 'purchases:read', 'purchases:update', 'purchases:receive',
        'leads:create', 'leads:read', 'leads:update', 'leads:delete',
        'users:create', 'users:read', 'users:update', 'users:delete',
        'logs:read',
        'reports:read',
    ],
    SUPERVISOR: [
        'sales:create', 'sales:read',
        'products:create', 'products:read', 'products:update', 'products:edit',
        'customers:create', 'customers:read', 'customers:update', 'customers:edit',
        'expenses:create', 'expenses:read',
        'employees:read',
        'suppliers:create', 'suppliers:read', 'suppliers:update',
        'purchases:create', 'purchases:read', 'purchases:update', 'purchases:receive',
        'leads:create', 'leads:read', 'leads:update',
        'users:read',
        'reports:read',
    ],
    VENDEDOR: [
        'sales:create', 'sales:read',
        'products:read',
        'customers:read',
        'leads:create', 'leads:read', 'leads:update',
    ],
} as const

// Helper para verificar permisos
function hasPermission(role: keyof typeof PERMISSIONS, permission: string): boolean {
    return PERMISSIONS[role]?.includes(permission as never) ?? false
}

// Crear servidor
const fastify = Fastify({
    logger: {
        level: isProduction ? 'info' : 'debug',
    },
})

// Registrar plugins
async function registerPlugins() {
    const allowedOrigins = new Set(['http://localhost:5173', 'http://localhost:3000'])
    await fastify.register(cors, {
        origin: (origin, callback) => {
            if (!origin || origin === 'null' || allowedOrigins.has(origin)) {
                callback(null, true)
                return
            }
            callback(new Error('Origin not allowed'), false)
        },
        credentials: true,
    })

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret || jwtSecret.length < 32) {
        throw new Error('JWT_SECRET no definido o demasiado corto (min 32 caracteres)')
    }

    await fastify.register(jwt, {
        secret: jwtSecret,
        sign: { expiresIn: '8h' },
    })
}

// Decorator para autenticar
fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
        await request.jwtVerify()
    } catch (err) {
        reply.code(401).send({ error: 'Token inválido o expirado' })
    }
})

// Decorator para verificar permisos
fastify.decorate('requirePermission', function (permission: string) {
    return async function (request: any, reply: any) {
        await request.jwtVerify()
        if (!hasPermission(request.user.role, permission)) {
            reply.code(403).send({
                error: 'No tienes permisos para esta acción',
                required: permission,
            })
        }
    }
})

// Función para registrar acciones
async function logAction(
    userId: string,
    action: string,
    entity?: string,
    entityId?: string,
    details?: object
) {
    await prisma.activityLog.create({
        data: {
            userId,
            action,
            entity,
            entityId,
            details: details ? JSON.stringify(details) : null,
        },
    })
}

// ======== RUTAS DE AUTENTICACIÓN ========

fastify.get('/api/setup/status', async () => {
    const usersCount = await prisma.user.count()
    return {
        requiresSetup: usersCount === 0,
    }
})

fastify.post('/api/setup/first-user', async (request, reply) => {
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
        return reply.code(409).send({
            error: 'El sistema ya fue inicializado y no permite crear otro primer usuario.',
        })
    }

    const { name, email, password, branchName } = (request.body || {}) as {
        name?: string
        email?: string
        password?: string
        branchName?: string
    }

    const safeName = name?.trim()
    const safeEmail = email?.trim().toLowerCase()
    const safeBranchName = branchName?.trim() || 'Sucursal Principal'

    if (!safeName || !safeEmail || !password) {
        return reply.code(400).send({ error: 'Nombre, email y contrasena son requeridos' })
    }

    if (password.length < 8) {
        return reply.code(400).send({ error: 'La contrasena debe tener al menos 8 caracteres' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(safeEmail)) {
        return reply.code(400).send({ error: 'Email invalido' })
    }

    const existingByEmail = await prisma.user.findUnique({ where: { email: safeEmail } })
    if (existingByEmail) {
        return reply.code(409).send({ error: 'El email ya existe en el sistema' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const bootstrap = await prisma.$transaction(async (tx) => {
        const branch = await tx.branch.create({
            data: {
                name: safeBranchName,
                isMain: true,
                active: true,
            },
        })

        const user = await tx.user.create({
            data: {
                name: safeName,
                email: safeEmail,
                password: passwordHash,
                role: 'ADMIN',
                active: true,
                branchId: branch.id,
            },
        })

        await tx.activityLog.create({
            data: {
                userId: user.id,
                action: 'SYSTEM_BOOTSTRAP',
                entity: 'User',
                entityId: user.id,
                details: JSON.stringify({
                    initializedBy: safeEmail,
                    branch: safeBranchName,
                }),
            },
        })

        return { branch, user }
    })

    const payload: UserPayload = {
        id: bootstrap.user.id,
        email: bootstrap.user.email,
        name: bootstrap.user.name,
        role: 'ADMIN',
        branchId: bootstrap.branch.id,
    }

    const token = fastify.jwt.sign(payload)
    const refreshToken = fastify.jwt.sign(payload, { expiresIn: '7d' })

    return {
        user: {
            id: bootstrap.user.id,
            email: bootstrap.user.email,
            name: bootstrap.user.name,
            role: 'ADMIN',
            branchId: bootstrap.branch.id,
            branchName: bootstrap.branch.name,
            permissions: PERMISSIONS.ADMIN,
        },
        token,
        refreshToken,
    }
})

fastify.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string }

    if (!email || !password) {
        return reply.code(400).send({ error: 'Email y contraseña son requeridos' })
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: { branch: true },
    })

    if (!user || !user.active) {
        return reply.code(401).send({ error: 'Credenciales incorrectas' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
        return reply.code(401).send({ error: 'Credenciales incorrectas' })
    }

    const payload: UserPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserPayload['role'],
        branchId: user.branchId,
    }

    const token = fastify.jwt.sign(payload)
    const refreshToken = fastify.jwt.sign(payload, { expiresIn: '7d' })

    // Registrar login
    await logAction(user.id, 'LOGIN', 'User', user.id, {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
    })

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            branchId: user.branchId,
            branchName: user.branch?.name,
            permissions: PERMISSIONS[user.role as keyof typeof PERMISSIONS] || [],
        },
        token,
        refreshToken,
    }
})

fastify.post('/api/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string }

    if (!refreshToken) {
        return reply.code(400).send({ error: 'Refresh token requerido' })
    }

    try {
        const decoded = fastify.jwt.verify<UserPayload>(refreshToken)
        const user = await prisma.user.findUnique({ where: { id: decoded.id } })

        if (!user || !user.active) {
            return reply.code(401).send({ error: 'Usuario no encontrado o inactivo' })
        }

        const payload: UserPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserPayload['role'],
            branchId: user.branchId,
        }

        const newToken = fastify.jwt.sign(payload)
        return { token: newToken }
    } catch {
        return reply.code(401).send({ error: 'Refresh token inválido' })
    }
})

fastify.get('/api/auth/me', {
    preHandler: [fastify.authenticate as any],
}, async (request) => {
    const user = await prisma.user.findUnique({
        where: { id: (request.user as UserPayload).id },
        include: { branch: true },
    })

    if (!user) {
        throw { statusCode: 404, message: 'Usuario no encontrado' }
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        branchName: user.branch?.name,
        permissions: PERMISSIONS[user.role as keyof typeof PERMISSIONS] || [],
    }
})

// ======== RUTAS DE USUARIOS ========

// GET Users
fastify.get('/api/users', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'users:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver usuarios' })
    }

    const { search } = request.query as { search?: string }

    const users = await prisma.user.findMany({
        where: {
            active: true,
            AND: [
                search ? {
                    OR: [
                        { name: { contains: search } },
                        { email: { contains: search } },
                    ]
                } : {},
            ],
        },
        include: { branch: true },
        orderBy: { name: 'asc' },
    })

    return users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        branchName: u.branch?.name,
        active: u.active,
        createdAt: u.createdAt,
    }))
})

// POST User
fastify.post('/api/users', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'users:create')) {
        return reply.code(403).send({ error: 'No tienes permisos para crear usuarios' })
    }

    const { name, email, password, role, branchId } = request.body as {
        name: string
        email: string
        password: string
        role: string
        branchId?: string
    }

    if (!name || !email || !password || !role) {
        return reply.code(400).send({ error: 'Todos los campos son requeridos' })
    }

    // Verificar email
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        return reply.code(400).send({ error: 'El email ya está registrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
            branchId: branchId || null,
        },
    })

    await logAction(user.id, 'CREATE_USER', 'User', newUser.id, { name, role })

    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
    }
})

// PUT User
fastify.put('/api/users/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'users:update')) {
        return reply.code(403).send({ error: 'No tienes permisos para editar usuarios' })
    }

    const { id } = request.params as { id: string }
    const { name, email, password, role, branchId, active } = request.body as {
        name?: string
        email?: string
        password?: string
        role?: string
        branchId?: string | null
        active?: boolean
    }

    // Si cambia password
    let hashedPassword
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(hashedPassword && { password: hashedPassword }),
            ...(role && { role }),
            ...(branchId !== undefined && { branchId }),
            ...(active !== undefined && { active }),
        },
    })

    await logAction(user.id, 'UPDATE_USER', 'User', updatedUser.id, { name: updatedUser.name })

    return { success: true }
})

// DELETE User
fastify.delete('/api/users/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'users:delete')) {
        return reply.code(403).send({ error: 'No tienes permisos para eliminar usuarios' })
    }

    const { id } = request.params as { id: string }

    await prisma.user.update({
        where: { id },
        data: { active: false },
    })

    await logAction(user.id, 'DELETE_USER', 'User', id, {})

    return { success: true }
})

// ======== RUTAS DE LOGS (SOLO ADMIN) ========

fastify.get('/api/logs', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'logs:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver logs' })
    }

    const { page = 1, limit = 20 } = request.query as { page?: number; limit?: number }

    const logs = await prisma.activityLog.findMany({
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } },
        },
    })

    const total = await prisma.activityLog.count()

    // Formatear logs para la UI
    const formattedLogs = logs.map(log => {
        let message = ''
        const details = log.details ? JSON.parse(log.details) : {}

        switch (log.action) {
            case 'LOGIN':
                message = `${log.user.name} inició sesión`
                break
            case 'LOGOUT':
                message = `${log.user.name} cerró sesión`
                break
            case 'CREATE_SALE':
                message = `${log.user.name} registró venta por $${details.total || 0}`
                break
            case 'DELETE_SALE':
                message = `${log.user.name} canceló ticket #${details.folio || log.entityId}`
                break
            case 'UPDATE_PRICE':
                message = `${log.user.name} cambió precio de ${details.productName}: $${details.oldPrice} → $${details.newPrice}`
                break
            case 'CREATE_USER':
                message = `${log.user.name} creó usuario ${details.userName || ''}`
                break
            case 'UPDATE_USER':
                message = `${log.user.name} modificó usuario ${details.userName || ''}`
                break
            case 'DELETE_USER':
                message = `${log.user.name} eliminó usuario ${details.userName || ''}`
                break
            default:
                message = `${log.user.name} realizó ${log.action}`
        }

        return {
            id: log.id,
            message,
            action: log.action,
            entity: log.entity,
            entityId: log.entityId,
            userName: log.user.name,
            createdAt: log.createdAt,
        }
    })

    return {
        logs: formattedLogs,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
    }
})

// ======== RUTAS DE PRODUCTOS ========

fastify.get('/api/products', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'products:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver productos' })
    }

    const { search, category } = request.query as { search?: string; category?: string }

    const products = await prisma.product.findMany({
        where: {
            active: true,
            AND: [
                search ? {
                    OR: [
                        { name: { contains: search } },
                        { code: { contains: search } },
                    ]
                } : {},
                category ? { categoryId: category } : {},
            ],
        },
        include: {
            category: true,
            stocks: {
                where: { branchId: user.branchId || undefined },
            },
        },
        orderBy: { name: 'asc' },
    })

    return products.map(p => ({
        productId: p.id,
        code: p.code,
        name: p.name,
        price: p.price,
        cost: p.cost,
        category: p.category?.name || 'General',
        categoryId: p.categoryId,
        stock: p.stocks[0]?.quantity || 0,
    }))
})

// Crear producto
fastify.post('/api/products', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'products:create')) {
        return reply.code(403).send({ error: 'No tienes permisos para crear productos' })
    }

    const { code, name, price, cost, categoryId, minStock } = request.body as {
        code?: string
        name: string
        price: number
        cost?: number
        categoryId?: string
        minStock?: number
    }

    if (!name || price === undefined) {
        return reply.code(400).send({ error: 'Nombre y precio son requeridos' })
    }

    // Generar código si no se proporciona
    const productCode = code || `PROD-${Date.now().toString(36).toUpperCase()}`

    const product = await prisma.product.create({
        data: {
            code: productCode,
            name,
            price,
            cost: cost || null,
            categoryId: categoryId || null,
            minStock: minStock || 5,
        },
        include: { category: true },
    })

    await logAction(user.id, 'CREATE_PRODUCT', 'Product', product.id, { name, price })

    return product
})

// Actualizar producto
fastify.put('/api/products/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'products:edit')) {
        return reply.code(403).send({ error: 'No tienes permisos para editar productos' })
    }

    const { id } = request.params as { id: string }
    const { name, price, cost, categoryId, active } = request.body as {
        name?: string
        price?: number
        cost?: number | null
        categoryId?: string | null
        active?: boolean
    }

    const product = await prisma.product.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(price !== undefined && { price }),
            ...(cost !== undefined && { cost }),
            ...(categoryId !== undefined && { categoryId }),
            ...(active !== undefined && { active }),
        },
        include: { category: true },
    })

    await logAction(user.id, 'UPDATE_PRODUCT', 'Product', product.id, { name: product.name })

    return product
})

// Eliminar producto (soft delete)
fastify.delete('/api/products/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'products:delete')) {
        return reply.code(403).send({ error: 'No tienes permisos para eliminar productos' })
    }

    const { id } = request.params as { id: string }

    await prisma.product.update({
        where: { id },
        data: { active: false },
    })

    await logAction(user.id, 'DELETE_PRODUCT', 'Product', id, {})

    return { success: true }
})

// ======== RUTAS DE VENTAS ========

// GET all sales (for sales history)
fastify.get('/api/sales', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'sales:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver ventas' })
    }

    const { page = 1, limit = 50, status, paymentMethod, dateFrom, dateTo } = request.query as {
        page?: number
        limit?: number
        status?: string
        paymentMethod?: string
        dateFrom?: string
        dateTo?: string
    }

    const where: any = {}

    if (status) where.status = status.toUpperCase()
    if (paymentMethod) {
        where.payments = { some: { method: paymentMethod.toUpperCase() } }
    }
    if (dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) }
    if (dateTo) where.createdAt = { ...where.createdAt, lte: new Date(dateTo + 'T23:59:59') }

    const sales = await prisma.sale.findMany({
        where,
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
        include: {
            items: true,
            payments: { select: { method: true }, take: 1 },
            customer: { select: { name: true } },
            user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.sale.count({ where })

    return {
        sales: sales.map(s => ({
            id: s.id,
            folio: s.folio,
            total: s.total,
            subtotal: s.subtotal,
            tax: s.taxAmount,
            paymentMethod: s.payments[0]?.method?.toLowerCase() || 'cash',
            status: s.status?.toLowerCase() || 'completed',
            customerName: s.customer?.name || null,
            userName: s.user?.name || 'Sistema',
            createdAt: s.createdAt,
            items: s.items.map(i => ({
                productName: i.productName,
                productCode: i.productCode,
                quantity: i.quantity,
                priceAtSale: i.unitPrice,
                discount: i.discount,
                subtotal: i.subtotal,
            })),
        })),
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
    }
})

fastify.get('/api/sales/daily', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    // Get today's range
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const sales = await prisma.sale.findMany({
        where: {
            userId: user.id,
            createdAt: {
                gte: start,
                lte: end,
            },
            status: { not: 'CANCELLED' }
        },
        include: {
            items: true,
            customer: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    const total = sales.reduce((sum, s) => sum + s.total, 0)
    const count = sales.length

    return {
        sales: sales.map(s => ({
            id: s.id,
            folio: s.folio,
            total: s.total,
            itemsCount: s.items.length,
            customerName: s.customer?.name || 'Público en General',
            createdAt: s.createdAt,
        })),
        summary: {
            total,
            count,
            date: start.toISOString(),
        }
    }
})

fastify.post('/api/sales', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'sales:create')) {
        return reply.code(403).send({ error: 'No tienes permisos para crear ventas' })
    }

    const { items, paymentMethod, amountPaid, customerId, notes } = request.body as {
        items: Array<{ productId: string; quantity: number; price: number; discount: number }>
        paymentMethod: string
        amountPaid: number
        customerId?: string
        notes?: string
    }

    if (!items || items.length === 0) {
        return reply.code(400).send({ error: 'La venta debe tener al menos un producto' })
    }

    // Calcular totales
    const TAX_RATE = 0.16
    const subtotal = items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity
        const itemDiscount = itemTotal * (item.discount / 100)
        return sum + (itemTotal - itemDiscount)
    }, 0)
    const taxAmount = subtotal * TAX_RATE
    const total = subtotal + taxAmount
    const change = paymentMethod === 'CASH' ? Math.max(0, amountPaid - total) : 0

    // Generar folio
    const lastSale = await prisma.sale.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { folio: true },
    })
    const nextFolioNum = lastSale?.folio
        ? parseInt(lastSale.folio.replace('V-', '')) + 1
        : 1
    const folio = `V-${String(nextFolioNum).padStart(6, '0')}`

    // Obtener info de productos para snapshot
    const productInfos = await prisma.product.findMany({
        where: { id: { in: items.map(i => i.productId) } },
        select: { id: true, name: true, code: true },
    })
    const productMap = new Map(productInfos.map(p => [p.id, p]))

    // Crear venta con transacción
    const sale = await prisma.$transaction(async (tx) => {
        // Crear venta
        const newSale = await tx.sale.create({
            data: {
                folio,
                userId: user.id,
                branchId: user.branchId!,
                customerId: customerId || null,
                subtotal,
                taxAmount,
                discount: items.reduce((sum, i) => sum + (i.price * i.quantity * i.discount / 100), 0),
                total,
                status: 'COMPLETED',
                notes: notes || null,
                items: {
                    create: items.map(item => {
                        const prod = productMap.get(item.productId)
                        return {
                            productId: item.productId,
                            productName: prod?.name || 'Producto',
                            productCode: prod?.code || 'N/A',
                            quantity: item.quantity,
                            unitPrice: item.price,
                            discount: item.discount,
                            subtotal: item.price * item.quantity * (1 - item.discount / 100),
                        }
                    }),
                },
            },
            include: { items: true },
        })

        // Actualizar stock
        for (const item of items) {
            await tx.productStock.updateMany({
                where: {
                    productId: item.productId,
                    branchId: user.branchId!,
                },
                data: {
                    quantity: { decrement: item.quantity },
                },
            })
        }

        return newSale
    })

    // Log de la venta
    await logAction(user.id, 'CREATE_SALE', 'Sale', sale.id, {
        folio: sale.folio,
        total: sale.total,
        items: items.length,
        paymentMethod,
    })

    return {
        success: true,
        sale: {
            id: sale.id,
            folio: sale.folio,
            total: sale.total,
            change,
            timestamp: sale.createdAt,
        },
    }
})

// ======== RUTAS DE COTIZACIONES ========

// GET all quotes
fastify.get('/api/quotes', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload
    const { status, customerId, page = 1, limit = 50 } = request.query as {
        status?: string
        customerId?: string
        page?: number
        limit?: number
    }

    const where: any = {}
    if (status) where.status = status.toUpperCase()
    if (customerId) where.customerId = customerId

    const quotes = await prisma.quote.findMany({
        where,
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
        include: {
            items: true,
            customer: { select: { name: true } },
            user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.quote.count({ where })

    return {
        quotes: quotes.map(q => ({
            id: q.id,
            folio: q.folio,
            total: q.total,
            subtotal: q.subtotal,
            tax: q.taxAmount,
            status: q.status.toLowerCase(),
            customerName: q.customer?.name || 'Sin cliente',
            userName: q.user?.name || 'Sistema',
            validUntil: q.validUntil,
            createdAt: q.createdAt,
            itemsCount: q.items.length,
        })),
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
    }
})

// GET single quote
fastify.get('/api/quotes/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const { id } = request.params as { id: string }

    const quote = await prisma.quote.findUnique({
        where: { id },
        include: {
            items: { include: { product: true } },
            customer: true,
            user: { select: { name: true } },
        },
    })

    if (!quote) {
        return reply.code(404).send({ error: 'Cotización no encontrada' })
    }

    return { quote }
})

// POST create quote
fastify.post('/api/quotes', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    const { items, customerId, notes, validUntil } = request.body as {
        items: Array<{ productId: string; quantity: number; price: number; discount: number }>
        customerId?: string
        notes?: string
        validUntil?: string
    }

    if (!items || items.length === 0) {
        return reply.code(400).send({ error: 'La cotización debe tener al menos un producto' })
    }

    const TAX_RATE = 0.16
    const subtotal = items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity
        const itemDiscount = itemTotal * (item.discount / 100)
        return sum + (itemTotal - itemDiscount)
    }, 0)
    const taxAmount = subtotal * TAX_RATE
    const total = subtotal + taxAmount

    // Generate folio
    const lastQuote = await prisma.quote.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { folio: true },
    })
    const lastNumber = lastQuote ? parseInt(lastQuote.folio.split('-')[1]) : 0
    const folio = `COT-${String(lastNumber + 1).padStart(5, '0')}`

    // Get product info
    const productIds = items.map(i => i.productId)
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    const quote = await prisma.quote.create({
        data: {
            folio,
            userId: user.id,
            customerId: customerId || null,
            subtotal,
            taxAmount,
            total,
            status: 'DRAFT',
            validUntil: validUntil ? new Date(validUntil) : null,
            notes: notes || null,
            items: {
                create: items.map(item => {
                    const product = productMap.get(item.productId)!
                    return {
                        productId: item.productId,
                        productName: product.name,
                        productCode: product.code,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        discount: item.discount,
                        subtotal: item.price * item.quantity * (1 - item.discount / 100),
                    }
                }),
            },
        },
        include: { items: true },
    })

    return { success: true, quote }
})

// PUT update quote status
fastify.put('/api/quotes/:id/status', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }

    const validStatuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED']
    if (!validStatuses.includes(status.toUpperCase())) {
        return reply.code(400).send({ error: 'Estado inválido' })
    }

    const quote = await prisma.quote.update({
        where: { id },
        data: { status: status.toUpperCase() },
    })

    return { success: true, quote }
})

// POST convert quote to sale
fastify.post('/api/quotes/:id/convert', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload
    const { id } = request.params as { id: string }
    const { paymentMethod = 'CASH' } = request.body as { paymentMethod?: string }

    const quote = await prisma.quote.findUnique({
        where: { id },
        include: { items: true },
    })

    if (!quote) {
        return reply.code(404).send({ error: 'Cotización no encontrada' })
    }

    if (quote.status === 'CONVERTED') {
        return reply.code(400).send({ error: 'Esta cotización ya fue convertida a venta' })
    }

    // Generate sale folio
    const lastSale = await prisma.sale.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { folio: true },
    })
    const lastNumber = lastSale ? parseInt(lastSale.folio.split('-')[1]) : 0
    const saleFolio = `V-${String(lastNumber + 1).padStart(6, '0')}`

    // Create sale from quote
    const sale = await prisma.$transaction(async (tx) => {
        const newSale = await tx.sale.create({
            data: {
                folio: saleFolio,
                userId: user.id,
                branchId: user.branchId!,
                customerId: quote.customerId,
                subtotal: quote.subtotal,
                taxAmount: quote.taxAmount,
                total: quote.total,
                status: 'COMPLETED',
                notes: `Convertida de cotización ${quote.folio}`,
                items: {
                    create: quote.items.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        productCode: item.productCode,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        discount: item.discount,
                        subtotal: item.subtotal,
                    })),
                },
                payments: {
                    create: {
                        method: paymentMethod,
                        amount: quote.total,
                    },
                },
            },
        })

        // Update stock
        for (const item of quote.items) {
            await tx.productStock.updateMany({
                where: {
                    productId: item.productId,
                    branchId: user.branchId!,
                },
                data: {
                    quantity: { decrement: item.quantity },
                },
            })
        }

        // Update quote status
        await tx.quote.update({
            where: { id },
            data: { status: 'CONVERTED', saleId: newSale.id },
        })

        return newSale
    })

    await logAction(user.id, 'CONVERT_QUOTE', 'Quote', id, {
        quoteFolio: quote.folio,
        saleFolio: sale.folio,
        total: sale.total,
    })

    return {
        success: true,
        sale: {
            id: sale.id,
            folio: sale.folio,
            total: sale.total,
        },
    }
})

// ======== RUTAS DE CLIENTES ========

fastify.get('/api/customers', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'customers:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver clientes' })
    }

    const { search } = request.query as { search?: string }

    const customers = await prisma.customer.findMany({
        where: search ? {
            OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ],
        } : undefined,
        include: {
            _count: { select: { sales: true } },
            sales: {
                select: { total: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
        orderBy: { name: 'asc' },
    })

    return customers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        rfc: c.rfc,
        tags: c.tags ? JSON.parse(c.tags) : [],
        notes: c.notes,
        totalOrders: c._count.sales,
        lastPurchase: c.sales[0]?.createdAt || null,
    }))
})

fastify.post('/api/customers', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'customers:create')) {
        return reply.code(403).send({ error: 'No tienes permisos para crear clientes' })
    }

    const { name, email, phone, address, rfc, tags, notes } = request.body as {
        name: string
        email?: string
        phone?: string
        address?: string
        rfc?: string
        tags?: string[]
        notes?: string
    }

    if (!name) {
        return reply.code(400).send({ error: 'El nombre es requerido' })
    }

    const customer = await prisma.customer.create({
        data: {
            name,
            email: email || null,
            phone: phone || null,
            address: address || null,
            rfc: rfc || null,
            tags: tags ? JSON.stringify(tags) : null,
            notes: notes || null,
        },
    })

    await logAction(user.id, 'CREATE_CUSTOMER', 'Customer', customer.id, { name })

    return customer
})

fastify.put('/api/customers/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'customers:edit')) {
        return reply.code(403).send({ error: 'No tienes permisos para editar clientes' })
    }

    const { id } = request.params as { id: string }
    const { name, email, phone, address, rfc, tags, notes } = request.body as {
        name?: string
        email?: string | null
        phone?: string | null
        address?: string | null
        rfc?: string | null
        tags?: string[]
        notes?: string | null
    }

    const customer = await prisma.customer.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(email !== undefined && { email }),
            ...(phone !== undefined && { phone }),
            ...(address !== undefined && { address }),
            ...(rfc !== undefined && { rfc }),
            ...(tags && { tags: JSON.stringify(tags) }),
            ...(notes !== undefined && { notes }),
        },
    })

    await logAction(user.id, 'UPDATE_CUSTOMER', 'Customer', customer.id, { name: customer.name })

    return customer
})

fastify.delete('/api/customers/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'customers:delete')) {
        return reply.code(403).send({ error: 'No tienes permisos para eliminar clientes' })
    }

    const { id } = request.params as { id: string }

    await prisma.customer.delete({
        where: { id },
    })

    await logAction(user.id, 'DELETE_CUSTOMER', 'Customer', id, {})

    return { success: true }
})

// ======== RUTAS DE PROVEEDORES ========

fastify.get('/api/suppliers', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'suppliers:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver proveedores' })
    }

    const { search } = request.query as { search?: string }

    const suppliers = await prisma.supplier.findMany({
        where: search
            ? {
                OR: [
                    { name: { contains: search } },
                    { contactName: { contains: search } },
                    { email: { contains: search } },
                    { phone: { contains: search } },
                ],
            }
            : undefined,
        include: {
            _count: { select: { purchaseOrders: true } },
        },
        orderBy: { name: 'asc' },
    })

    return suppliers.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        contactName: supplier.contactName,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        notes: supplier.notes,
        totalOrders: supplier._count.purchaseOrders,
        createdAt: supplier.createdAt,
        updatedAt: supplier.updatedAt,
    }))
})

fastify.post('/api/suppliers', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'suppliers:create')) {
        return reply.code(403).send({ error: 'No tienes permisos para crear proveedores' })
    }

    const { name, contactName, email, phone, address, notes } = request.body as {
        name: string
        contactName?: string
        email?: string
        phone?: string
        address?: string
        notes?: string
    }

    if (!name?.trim()) {
        return reply.code(400).send({ error: 'El nombre del proveedor es requerido' })
    }

    const supplier = await prisma.supplier.create({
        data: {
            name: name.trim(),
            contactName: contactName || null,
            email: email || null,
            phone: phone || null,
            address: address || null,
            notes: notes || null,
        },
    })

    await logAction(user.id, 'CREATE_SUPPLIER', 'Supplier', supplier.id, { name: supplier.name })

    return supplier
})

fastify.put('/api/suppliers/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'suppliers:update')) {
        return reply.code(403).send({ error: 'No tienes permisos para editar proveedores' })
    }

    const { id } = request.params as { id: string }
    const { name, contactName, email, phone, address, notes } = request.body as {
        name?: string
        contactName?: string | null
        email?: string | null
        phone?: string | null
        address?: string | null
        notes?: string | null
    }

    const supplier = await prisma.supplier.update({
        where: { id },
        data: {
            ...(name !== undefined && { name: name.trim() }),
            ...(contactName !== undefined && { contactName }),
            ...(email !== undefined && { email }),
            ...(phone !== undefined && { phone }),
            ...(address !== undefined && { address }),
            ...(notes !== undefined && { notes }),
        },
    })

    await logAction(user.id, 'UPDATE_SUPPLIER', 'Supplier', supplier.id, { name: supplier.name })

    return supplier
})

fastify.delete('/api/suppliers/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'suppliers:delete')) {
        return reply.code(403).send({ error: 'No tienes permisos para eliminar proveedores' })
    }

    const { id } = request.params as { id: string }

    const supplierOrders = await prisma.purchaseOrder.count({
        where: { supplierId: id },
    })
    if (supplierOrders > 0) {
        return reply.code(400).send({
            error: 'No se puede eliminar un proveedor con órdenes de compra registradas',
        })
    }

    await prisma.supplier.delete({
        where: { id },
    })

    await logAction(user.id, 'DELETE_SUPPLIER', 'Supplier', id, {})

    return { success: true }
})

// ======== RUTAS DE COMPRAS ========

fastify.get('/api/purchases', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'purchases:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver compras' })
    }

    const { status, supplierId, search } = request.query as {
        status?: string
        supplierId?: string
        search?: string
    }

    const purchases = await prisma.purchaseOrder.findMany({
        where: {
            ...(status ? { status } : {}),
            ...(supplierId ? { supplierId } : {}),
            ...(search
                ? {
                    OR: [
                        { folio: { contains: search } },
                        { supplier: { name: { contains: search } } },
                    ],
                }
                : {}),
        },
        include: {
            supplier: true,
            user: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true } },
            items: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    return purchases.map((purchase) => ({
        id: purchase.id,
        folio: purchase.folio,
        status: purchase.status,
        total: purchase.total,
        notes: purchase.notes,
        expectedAt: purchase.expectedAt,
        receivedAt: purchase.receivedAt,
        createdAt: purchase.createdAt,
        supplier: {
            id: purchase.supplier.id,
            name: purchase.supplier.name,
        },
        branch: purchase.branch,
        createdBy: purchase.user,
        itemsCount: purchase.items.length,
        receivedItems: purchase.items.reduce((sum, item) => sum + item.quantityReceived, 0),
        orderedItems: purchase.items.reduce((sum, item) => sum + item.quantityOrdered, 0),
        items: purchase.items,
    }))
})

fastify.post('/api/purchases', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'purchases:create')) {
        return reply.code(403).send({ error: 'No tienes permisos para crear órdenes de compra' })
    }

    const { supplierId, branchId, expectedAt, notes, items } = (request.body || {}) as {
        supplierId: string
        branchId?: string
        expectedAt?: string
        notes?: string
        items: Array<{
            productId: string
            quantityOrdered: number
            unitCost?: number
        }>
    }

    if (!supplierId || !items?.length) {
        return reply.code(400).send({ error: 'Proveedor e items son requeridos' })
    }

    const effectiveBranchId = branchId || user.branchId
    if (!effectiveBranchId) {
        return reply.code(400).send({ error: 'No se encontró sucursal para la orden de compra' })
    }

    const purchase = await prisma.$transaction(async (tx) => {
        const supplier = await tx.supplier.findUnique({ where: { id: supplierId } })
        if (!supplier) {
            throw new Error('Proveedor no encontrado')
        }

        const branch = await tx.branch.findUnique({ where: { id: effectiveBranchId } })
        if (!branch) {
            throw new Error('Sucursal no encontrada')
        }

        const productIds = items.map((item) => item.productId)
        const products = await tx.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, code: true, name: true, cost: true },
        })

        if (products.length !== productIds.length) {
            throw new Error('Uno o más productos no existen')
        }

        const lastPurchaseOrder = await tx.purchaseOrder.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { folio: true },
        })
        const lastNumber = lastPurchaseOrder ? Number.parseInt(lastPurchaseOrder.folio.split('-')[1], 10) : 0
        const folio = `PO-${String(lastNumber + 1).padStart(6, '0')}`

        const normalizedItems = items.map((item) => {
            const product = products.find((candidate) => candidate.id === item.productId)
            if (!product) {
                throw new Error('Producto inválido')
            }

            if (item.quantityOrdered <= 0) {
                throw new Error(`Cantidad inválida para producto ${product.name}`)
            }

            const unitCost = item.unitCost ?? product.cost ?? 0
            const subtotal = unitCost * item.quantityOrdered

            return {
                productId: product.id,
                productName: product.name,
                productCode: product.code,
                quantityOrdered: item.quantityOrdered,
                quantityReceived: 0,
                unitCost,
                subtotal,
            }
        })

        const total = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0)

        return tx.purchaseOrder.create({
            data: {
                folio,
                supplierId: supplier.id,
                branchId: branch.id,
                userId: user.id,
                status: 'OPEN',
                total,
                notes: notes || null,
                expectedAt: expectedAt ? new Date(expectedAt) : null,
                items: {
                    create: normalizedItems,
                },
            },
            include: {
                supplier: true,
                branch: true,
                items: true,
            },
        })
    })

    await logAction(user.id, 'CREATE_PURCHASE_ORDER', 'PurchaseOrder', purchase.id, {
        folio: purchase.folio,
        supplier: purchase.supplier.name,
        total: purchase.total,
    })

    return purchase
})

fastify.post('/api/purchases/:id/receive', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'purchases:receive')) {
        return reply.code(403).send({ error: 'No tienes permisos para recibir mercancía' })
    }

    const { id } = request.params as { id: string }
    const { items, notes } = (request.body || {}) as {
        items?: Array<{ itemId: string; quantityReceived: number }>
        notes?: string
    }

    const result = await prisma.$transaction(async (tx) => {
        const purchase = await tx.purchaseOrder.findUnique({
            where: { id },
            include: { items: true },
        })

        if (!purchase) {
            throw new Error('Orden de compra no encontrada')
        }

        if (purchase.status === 'CANCELLED') {
            throw new Error('No se puede recibir una orden cancelada')
        }

        const receiveMap = new Map<string, number>()
        if (items?.length) {
            for (const item of items) {
                receiveMap.set(item.itemId, item.quantityReceived)
            }
        }

        for (const item of purchase.items) {
            const requested = receiveMap.has(item.id)
                ? receiveMap.get(item.id) ?? 0
                : item.quantityOrdered - item.quantityReceived

            if (requested <= 0) {
                continue
            }

            const pending = item.quantityOrdered - item.quantityReceived
            const accepted = Math.min(requested, pending)

            if (accepted <= 0) {
                continue
            }

            await tx.purchaseOrderItem.update({
                where: { id: item.id },
                data: {
                    quantityReceived: {
                        increment: accepted,
                    },
                },
            })

            await tx.productStock.upsert({
                where: {
                    productId_branchId: {
                        productId: item.productId,
                        branchId: purchase.branchId,
                    },
                },
                update: {
                    quantity: {
                        increment: accepted,
                    },
                },
                create: {
                    productId: item.productId,
                    branchId: purchase.branchId,
                    quantity: accepted,
                },
            })
        }

        const refreshed = await tx.purchaseOrder.findUnique({
            where: { id: purchase.id },
            include: { items: true },
        })

        if (!refreshed) {
            throw new Error('Error al refrescar la orden de compra')
        }

        const ordered = refreshed.items.reduce((sum, item) => sum + item.quantityOrdered, 0)
        const received = refreshed.items.reduce((sum, item) => sum + item.quantityReceived, 0)
        const newStatus = received === 0
            ? 'OPEN'
            : received < ordered
                ? 'PARTIAL'
                : 'RECEIVED'

        return tx.purchaseOrder.update({
            where: { id: purchase.id },
            data: {
                status: newStatus,
                notes: notes || purchase.notes,
                receivedAt: newStatus === 'RECEIVED' ? new Date() : null,
            },
            include: {
                supplier: true,
                branch: true,
                items: true,
            },
        })
    })

    await logAction(user.id, 'RECEIVE_PURCHASE_ORDER', 'PurchaseOrder', id, {
        folio: result.folio,
        status: result.status,
    })

    return result
})

fastify.put('/api/purchases/:id/status', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'purchases:update')) {
        return reply.code(403).send({ error: 'No tienes permisos para actualizar orden de compra' })
    }

    const { id } = request.params as { id: string }
    const { status, notes } = (request.body || {}) as { status: string; notes?: string }

    const allowedStatuses = new Set(['OPEN', 'PARTIAL', 'RECEIVED', 'CANCELLED'])
    if (!allowedStatuses.has(status)) {
        return reply.code(400).send({ error: 'Estado de orden de compra inválido' })
    }

    const purchase = await prisma.purchaseOrder.update({
        where: { id },
        data: {
            status,
            ...(notes !== undefined && { notes }),
            ...(status === 'RECEIVED' && { receivedAt: new Date() }),
            ...(status !== 'RECEIVED' && { receivedAt: null }),
        },
    })

    await logAction(user.id, 'UPDATE_PURCHASE_ORDER', 'PurchaseOrder', id, {
        status: purchase.status,
    })

    return purchase
})

// ======== RUTAS DE CRM PIPELINE ========

fastify.get('/api/leads', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'leads:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver leads' })
    }

    const { status, search } = request.query as { status?: string; search?: string }
    const where = {
        ...(status ? { status } : {}),
        ...(search
            ? {
                OR: [
                    { name: { contains: search } },
                    { company: { contains: search } },
                    { email: { contains: search } },
                    { phone: { contains: search } },
                ],
            }
            : {}),
    }

    const leads = await prisma.lead.findMany({
        where,
        include: {
            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    })

    return leads
})

fastify.get('/api/leads/reminders', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'leads:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver recordatorios' })
    }

    const { days = 7 } = request.query as { days?: number }
    const horizon = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000)

    const reminders = await prisma.lead.findMany({
        where: {
            nextFollowUpAt: {
                not: null,
                lte: horizon,
            },
            status: {
                notIn: ['WON', 'LOST'],
            },
        },
        include: {
            assignedTo: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: { nextFollowUpAt: 'asc' },
    })

    return reminders
})

fastify.post('/api/leads', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'leads:create')) {
        return reply.code(403).send({ error: 'No tienes permisos para crear leads' })
    }

    const { name, company, email, phone, source, status, estimatedValue, notes, nextFollowUpAt, assignedToId } = request.body as {
        name: string
        company?: string
        email?: string
        phone?: string
        source?: string
        status?: string
        estimatedValue?: number
        notes?: string
        nextFollowUpAt?: string
        assignedToId?: string
    }

    if (!name?.trim()) {
        return reply.code(400).send({ error: 'El nombre del lead es requerido' })
    }

    const allowedStatuses = new Set(['NEW', 'CONTACTED', 'NEGOTIATION', 'WON', 'LOST'])
    const safeStatus = status && allowedStatuses.has(status) ? status : 'NEW'

    const lead = await prisma.lead.create({
        data: {
            name: name.trim(),
            company: company || null,
            email: email || null,
            phone: phone || null,
            source: source || null,
            status: safeStatus,
            estimatedValue: estimatedValue ?? null,
            notes: notes || null,
            nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null,
            assignedToId: assignedToId || user.id,
        },
        include: {
            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    })

    await logAction(user.id, 'CREATE_LEAD', 'Lead', lead.id, {
        name: lead.name,
        status: lead.status,
    })

    return lead
})

fastify.put('/api/leads/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'leads:update')) {
        return reply.code(403).send({ error: 'No tienes permisos para editar leads' })
    }

    const { id } = request.params as { id: string }
    const { name, company, email, phone, source, status, estimatedValue, notes, nextFollowUpAt, assignedToId } = request.body as {
        name?: string
        company?: string | null
        email?: string | null
        phone?: string | null
        source?: string | null
        status?: string
        estimatedValue?: number | null
        notes?: string | null
        nextFollowUpAt?: string | null
        assignedToId?: string | null
    }

    if (status) {
        const allowedStatuses = new Set(['NEW', 'CONTACTED', 'NEGOTIATION', 'WON', 'LOST'])
        if (!allowedStatuses.has(status)) {
            return reply.code(400).send({ error: 'Estado de lead inválido' })
        }
    }

    const lead = await prisma.lead.update({
        where: { id },
        data: {
            ...(name !== undefined && { name: name.trim() }),
            ...(company !== undefined && { company }),
            ...(email !== undefined && { email }),
            ...(phone !== undefined && { phone }),
            ...(source !== undefined && { source }),
            ...(status !== undefined && { status }),
            ...(estimatedValue !== undefined && { estimatedValue }),
            ...(notes !== undefined && { notes }),
            ...(nextFollowUpAt !== undefined && {
                nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null,
            }),
            ...(assignedToId !== undefined && { assignedToId }),
        },
        include: {
            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    })

    await logAction(user.id, 'UPDATE_LEAD', 'Lead', lead.id, {
        status: lead.status,
    })

    return lead
})

fastify.delete('/api/leads/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'leads:delete')) {
        return reply.code(403).send({ error: 'No tienes permisos para eliminar leads' })
    }

    const { id } = request.params as { id: string }
    await prisma.lead.delete({
        where: { id },
    })

    await logAction(user.id, 'DELETE_LEAD', 'Lead', id, {})

    return { success: true }
})

// ======== RUTAS DE GASTOS ========

fastify.get('/api/expenses', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'expenses:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver gastos' })
    }

    const { categoryId } = request.query as { categoryId?: string }

    const expenses = await prisma.expense.findMany({
        where: categoryId ? { categoryId } : undefined,
        include: { category: true },
        orderBy: { date: 'desc' },
    })

    return expenses
})

fastify.post('/api/expenses', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'expenses:create')) {
        return reply.code(403).send({ error: 'No tienes permisos para crear gastos' })
    }

    const { amount, description, categoryId, date } = request.body as {
        amount: number
        description: string
        categoryId?: string
        date?: string
    }

    if (!amount || !description) {
        return reply.code(400).send({ error: 'Monto y descripción son requeridos' })
    }

    const expense = await prisma.expense.create({
        data: {
            amount,
            description,
            categoryId: categoryId || null,
            date: date ? new Date(date) : new Date(),
            userId: user.id,
        },
    })

    await logAction(user.id, 'CREATE_EXPENSE', 'Expense', expense.id, { amount, description })

    return expense
})

fastify.delete('/api/expenses/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'expenses:delete')) {
        return reply.code(403).send({ error: 'No tienes permisos para eliminar gastos' })
    }

    const { id } = request.params as { id: string }

    await prisma.expense.delete({
        where: { id },
    })

    await logAction(user.id, 'DELETE_EXPENSE', 'Expense', id, {})

    return { success: true }
})

// ======== RUTAS DE CATEGORÍAS DE GASTOS ========

fastify.get('/api/expense-categories', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'expenses:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver categorias de gastos' })
    }

    const categories = await prisma.expenseCategory.findMany({
        orderBy: { name: 'asc' },
    })
    return categories
})

// ======== RUTAS DE PERSONAL (RH) ========

// GET Positions
fastify.get('/api/positions', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'employees:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver puestos' })
    }

    const positions = await prisma.position.findMany({
        where: { active: true },
        include: { _count: { select: { employees: true } } },
        orderBy: { name: 'asc' },
    })

    return positions.map(p => ({
        ...p,
        employees: p._count.employees,
    }))
})

// GET Employees
fastify.get('/api/employees', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'employees:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver empleados' })
    }

    const { search } = request.query as { search?: string }

    const employees = await prisma.employee.findMany({
        where: search ? {
            OR: [
                { name: { contains: search } },
                { code: { contains: search } },
                { email: { contains: search } },
            ],
        } : undefined,
        include: { position: true },
        orderBy: { name: 'asc' },
    })

    return employees
})

// POST Employee
fastify.post('/api/employees', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'employees:create')) {
        return reply.code(403).send({ error: 'No tienes permisos para crear empleados' })
    }

    const { name, email, phone, address, positionId, salary, hireDate, birthDate, notes } = request.body as {
        name: string
        email?: string
        phone?: string
        address?: string
        positionId: string
        salary: number
        hireDate: string
        birthDate?: string
        notes?: string
    }

    if (!name || !positionId || !salary || !hireDate) {
        return reply.code(400).send({ error: 'Nombre, puesto, salario y fecha de ingreso son requeridos' })
    }

    // Generar código EMP-XXXXX
    const lastEmployee = await prisma.employee.findFirst({
        orderBy: { code: 'desc' },
    })
    const nextNumber = lastEmployee
        ? parseInt(lastEmployee.code.split('-')[1]) + 1
        : 1
    const code = `EMP-${String(nextNumber).padStart(5, '0')}`

    const employee = await prisma.employee.create({
        data: {
            code,
            name,
            email,
            phone,
            address,
            positionId,
            salary,
            hireDate: new Date(hireDate),
            birthDate: birthDate ? new Date(birthDate) : null,
            notes,
        },
    })

    await logAction(user.id, 'CREATE_EMPLOYEE', 'Employee', employee.id, { name, code })

    return employee
})

// PUT Employee
fastify.put('/api/employees/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'employees:edit')) {
        return reply.code(403).send({ error: 'No tienes permisos para editar empleados' })
    }

    const { id } = request.params as { id: string }
    const { name, email, phone, address, positionId, salary, active, notes } = request.body as {
        name?: string
        email?: string
        phone?: string
        address?: string
        positionId?: string
        salary?: number
        active?: boolean
        notes?: string
    }

    const employee = await prisma.employee.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(email !== undefined && { email }),
            ...(phone !== undefined && { phone }),
            ...(address !== undefined && { address }),
            ...(positionId && { positionId }),
            ...(salary && { salary }),
            ...(active !== undefined && { active }),
            ...(notes !== undefined && { notes }),
        },
    })

    await logAction(user.id, 'UPDATE_EMPLOYEE', 'Employee', employee.id, { name: employee.name })

    return employee
})

// DELETE Employee
fastify.delete('/api/employees/:id', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'employees:delete')) {
        return reply.code(403).send({ error: 'No tienes permisos para eliminar empleados' })
    }

    const { id } = request.params as { id: string }

    await prisma.employee.delete({
        where: { id },
    })

    await logAction(user.id, 'DELETE_EMPLOYEE', 'Employee', id, {})

    return { success: true }
})

// ======== RUTAS DE CATEGORÍAS ========

fastify.get('/api/categories', {
    preHandler: [fastify.authenticate as any],
}, async (request, reply) => {
    const user = request.user as UserPayload

    if (!hasPermission(user.role, 'products:read')) {
        return reply.code(403).send({ error: 'No tienes permisos para ver categorias de productos' })
    }

    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
    })
    return categories
})

// ======== HEALTH CHECK ========

fastify.get('/api/health', async () => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    }
})

// ======== INICIAR SERVIDOR ========

const start = async () => {
    try {
        await registerPlugins()

        const host = process.env.API_HOST || '127.0.0.1'
        const port = Number.parseInt(process.env.PORT || '3001', 10)

        await fastify.listen({ port, host })
        console.log(`\n🚀 Servidor Saori iniciado en http://localhost:${port}`)
        console.log('📋 Endpoints disponibles:')
        console.log('   POST /api/auth/login')
        console.log('   POST /api/auth/refresh')
        console.log('   GET  /api/auth/me')
        console.log('   GET  /api/logs (Admin only)')
        console.log('   GET  /api/health')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()

export { fastify, prisma, logAction, hasPermission, PERMISSIONS }
