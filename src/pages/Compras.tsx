import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useAuthFetch } from '@/stores/authStore'

interface Supplier {
    id: string
    name: string
}

interface Product {
    id: string
    code: string
    name: string
    cost: number | null
}

interface PurchaseItem {
    id: string
    productId: string
    productName: string
    productCode: string
    quantityOrdered: number
    quantityReceived: number
    unitCost: number
    subtotal: number
}

interface Purchase {
    id: string
    folio: string
    status: 'OPEN' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED'
    total: number
    createdAt: string
    expectedAt: string | null
    supplier: Supplier
    items: PurchaseItem[]
    orderedItems: number
    receivedItems: number
}

interface DraftItem {
    productId: string
    quantityOrdered: number
    unitCost: number
}

const initialDraftItem: DraftItem = {
    productId: '',
    quantityOrdered: 1,
    unitCost: 0,
}

const statusLabels: Record<Purchase['status'], string> = {
    OPEN: 'Abierta',
    PARTIAL: 'Parcial',
    RECEIVED: 'Recibida',
    CANCELLED: 'Cancelada',
}

const statusClasses: Record<Purchase['status'], string> = {
    OPEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    RECEIVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export default function Compras() {
    const authFetch = useAuthFetch()
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [statusFilter, setStatusFilter] = useState<'ALL' | Purchase['status']>('ALL')
    const [selectedSupplierId, setSelectedSupplierId] = useState('')
    const [expectedAt, setExpectedAt] = useState('')
    const [notes, setNotes] = useState('')
    const [draftItems, setDraftItems] = useState<DraftItem[]>([{ ...initialDraftItem }])

    useEffect(() => {
        void fetchCatalogs()
        void fetchPurchases()
    }, [])

    async function fetchCatalogs() {
        try {
            const [suppliersRes, productsRes] = await Promise.all([
                authFetch('/suppliers'),
                authFetch('/products'),
            ])

            if (suppliersRes.ok) {
                const suppliersData = await suppliersRes.json()
                setSuppliers(suppliersData)
            }

            if (productsRes.ok) {
                const productsData = await productsRes.json()
                setProducts(Array.isArray(productsData) ? productsData : productsData.products || [])
            }
        } catch (requestError) {
            console.error(requestError)
        }
    }

    async function fetchPurchases() {
        setLoading(true)
        setError('')
        try {
            const query = statusFilter === 'ALL' ? '' : `?status=${statusFilter}`
            const response = await authFetch(`/purchases${query}`)
            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'No se pudieron cargar órdenes de compra')
            }
            const data = await response.json()
            setPurchases(data)
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Error de conexión'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void fetchPurchases()
    }, [statusFilter])

    function resetForm() {
        setSelectedSupplierId('')
        setExpectedAt('')
        setNotes('')
        setDraftItems([{ ...initialDraftItem }])
        setShowForm(false)
    }

    function updateDraftItem(index: number, patch: Partial<DraftItem>) {
        setDraftItems((prev) =>
            prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
        )
    }

    function addDraftItem() {
        setDraftItems((prev) => [...prev, { ...initialDraftItem }])
    }

    function removeDraftItem(index: number) {
        setDraftItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
    }

    const totalDraft = useMemo(
        () =>
            draftItems.reduce((sum, item) => {
                if (!item.productId || item.quantityOrdered <= 0 || item.unitCost <= 0) {
                    return sum
                }
                return sum + item.quantityOrdered * item.unitCost
            }, 0),
        [draftItems],
    )

    async function submitPurchase(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')

        const validItems = draftItems.filter(
            (item) => item.productId && item.quantityOrdered > 0 && item.unitCost > 0,
        )
        if (!selectedSupplierId || validItems.length === 0) {
            setError('Selecciona proveedor y al menos un producto válido')
            return
        }

        setSaving(true)
        try {
            const response = await authFetch('/purchases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supplierId: selectedSupplierId,
                    expectedAt: expectedAt || undefined,
                    notes: notes || undefined,
                    items: validItems,
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'No se pudo crear la orden de compra')
            }

            resetForm()
            await fetchPurchases()
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Error al crear orden'
            setError(message)
        } finally {
            setSaving(false)
        }
    }

    async function receivePurchase(purchase: Purchase) {
        if (!confirm(`¿Registrar recepción de mercancía para ${purchase.folio}?`)) return

        setError('')
        try {
            const response = await authFetch(`/purchases/${purchase.id}/receive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })
            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'No se pudo registrar recepción')
            }
            await fetchPurchases()
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Error al recibir mercancía'
            setError(message)
        }
    }

    function formatMoney(value: number) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(value)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-white">Compras</h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Órdenes de compra y recepción de mercancía con ajuste automático de stock
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                >
                    Nueva orden de compra
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {(['ALL', 'OPEN', 'PARTIAL', 'RECEIVED', 'CANCELLED'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-full text-sm border ${statusFilter === status
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-200 dark:border-gray-700 text-text-secondary-light dark:text-text-secondary-dark'
                            }`}
                    >
                        {status === 'ALL' ? 'Todas' : statusLabels[status]}
                    </button>
                ))}
            </div>

            {error && (
                <div className="rounded-xl p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
                    Cargando compras...
                </div>
            ) : purchases.length === 0 ? (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
                    No hay órdenes de compra registradas
                </div>
            ) : (
                <div className="grid gap-4">
                    {purchases.map((purchase) => (
                        <div
                            key={purchase.id}
                            className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-text-primary-light dark:text-white">{purchase.folio}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses[purchase.status]}`}>
                                            {statusLabels[purchase.status]}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        Proveedor: {purchase.supplier.name}
                                    </p>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        Items recibidos: {purchase.receivedItems}/{purchase.orderedItems}
                                    </p>
                                </div>
                                <div className="text-left lg:text-right">
                                    <p className="text-lg font-semibold text-text-primary-light dark:text-white">
                                        {formatMoney(purchase.total)}
                                    </p>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                        Creada {new Date(purchase.createdAt).toLocaleDateString('es-MX')}
                                    </p>
                                    {purchase.expectedAt && (
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                            Entrega estimada {new Date(purchase.expectedAt).toLocaleDateString('es-MX')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-text-secondary-light dark:text-text-secondary-dark">
                                            <th className="text-left py-2 font-medium">Producto</th>
                                            <th className="text-left py-2 font-medium">Ordenado</th>
                                            <th className="text-left py-2 font-medium">Recibido</th>
                                            <th className="text-left py-2 font-medium">Costo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchase.items.map((item) => (
                                            <tr key={item.id} className="border-t border-gray-100 dark:border-gray-800">
                                                <td className="py-2">
                                                    <div className="font-medium text-text-primary-light dark:text-white">{item.productName}</div>
                                                    <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{item.productCode}</div>
                                                </td>
                                                <td className="py-2">{item.quantityOrdered}</td>
                                                <td className="py-2">{item.quantityReceived}</td>
                                                <td className="py-2">{formatMoney(item.unitCost)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {(purchase.status === 'OPEN' || purchase.status === 'PARTIAL') && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => void receivePurchase(purchase)}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
                                    >
                                        Recibir mercancía
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-3xl bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-text-primary-light dark:text-white">
                                Nueva orden de compra
                            </h2>
                            <button onClick={resetForm} className="text-text-secondary-light dark:text-text-secondary-dark">
                                Cerrar
                            </button>
                        </div>
                        <form onSubmit={submitPurchase} className="p-5 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Proveedor *</label>
                                    <select
                                        value={selectedSupplierId}
                                        onChange={(event) => setSelectedSupplierId(event.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                        required
                                    >
                                        <option value="">Selecciona proveedor</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Entrega estimada</label>
                                    <input
                                        type="date"
                                        value={expectedAt}
                                        onChange={(event) => setExpectedAt(event.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {draftItems.map((item, index) => {
                                    const product = products.find((candidate) => candidate.id === item.productId)
                                    return (
                                        <div key={index} className="grid lg:grid-cols-12 gap-3 items-end">
                                            <div className="lg:col-span-6">
                                                <label className="block text-sm mb-1">Producto *</label>
                                                <select
                                                    value={item.productId}
                                                    onChange={(event) => {
                                                        const selectedProduct = products.find(
                                                            (candidate) => candidate.id === event.target.value,
                                                        )
                                                        updateDraftItem(index, {
                                                            productId: event.target.value,
                                                            unitCost: selectedProduct?.cost ?? 0,
                                                        })
                                                    }}
                                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                                    required
                                                >
                                                    <option value="">Selecciona producto</option>
                                                    {products.map((candidate) => (
                                                        <option key={candidate.id} value={candidate.id}>
                                                            {candidate.code} - {candidate.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="lg:col-span-2">
                                                <label className="block text-sm mb-1">Cantidad</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantityOrdered}
                                                    onChange={(event) =>
                                                        updateDraftItem(index, {
                                                            quantityOrdered: Number(event.target.value),
                                                        })
                                                    }
                                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                                    required
                                                />
                                            </div>
                                            <div className="lg:col-span-3">
                                                <label className="block text-sm mb-1">Costo unitario</label>
                                                <input
                                                    type="number"
                                                    min={0.01}
                                                    step="0.01"
                                                    value={item.unitCost}
                                                    onChange={(event) =>
                                                        updateDraftItem(index, {
                                                            unitCost: Number(event.target.value),
                                                        })
                                                    }
                                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                                    required
                                                />
                                            </div>
                                            <div className="lg:col-span-1">
                                                <button
                                                    type="button"
                                                    onClick={() => removeDraftItem(index)}
                                                    disabled={draftItems.length === 1}
                                                    className="w-full px-3 py-2.5 rounded-xl border border-red-200 text-red-600 disabled:opacity-40"
                                                >
                                                    X
                                                </button>
                                            </div>
                                            {product && (
                                                <div className="lg:col-span-12 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                    Subtotal: {formatMoney(item.quantityOrdered * item.unitCost)}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={addDraftItem}
                                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700"
                            >
                                Agregar línea
                            </button>

                            <div>
                                <label className="block text-sm mb-1">Notas</label>
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-text-primary-light dark:text-white">
                                    Total estimado: {formatMoney(totalDraft)}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium disabled:opacity-60"
                                    >
                                        {saving ? 'Guardando...' : 'Crear orden'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
