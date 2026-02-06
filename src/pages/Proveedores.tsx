import { FormEvent, useEffect, useState } from 'react'
import { useAuthFetch } from '@/stores/authStore'

interface Supplier {
    id: string
    name: string
    contactName: string | null
    email: string | null
    phone: string | null
    address: string | null
    notes: string | null
    totalOrders: number
    createdAt: string
}

interface SupplierForm {
    name: string
    contactName: string
    email: string
    phone: string
    address: string
    notes: string
}

const emptyForm: SupplierForm = {
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
}

export default function Proveedores() {
    const authFetch = useAuthFetch()
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
    const [form, setForm] = useState<SupplierForm>(emptyForm)

    useEffect(() => {
        void fetchSuppliers()
    }, [])

    async function fetchSuppliers() {
        setLoading(true)
        setError('')
        try {
            const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
            const response = await authFetch(`/suppliers${query}`)
            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'No se pudo cargar proveedores')
            }
            const data = await response.json()
            setSuppliers(data)
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Error de conexión'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    function openCreateForm() {
        setEditingSupplier(null)
        setForm(emptyForm)
        setShowForm(true)
    }

    function openEditForm(supplier: Supplier) {
        setEditingSupplier(supplier)
        setForm({
            name: supplier.name,
            contactName: supplier.contactName ?? '',
            email: supplier.email ?? '',
            phone: supplier.phone ?? '',
            address: supplier.address ?? '',
            notes: supplier.notes ?? '',
        })
        setShowForm(true)
    }

    async function submitSupplier(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!form.name.trim()) {
            setError('El nombre del proveedor es requerido')
            return
        }

        setSaving(true)
        setError('')
        try {
            const endpoint = editingSupplier ? `/suppliers/${editingSupplier.id}` : '/suppliers'
            const method = editingSupplier ? 'PUT' : 'POST'
            const response = await authFetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    contactName: form.contactName || null,
                    email: form.email || null,
                    phone: form.phone || null,
                    address: form.address || null,
                    notes: form.notes || null,
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'No se pudo guardar proveedor')
            }

            setShowForm(false)
            setForm(emptyForm)
            setEditingSupplier(null)
            await fetchSuppliers()
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Error al guardar'
            setError(message)
        } finally {
            setSaving(false)
        }
    }

    async function deleteSupplier(id: string) {
        if (!confirm('¿Eliminar proveedor? Esta acción no se puede deshacer.')) return
        setError('')
        try {
            const response = await authFetch(`/suppliers/${id}`, { method: 'DELETE' })
            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'No se pudo eliminar proveedor')
            }
            await fetchSuppliers()
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Error al eliminar'
            setError(message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-white">Proveedores</h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Catálogo oficial de proveedores para compras
                    </p>
                </div>
                <button
                    onClick={openCreateForm}
                    className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                >
                    Nuevo proveedor
                </button>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar por nombre, contacto, email o teléfono"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    />
                    <button
                        onClick={() => void fetchSuppliers()}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                        Buscar
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
                    Cargando proveedores...
                </div>
            ) : suppliers.length === 0 ? (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
                    No hay proveedores registrados
                </div>
            ) : (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold">Proveedor</th>
                                    <th className="text-left px-4 py-3 font-semibold">Contacto</th>
                                    <th className="text-left px-4 py-3 font-semibold">Órdenes</th>
                                    <th className="text-left px-4 py-3 font-semibold">Alta</th>
                                    <th className="text-right px-4 py-3 font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map((supplier) => (
                                    <tr key={supplier.id} className="border-t border-gray-100 dark:border-gray-800">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-text-primary-light dark:text-white">
                                                {supplier.name}
                                            </div>
                                            {supplier.address && (
                                                <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                    {supplier.address}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>{supplier.contactName || '-'}</div>
                                            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                {supplier.email || supplier.phone || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{supplier.totalOrders}</td>
                                        <td className="px-4 py-3">
                                            {new Date(supplier.createdAt).toLocaleDateString('es-MX')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditForm(supplier)}
                                                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => void deleteSupplier(supplier.id)}
                                                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-xl bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-text-primary-light dark:text-white">
                                {editingSupplier ? 'Editar proveedor' : 'Nuevo proveedor'}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-text-secondary-light dark:text-text-secondary-dark"
                            >
                                Cerrar
                            </button>
                        </div>
                        <form onSubmit={submitSupplier} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Nombre *</label>
                                <input
                                    value={form.name}
                                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    required
                                />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Contacto</label>
                                    <input
                                        value={form.contactName}
                                        onChange={(event) => setForm({ ...form, contactName: event.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Teléfono</label>
                                    <input
                                        value={form.phone}
                                        onChange={(event) => setForm({ ...form, phone: event.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Dirección</label>
                                    <input
                                        value={form.address}
                                        onChange={(event) => setForm({ ...form, address: event.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Notas</label>
                                <textarea
                                    rows={3}
                                    value={form.notes}
                                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : editingSupplier ? 'Actualizar' : 'Crear proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
