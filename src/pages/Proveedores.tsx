import { useState, useEffect } from 'react'
import { useAuthFetch } from '@/stores/authStore'

interface Proveedor {
    id: string
    name: string
    rfc?: string
    phone?: string
    email?: string
    address?: string
    contactPerson?: string
    notes?: string
    active: boolean
    createdAt: string
}

export default function Proveedores() {
    const authFetch = useAuthFetch()
    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)

    // Form state
    const [form, setForm] = useState({
        name: '',
        rfc: '',
        phone: '',
        email: '',
        address: '',
        contactPerson: '',
        notes: '',
    })

    useEffect(() => {
        fetchProveedores()
    }, [])

    const fetchProveedores = async () => {
        try {
            setLoading(true)
            const response = await authFetch('/api/providers')
            if (response.ok) {
                const data = await response.json()
                setProveedores(data)
            } else {
                // API no existe aún, usar mock data
                setProveedores([
                    {
                        id: '1',
                        name: 'Distribuidora ABC',
                        rfc: 'DAB123456XYZ',
                        phone: '555-1234567',
                        email: 'ventas@distribuidoraabc.com',
                        address: 'Av. Industrial 123, CDMX',
                        contactPerson: 'Juan Pérez',
                        notes: 'Proveedor principal de electrónicos',
                        active: true,
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: '2',
                        name: 'Mayorista Tech',
                        rfc: 'MTE987654ABC',
                        phone: '555-7654321',
                        email: 'compras@mayoristatech.com',
                        address: 'Blvd. Tecnología 456, GDL',
                        contactPerson: 'María López',
                        notes: '',
                        active: true,
                        createdAt: new Date().toISOString(),
                    },
                ])
            }
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingProveedor
                ? `/api/providers/${editingProveedor.id}`
                : '/api/providers'
            const method = editingProveedor ? 'PUT' : 'POST'

            const response = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            if (response.ok) {
                fetchProveedores()
                resetForm()
            } else {
                // Mock success para demo
                const newProveedor: Proveedor = {
                    id: editingProveedor?.id || Date.now().toString(),
                    ...form,
                    active: true,
                    createdAt: editingProveedor?.createdAt || new Date().toISOString(),
                }

                if (editingProveedor) {
                    setProveedores(proveedores.map((p) => (p.id === editingProveedor.id ? newProveedor : p)))
                } else {
                    setProveedores([...proveedores, newProveedor])
                }
                resetForm()
            }
        } catch (err) {
            setError('Error al guardar proveedor')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este proveedor?')) return

        try {
            const response = await authFetch(`/api/providers/${id}`, { method: 'DELETE' })
            if (response.ok) {
                fetchProveedores()
            } else {
                // Mock delete
                setProveedores(proveedores.filter((p) => p.id !== id))
            }
        } catch (err) {
            setError('Error al eliminar proveedor')
        }
    }

    const handleEdit = (proveedor: Proveedor) => {
        setEditingProveedor(proveedor)
        setForm({
            name: proveedor.name,
            rfc: proveedor.rfc || '',
            phone: proveedor.phone || '',
            email: proveedor.email || '',
            address: proveedor.address || '',
            contactPerson: proveedor.contactPerson || '',
            notes: proveedor.notes || '',
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setForm({ name: '', rfc: '', phone: '', email: '', address: '', contactPerson: '', notes: '' })
        setEditingProveedor(null)
        setShowModal(false)
    }

    const filteredProveedores = proveedores.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.rfc?.toLowerCase().includes(search.toLowerCase()) ||
            p.email?.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-white">
                        Proveedores
                    </h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Gestiona tus proveedores y contactos
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Nuevo Proveedor
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary-light">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                </span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, RFC o email..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border-0 bg-surface-light dark:bg-surface-dark ring-1 ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary"
                />
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Proveedores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProveedores.map((proveedor) => (
                    <div
                        key={proveedor.id}
                        className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 hover:border-primary transition-colors"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {proveedor.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary-light dark:text-white">
                                        {proveedor.name}
                                    </h3>
                                    {proveedor.rfc && (
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                            RFC: {proveedor.rfc}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleEdit(proveedor)}
                                    className="p-1.5 text-text-secondary-light hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(proveedor.id)}
                                    className="p-1.5 text-text-secondary-light hover:text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            {proveedor.contactPerson && (
                                <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-[16px]">person</span>
                                    {proveedor.contactPerson}
                                </div>
                            )}
                            {proveedor.phone && (
                                <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-[16px]">phone</span>
                                    {proveedor.phone}
                                </div>
                            )}
                            {proveedor.email && (
                                <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-[16px]">email</span>
                                    {proveedor.email}
                                </div>
                            )}
                            {proveedor.address && (
                                <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                    <span className="line-clamp-1">{proveedor.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredProveedores.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="material-symbols-outlined text-[48px] text-gray-300 dark:text-gray-600 mb-4">
                        local_shipping
                    </span>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
                        No se encontraron proveedores
                    </p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-text-primary-light dark:text-white">
                                {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h2>
                            <button onClick={resetForm} className="text-text-secondary-light hover:text-text-primary-light">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1.5">Nombre *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">RFC</label>
                                    <input
                                        type="text"
                                        value={form.rfc}
                                        onChange={(e) => setForm({ ...form, rfc: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Contacto</label>
                                    <input
                                        type="text"
                                        value={form.contactPerson}
                                        onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1.5">Dirección</label>
                                    <input
                                        type="text"
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1.5">Notas</label>
                                    <textarea
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-text-secondary-light hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                                >
                                    {editingProveedor ? 'Guardar Cambios' : 'Crear Proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
