import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface Customer {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    rfc: string | null
    tags: string[]
    totalPurchases: number
    lastPurchase: string | null
    notes: string | null
}

// Mock data
const mockCustomers: Customer[] = [
    {
        id: 'c1',
        name: 'María García López',
        email: 'maria@email.com',
        phone: '555-123-4567',
        address: 'Av. Reforma 123, CDMX',
        rfc: 'GALM850101XXX',
        tags: ['VIP', 'Frecuente'],
        totalPurchases: 45600,
        lastPurchase: '2026-01-28',
        notes: 'Prefiere factura electrónica',
    },
    {
        id: 'c2',
        name: 'Juan Pérez Rodríguez',
        email: 'juan.perez@empresa.com',
        phone: '555-987-6543',
        address: 'Calle Norte 456, Monterrey',
        rfc: null,
        tags: ['Mayorista'],
        totalPurchases: 128500,
        lastPurchase: '2026-01-25',
        notes: null,
    },
    {
        id: 'c3',
        name: 'Ana Martínez Sánchez',
        email: null,
        phone: '555-456-7890',
        address: null,
        rfc: null,
        tags: [],
        totalPurchases: 3200,
        lastPurchase: '2026-01-15',
        notes: null,
    },
    {
        id: 'c4',
        name: 'Empresa ABC S.A. de C.V.',
        email: 'compras@empresaabc.com',
        phone: '555-111-2222',
        address: 'Parque Industrial, Guadalajara',
        rfc: 'EAB210301XYZ',
        tags: ['Corporativo', 'Mayorista'],
        totalPurchases: 256000,
        lastPurchase: '2026-01-29',
        notes: 'Crédito a 30 días aprobado',
    },
]

const availableTags = ['VIP', 'Frecuente', 'Mayorista', 'Corporativo', 'Nuevo', 'Moroso']

