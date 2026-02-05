import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Crear sucursal principal
    const branch = await prisma.branch.upsert({
        where: { id: 'main-branch' },
        update: {},
        create: {
            id: 'main-branch',
            name: 'Sucursal Principal',
            address: 'Calle Principal #123',
            phone: '555-123-4567',
            isMain: true,
        },
    })
    console.log('✓ Sucursal creada:', branch.name)

    // Crear usuario ADMIN
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@saori.local' },
        update: {},
        create: {
            email: 'admin@saori.local',
            password: adminPassword,
            name: 'Carlos Admin',
            role: 'ADMIN',
            branchId: branch.id,
        },
    })
    console.log('✓ Usuario ADMIN creado:', admin.email)

    // Crear usuario EMPLEADO (Vendedor)
    const empleadoPassword = await bcrypt.hash('empleado123', 10)
    const empleado = await prisma.user.upsert({
        where: { email: 'empleado@saori.local' },
        update: {},
        create: {
            email: 'empleado@saori.local',
            password: empleadoPassword,
            name: 'María Vendedora',
            role: 'VENDEDOR',
            branchId: branch.id,
        },
    })
    console.log('✓ Usuario EMPLEADO creado:', empleado.email)

    // Crear categorías de productos
    const categorias = await Promise.all([
        prisma.category.upsert({
            where: { id: 'cat-general' },
            update: {},
            create: { id: 'cat-general', name: 'General', color: '#6b7280' },
        }),
        prisma.category.upsert({
            where: { id: 'cat-electronica' },
            update: {},
            create: { id: 'cat-electronica', name: 'Electrónica', color: '#3b82f6' },
        }),
        prisma.category.upsert({
            where: { id: 'cat-alimentos' },
            update: {},
            create: { id: 'cat-alimentos', name: 'Alimentos', color: '#22c55e' },
        }),
    ])
    console.log('✓ Categorías creadas:', categorias.length)

    // Crear productos de ejemplo
    const productos = [
        { code: 'PROD-001', name: 'Laptop HP 15"', price: 12500, cost: 10000, categoryId: 'cat-electronica' },
        { code: 'PROD-002', name: 'Mouse Inalámbrico', price: 350, cost: 200, categoryId: 'cat-electronica' },
        { code: 'PROD-003', name: 'Teclado Mecánico', price: 850, cost: 500, categoryId: 'cat-electronica' },
        { code: 'PROD-004', name: 'Monitor 24"', price: 4500, cost: 3500, categoryId: 'cat-electronica' },
        { code: 'PROD-005', name: 'Café Molido 500g', price: 120, cost: 80, categoryId: 'cat-alimentos' },
    ]

    for (const prod of productos) {
        const product = await prisma.product.upsert({
            where: { code: prod.code },
            update: {},
            create: prod,
        })

        await prisma.productStock.upsert({
            where: {
                productId_branchId: {
                    productId: product.id,
                    branchId: branch.id,
                },
            },
            update: {},
            create: {
                productId: product.id,
                branchId: branch.id,
                quantity: Math.floor(Math.random() * 50) + 10,
            },
        })
    }
    console.log('✓ Productos creados:', productos.length)

    // Crear categorías de gastos
    await Promise.all([
        prisma.expenseCategory.upsert({
            where: { id: 'exp-renta' },
            update: {},
            create: { id: 'exp-renta', name: 'Renta', description: 'Pagos de alquiler' },
        }),
        prisma.expenseCategory.upsert({
            where: { id: 'exp-servicios' },
            update: {},
            create: { id: 'exp-servicios', name: 'Servicios', description: 'Luz, agua, internet' },
        }),
        prisma.expenseCategory.upsert({
            where: { id: 'exp-nomina' },
            update: {},
            create: { id: 'exp-nomina', name: 'Nómina', description: 'Sueldos y salarios' },
        }),
    ])
    console.log('✓ Categorías de gastos creadas')

    // Crear logs de ejemplo
    await prisma.activityLog.create({
        data: {
            userId: admin.id,
            action: 'LOGIN',
            entity: 'User',
            entityId: admin.id,
            details: JSON.stringify({ ip: '192.168.1.100', browser: 'Chrome' }),
        },
    })
    await prisma.activityLog.create({
        data: {
            userId: empleado.id,
            action: 'CREATE_SALE',
            entity: 'Sale',
            entityId: 'sale-demo-001',
            details: JSON.stringify({ total: 1250, items: 3 }),
        },
    })
    await prisma.activityLog.create({
        data: {
            userId: admin.id,
            action: 'UPDATE_PRICE',
            entity: 'Product',
            entityId: 'prod-001',
            details: JSON.stringify({ oldPrice: 300, newPrice: 350, productName: 'Mouse Inalámbrico' }),
        },
    })
    console.log('✓ Logs de ejemplo creados')

    console.log('\n🎉 Seed completado!')
    console.log('\n📋 Credenciales de acceso:')
    console.log('   ADMIN:    admin@saori.local / admin123')
    console.log('   EMPLEADO: empleado@saori.local / empleado123')
    console.log('\n📌 Permisos:')
    console.log('   ADMIN: Puede borrar ventas, cambiar precios, modificar usuarios, ver logs')
    console.log('   EMPLEADO: Solo puede realizar ventas y consultas')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
