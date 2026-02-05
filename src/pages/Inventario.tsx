import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface Product {
    productId: string
    code: string
    name: string
    price: number
    cost: number | null
    category: string
    categoryId: string | null
    stock: number
}

interface Category {
    id: string
    name: string
    color: string | null
}

// Mock inicial (mientras no haya backend conectado)
const mockProducts: Product[] = [
    { productId: 'p1', code: 'PROD-001', name: 'Laptop HP 15"', price: 12500, cost: 10000, category: 'Electrónica', categoryId: 'cat-electronica', stock: 15 },
    { productId: 'p2', code: 'PROD-002', name: 'Mouse Inalámbrico', price: 350, cost: 200, category: 'Electrónica', categoryId: 'cat-electronica', stock: 3 },
    { productId: 'p3', code: 'PROD-003', name: 'Teclado Mecánico', price: 850, cost: 500, category: 'Electrónica', categoryId: 'cat-electronica', stock: 0 },
    { productId: 'p4', code: 'PROD-004', name: 'Monitor 24"', price: 4500, cost: 3500, category: 'Electrónica', categoryId: 'cat-electronica', stock: 12 },
    { productId: 'p5', code: 'PROD-005', name: 'Café Molido 500g', price: 120, cost: 80, category: 'Alimentos', categoryId: 'cat-alimentos', stock: 35 },
]

const mockCategories: Category[] = [
    { id: 'cat-general', name: 'General', color: '#6b7280' },
    { id: 'cat-electronica', name: 'Electrónica', color: '#3b82f6' },
    { id: 'cat-alimentos', name: 'Alimentos', color: '#22c55e' },
]

export default function Inventario() {
    const [products, setProducts] = useState<Product[]>(mockProducts)
    const [categories] = useState<Category[]>(mockCategories)
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    const isAdmin = useAuthStore((state) => state.isAdmin)
    const canEdit = isAdmin()

    // Filtrar productos
    const filteredProducts = products.filter(p => {
        const matchesSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.code.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = !selectedCategory || p.categoryId === selectedCategory
        return matchesSearch && matchesCategory
    })

    // Estadísticas
    const stats = {
        total: products.length,
        lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        value: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    }

    // Abrir modal para nuevo producto
    const handleNew = () => {
        setEditingProduct(null)
        setShowModal(true)
    }

    // Abrir modal para editar
    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setShowModal(true)
    }

    // Guardar producto (crear/editar)
    const handleSave = (data: Partial<Product>) => {
        if (editingProduct) {
            // Editar
            setProducts(prev => prev.map(p =>
                p.productId === editingProduct.productId
                    ? { ...p, ...data }
                    : p
            ))
        } else {
            // Crear nuevo
            const newProduct: Product = {
                productId: `p${Date.now()}`,
                code: data.code || `PROD-${String(products.length + 1).padStart(3, '0')}`,
                name: data.name || '',
                price: data.price || 0,
                cost: data.cost || null,
                category: categories.find(c => c.id === data.categoryId)?.name || 'General',
                categoryId: data.categoryId || null,
                stock: 0,
            }
            setProducts(prev => [...prev, newProduct])
        }
        setShowModal(false)
    }

    // Eliminar producto
    const handleDelete = (productId: string) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            setProducts(prev => prev.filter(p => p.productId !== productId))
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-white">
                        Inventario
                    </h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Gestiona tus productos y controla el stock
                    </p>
                </div>

                {canEdit && (
                    <button
                        onClick={handleNew}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Nuevo Producto
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon="inventory_2"
                    label="Total Productos"
                    value={stats.total}
                    color="primary"
                />
                <StatCard
                    icon="warning"
                    label="Stock Bajo"
                    value={stats.lowStock}
                    color="amber"
                />
                <StatCard
                    icon="error"
                    label="Agotados"
                    value={stats.outOfStock}
                    color="red"
                />
                <StatCard
                    icon="attach_money"
                    label="Valor Total"
                    value={`$${stats.value.toLocaleString()}`}
                    color="emerald"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary-light">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o código..."
                        className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border-0 bg-surface-light dark:bg-surface-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary shadow-sm"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${!selectedCategory
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700'
                            }`}
                    >
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${selectedCategory === cat.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Producto
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Código
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Categoría
                                </th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Precio
                                </th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Stock
                                </th>
                                {canEdit && (
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredProducts.map((product) => (
                                <tr
                                    key={product.productId}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                                            </div>
                                            <span className="font-medium text-text-primary-light dark:text-white">
                                                {product.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm text-text-secondary-light dark:text-text-secondary-dark bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {product.code}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-text-primary-light dark:text-white">
                                            ${product.price.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <StockBadge stock={product.stock} />
                                    </td>
                                    {canEdit && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-text-secondary-light hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.productId)}
                                                    className="p-2 text-text-secondary-light hover:text-red-500 dark:text-text-secondary-dark dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    title="Eliminar"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="material-symbols-outlined text-[48px] text-gray-300 dark:text-gray-600 mb-4">
                            inventory_2
                        </span>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            No se encontraron productos
                        </p>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {showModal && (
                <ProductModal
                    product={editingProduct}
                    categories={categories}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    )
}

// Stat Card Component
function StatCard({
    icon,
    label,
    value,
    color
}: {
    icon: string
    label: string
    value: string | number
    color: 'primary' | 'amber' | 'red' | 'emerald'
}) {
    const colors = {
        primary: 'bg-primary/10 text-primary',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    }

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
                <div className={`size-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
                <div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {label}
                    </p>
                    <p className="text-lg font-bold text-text-primary-light dark:text-white">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    )
}

// Stock Badge Component
function StockBadge({ stock }: { stock: number }) {
    if (stock === 0) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                Agotado
            </span>
        )
    }
    if (stock <= 5) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                {stock} unidades
            </span>
        )
    }
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
            {stock} unidades
        </span>
    )
}

// Product Modal Component
function ProductModal({
    product,
    categories,
    onClose,
    onSave,
}: {
    product: Product | null
    categories: Category[]
    onClose: () => void
    onSave: (data: Partial<Product>) => void
}) {
    const [form, setForm] = useState({
        code: product?.code || '',
        name: product?.name || '',
        price: product?.price || 0,
        cost: product?.cost || 0,
        categoryId: product?.categoryId || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(form)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-text-primary-light dark:text-white">
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="text-text-secondary-light hover:text-text-primary-light">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5">
                    {/* Código */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            Código
                        </label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
                            placeholder="PROD-001"
                            className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Nombre */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Nombre del producto"
                            required
                            className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Precio y Costo */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                                Precio *
                            </label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                                min="0"
                                step="0.01"
                                required
                                className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                                Costo
                            </label>
                            <input
                                type="number"
                                value={form.cost || ''}
                                onChange={(e) => setForm(f => ({ ...f, cost: Number(e.target.value) || 0 }))}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Categoría */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            Categoría
                        </label>
                        <select
                            value={form.categoryId}
                            onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}
                            className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Sin categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        {product ? 'Guardar Cambios' : 'Crear Producto'}
                    </button>
                </form>
            </div>
        </div>
    )
}
