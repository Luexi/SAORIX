import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database for DEMO...')

    // 1. SUCURSAL
    const branch = await prisma.branch.upsert({
        where: { id: 'main-branch' },
        update: {},
        create: {
            id: 'main-branch',
            name: 'Saori Demo Store CDMX',
            address: 'Av. Reforma 222, CDMX',
            phone: '55-1234-5678',
            isMain: true,
        },
    })
    console.log('✓ Sucursal:', branch.name)

    // 2. USUARIOS
    const adminPass = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@saori.local' },
        update: {},
        create: {
            email: 'admin@saori.local',
            password: adminPass,
            name: 'Luis González (CEO)',
            role: 'ADMIN',
            branchId: branch.id,
        },
    })

    const sellerPass = await bcrypt.hash('demo123', 10)
    const seller = await prisma.user.upsert({
        where: { email: 'ventas@saori.local' },
        update: {},
        create: {
            email: 'ventas@saori.local',
            password: sellerPass,
            name: 'Ana Ventas',
            role: 'VENDEDOR',
            branchId: branch.id,
        },
    })
    console.log('✓ Usuarios creados')

    // 3. CATEGORIAS DE PRODUCTOS
    const catsData = [
        { id: 'cat-compu', name: 'Cómputo', color: '#3b82f6' },
        { id: 'cat-gamer', name: 'Gaming', color: '#8b5cf6' },
        { id: 'cat-acc', name: 'Accesorios', color: '#10b981' },
        { id: 'cat-serv', name: 'Servicios', color: '#f59e0b' },
    ]

    for (const c of catsData) {
        await prisma.category.upsert({
            where: { id: c.id },
            update: {},
            create: c,
        })
    }
    console.log('✓ Categorías creadas')

    // 4. PRODUCTOS ("Steve Jobs" style - alta gama para impresionar)
    const productsData = [
        { code: 'MBP-14', name: 'MacBook Pro M3 14"', price: 34999, cost: 28000, categoryId: 'cat-compu' },
        { code: 'MBP-16', name: 'MacBook Pro M3 16"', price: 42999, cost: 35000, categoryId: 'cat-compu' },
        { code: 'IPD-PRO', name: 'iPad Pro 12.9"', price: 24999, cost: 20000, categoryId: 'cat-compu' },
        { code: 'MON-4K', name: 'Monitor LG UltraFine 4K', price: 12500, cost: 9000, categoryId: 'cat-acc' },
        { code: 'MX-KEYS', name: 'Logitech MX Keys', price: 2400, cost: 1500, categoryId: 'cat-acc' },
        { code: 'MX-MASTER', name: 'Logitech MX Master 3S', price: 1800, cost: 1100, categoryId: 'cat-acc' },
        { code: 'PS5-SLIM', name: 'PlayStation 5 Slim', price: 11999, cost: 10500, categoryId: 'cat-gamer' },
        { code: 'XBOX-X', name: 'Xbox Series X', price: 12500, cost: 11000, categoryId: 'cat-gamer' },
        { code: 'SERV-INST', name: 'Instalación de Software', price: 500, cost: 0, categoryId: 'cat-serv', minStock: 0 },
        { code: 'SERV-MANT', name: 'Mantenimiento Preventivo', price: 850, cost: 100, categoryId: 'cat-serv', minStock: 0 },
    ]

    for (const p of productsData) {
        const prod = await prisma.product.upsert({
            where: { code: p.code },
            update: {},
            create: {
                code: p.code,
                name: p.name,
                price: p.price,
                cost: p.cost,
                categoryId: p.categoryId,
                minStock: 5,
            },
        })

        // Stock inicial
        await prisma.productStock.upsert({
            where: { productId_branchId: { productId: prod.id, branchId: branch.id } },
            update: {},
            create: {
                productId: prod.id,
                branchId: branch.id,
                quantity: Math.floor(Math.random() * 20) + 5,
            },
        })
    }
    console.log('✓ Catálogo de productos premium creado')

    // 5. CLIENTES
    const customersData = [
        { name: 'Empresa Demo S.A. de C.V.', email: 'contacto@empresademo.mx', phone: '55-5555-5555' },
        { name: 'Juan Pérez (Freelancer)', email: 'juan@freelance.com', phone: '55-4444-3333' },
        { name: 'Startup Inc.', email: 'admin@startup.io', phone: '55-9999-8888' },
    ]

    const customers = []
    for (const c of customersData) {
        const cust = await prisma.customer.create({ data: c })
        customers.push(cust)
    }

    // 6. VENTAS PASADAS (Para que el dashboard se vea bonito)
    // Generamos ventas en los últimos 7 días
    console.log('Generando historial de ventas...')
    const salesCount = 15
    for (let i = 0; i < salesCount; i++) {
        const daysAgo = Math.floor(Math.random() * 7)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)

        const itemsCount = Math.floor(Math.random() * 3) + 1
        const saleItems = []
        let subtotal = 0

        for (let j = 0; j < itemsCount; j++) {
            const randomProd = productsData[Math.floor(Math.random() * productsData.length)]
            const dbProd = await prisma.product.findUnique({ where: { code: randomProd.code } })
            if (!dbProd) continue

            const qty = Math.floor(Math.random() * 2) + 1
            const lineTotal = dbProd.price * qty
            subtotal += lineTotal

            saleItems.push({
                productId: dbProd.id,
                productName: dbProd.name,
                productCode: dbProd.code,
                quantity: qty,
                unitPrice: dbProd.price,
                subtotal: lineTotal,
            })
        }

        const tax = subtotal * 0.16
        const total = subtotal + tax
        const folio = `V-000${1000 + i}`

        await prisma.sale.upsert({
            where: { folio },
            update: {},
            create: {
                folio: folio,
                userId: Math.random() > 0.5 ? admin.id : seller.id,
                branchId: branch.id,
                customerId: customers[Math.floor(Math.random() * customers.length)].id,
                subtotal,
                taxAmount: tax,
                total,
                status: 'COMPLETED',
                createdAt: date,
                updatedAt: date,
                items: {
                    create: saleItems
                },
                payments: {
                    create: {
                        method: Math.random() > 0.3 ? 'CARD' : 'CASH',
                        amount: total,
                    }
                }
            }
        })
    }
    console.log('✓ Historial de ventas generado')

    // 7. LEADS (CRM)
    await prisma.lead.create({
        data: {
            name: 'Corporativo Santa Fe',
            company: 'Banco Internacional',
            status: 'NEGOTIATION',
            estimatedValue: 150000,
            assignedToId: admin.id,
            nextFollowUpAt: new Date(Date.now() + 86400000), // Mañana
            notes: 'Requieren renovar 10 laptops para directivos. Presupuesto aprobado.',
        }
    })
    console.log('✓ Datos CRM generados')

    // 8. GASTOS (Para gráfica de finanzas)
    await prisma.expenseCategory.upsert({ where: { id: 'cat-rent' }, update: {}, create: { id: 'cat-rent', name: 'Renta' } })
    await prisma.expenseCategory.upsert({ where: { id: 'cat-serv' }, update: {}, create: { id: 'cat-serv', name: 'Servicios' } })

    await prisma.expense.create({
        data: {
            amount: 15000,
            description: 'Renta Oficina Febrero',
            categoryId: 'cat-rent',
            userId: admin.id,
            date: new Date(),
        }
    })

    console.log('\n✨ DEMO DB LISTA ✨')
    console.log('Credenciales: admin@saori.local / admin123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