export default function Clientes() {
    const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
    const [search, setSearch] = useState('')
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [showDetail, setShowDetail] = useState<Customer | null>(null)

    const isAdmin = useAuthStore((state) => state.isAdmin)
    const canEdit = isAdmin()

    // Filtrar clientes
    const filteredCustomers = customers.filter(c => {
        const matchesSearch =
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search)
        const matchesTag = !selectedTag || c.tags.includes(selectedTag)
        return matchesSearch && matchesTag
    })

    // Estadísticas
    const stats = {
        total: customers.length,
        vip: customers.filter(c => c.tags.includes('VIP')).length,
        totalRevenue: customers.reduce((sum, c) => sum + c.totalPurchases, 0),
        activeThisMonth: customers.filter(c =>
            c.lastPurchase && new Date(c.lastPurchase) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
    }

    // Tags únicos
    const usedTags = [...new Set(customers.flatMap(c => c.tags))]

    const handleNew = () => {
        setEditingCustomer(null)
        setShowModal(true)
    }

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer)
        setShowModal(true)
    }

    const handleSave = (data: Partial<Customer>) => {
        if (editingCustomer) {
            setCustomers(prev => prev.map(c =>
                c.id === editingCustomer.id ? { ...c, ...data } : c
            ))
        } else {
            const newCustomer: Customer = {
                id: `c${Date.now()}`,
                name: data.name || '',
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null,
                rfc: data.rfc || null,
                tags: data.tags || [],
                totalPurchases: 0,
                lastPurchase: null,
                notes: data.notes || null,
            }
            setCustomers(prev => [...prev, newCustomer])
        }
        setShowModal(false)
    }

    const handleDelete = (customerId: string) => {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            setCustomers(prev => prev.filter(c => c.id !== customerId))
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-white">
                        CRM - Clientes
                    </h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Gestiona tu cartera de clientes
                    </p>
                </div>

                {canEdit && (
                    <button
                        onClick={handleNew}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Nuevo Cliente
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon="groups" label="Total Clientes" value={stats.total} color="primary" />
                <StatCard icon="star" label="Clientes VIP" value={stats.vip} color="amber" />
                <StatCard icon="trending_up" label="Activos (30d)" value={stats.activeThisMonth} color="emerald" />
                <StatCard icon="attach_money" label="Ingresos Totales" value={`$${(stats.totalRevenue / 1000).toFixed(0)}k`} color="indigo" />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary-light">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, email o teléfono..."
                        className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border-0 bg-surface-light dark:bg-surface-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary shadow-sm"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${!selectedTag
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        Todos
                    </button>
                    {usedTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${selectedTag === tag
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCustomers.map((customer) => (
                    <CustomerCard
                        key={customer.id}
                        customer={customer}
                        canEdit={canEdit}
                        onView={() => setShowDetail(customer)}
                        onEdit={() => handleEdit(customer)}
                        onDelete={() => handleDelete(customer.id)}
                    />
                ))}
            </div>

            {filteredCustomers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-light dark:bg-surface-dark rounded-2xl">
                    <span className="material-symbols-outlined text-[48px] text-gray-300 dark:text-gray-600 mb-4">
                        person_search
                    </span>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
                        No se encontraron clientes
                    </p>
                </div>
            )}

            {/* Customer Modal */}
            {showModal && (
                <CustomerModal
                    customer={editingCustomer}
                    availableTags={availableTags}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}

            {/* Detail Modal */}
            {showDetail && (
                <CustomerDetail
                    customer={showDetail}
                    onClose={() => setShowDetail(null)}
                />
            )}
        </div>
    )
}

// Stat Card
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
    const colors: Record<string, string> = {
        primary: 'bg-primary/10 text-primary',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    }

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
                <div className={`size-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
                <div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{label}</p>
                    <p className="text-lg font-bold text-text-primary-light dark:text-white">{value}</p>
                </div>
            </div>
        </div>
    )
}

// Customer Card
function CustomerCard({
    customer,
    canEdit,
    onView,
    onEdit,
    onDelete,
}: {
    customer: Customer
    canEdit: boolean
    onView: () => void
    onEdit: () => void
    onDelete: () => void
}) {
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg">
                        {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary-light dark:text-white">
                            {customer.name}
                        </h3>
                        {customer.email && (
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                {customer.email}
                            </p>
                        )}
                    </div>
                </div>

                {canEdit && (
                    <div className="flex gap-1">
                        <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-text-secondary-light hover:text-primary">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={onDelete} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-text-secondary-light hover:text-red-500">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Tags */}
            {customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {customer.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Info */}
            <div className="space-y-2 text-sm">
                {customer.phone && (
                    <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                        <span className="material-symbols-outlined text-[16px]">phone</span>
                        {customer.phone}
                    </div>
                )}
                <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                    <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                    Compras: ${customer.totalPurchases.toLocaleString()}
                </div>
                {customer.lastPurchase && (
                    <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        Última: {new Date(customer.lastPurchase).toLocaleDateString('es-MX')}
                    </div>
                )}
            </div>

            {/* View Details Button */}
            <button
                onClick={onView}
                className="w-full mt-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
                Ver detalles
            </button>
        </div>
    )
}

// Customer Modal
function CustomerModal({
    customer,
    availableTags,
    onClose,
    onSave,
}: {
    customer: Customer | null
    availableTags: string[]
    onClose: () => void
    onSave: (data: Partial<Customer>) => void
}) {
    const [form, setForm] = useState({
        name: customer?.name || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        address: customer?.address || '',
        rfc: customer?.rfc || '',
        tags: customer?.tags || [],
        notes: customer?.notes || '',
    })

    const toggleTag = (tag: string) => {
        setForm(f => ({
            ...f,
            tags: f.tags.includes(tag)
                ? f.tags.filter(t => t !== tag)
                : [...f.tags, tag],
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            ...form,
            email: form.email || null,
            phone: form.phone || null,
            address: form.address || null,
            rfc: form.rfc || null,
            notes: form.notes || null,
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-text-primary-light dark:text-white">
                        {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <button onClick={onClose} className="text-text-secondary-light hover:text-text-primary-light">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                            required
                            className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                                Teléfono
                            </label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                                className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            Dirección
                        </label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                            className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            RFC (Facturación)
                        </label>
                        <input
                            type="text"
                            value={form.rfc}
                            onChange={(e) => setForm(f => ({ ...f, rfc: e.target.value.toUpperCase() }))}
                            placeholder="XAXX010101000"
                            className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            Etiquetas
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${form.tags.includes(tag)
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            Notas
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        {customer ? 'Guardar Cambios' : 'Crear Cliente'}
                    </button>
                </form>
            </div>
        </div>
    )
}

// Customer Detail Modal
function CustomerDetail({ customer, onClose }: { customer: Customer; onClose: () => void }) {
    // Mock purchase history
    const purchases = [
        { id: 1, date: '2026-01-28', folio: 'V-000045', total: 1250, items: 3 },
        { id: 2, date: '2026-01-20', folio: 'V-000032', total: 4800, items: 5 },
        { id: 3, date: '2026-01-10', folio: 'V-000019', total: 890, items: 2 },
    ]

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-text-primary-light dark:text-white">
                        Detalle del Cliente
                    </h2>
                    <button onClick={onClose} className="text-text-secondary-light hover:text-text-primary-light">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-5">
                    {/* Customer Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="size-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-2xl">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-primary-light dark:text-white">
                                {customer.name}
                            </h3>
                            {customer.email && (
                                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                    {customer.email}
                                </p>
                            )}
                            {customer.tags.length > 0 && (
                                <div className="flex gap-1.5 mt-2">
                                    {customer.tags.map((tag) => (
                                        <span key={tag} className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-primary">${customer.totalPurchases.toLocaleString()}</p>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Total Compras</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-500">{purchases.length}</p>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Órdenes</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-amber-500">
                                ${Math.round(customer.totalPurchases / purchases.length).toLocaleString()}
                            </p>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Ticket Promedio</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-text-primary-light dark:text-white mb-3">
                            Información de Contacto
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
                            {customer.phone && (
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[18px] text-text-secondary-light">phone</span>
                                    <span>{customer.phone}</span>
                                </div>
                            )}
                            {customer.address && (
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[18px] text-text-secondary-light">location_on</span>
                                    <span>{customer.address}</span>
                                </div>
                            )}
                            {customer.rfc && (
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[18px] text-text-secondary-light">badge</span>
                                    <span>RFC: {customer.rfc}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Purchase History */}
                    <div>
                        <h4 className="text-sm font-semibold text-text-primary-light dark:text-white mb-3">
                            Historial de Compras
                        </h4>
                        <div className="space-y-2">
                            {purchases.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <div>
                                        <p className="font-medium text-text-primary-light dark:text-white">{p.folio}</p>
                                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            {new Date(p.date).toLocaleDateString('es-MX')} • {p.items} productos
                                        </p>
                                    </div>
                                    <p className="font-semibold text-primary">${p.total.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    {customer.notes && (
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1">
                                <span className="material-symbols-outlined text-[18px]">note</span>
                                <span className="text-sm font-medium">Notas</span>
                            </div>
                            <p className="text-sm text-amber-800 dark:text-amber-300">{customer.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
