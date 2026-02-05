import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

// Permisos por rol
const PERMISSIONS = {
    ADMIN: [
        'sales:create', 'sales:read', 'sales:delete',
        'products:create', 'products:read', 'products:update', 'products:delete',
        'users:create', 'users:read', 'users:update', 'users:delete',
        'logs:read',
        'reports:read',
    ],
    SUPERVISOR: [
        'sales:create', 'sales:read',
        'products:create', 'products:read', 'products:update',
        'users:read',
        'reports:read',
    ],
    VENDEDOR: [
        'sales:create', 'sales:read',
        'products:read',
    ],
} as const

// Helper para verificar permisos
function hasPermission(role: keyof typeof PERMISSIONS, permission: string): boolean {
    return PERMISSIONS[role]?.includes(permission as never) ?? false
}

// Crear servidor
const fastify = Fastify({
    logger: {
        level: 'info',
        transport: {
            target: 'pino-pretty',
            options: { colorize: true },
        },
    },
})

// Registrar plugins
async function registerPlugins() {
    await fastify.register(cors, {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
    })

    await fastify.register(jwt, {
        secret: process.env.JWT_SECRET || 'saori-erp-secret-key-2024',
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

fastify.get('/api/expense-categories', async () => {
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

fastify.get('/api/categories', async () => {
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

        const host = '0.0.0.0'
        const port = parseInt(process.env.PORT || '3001')

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
