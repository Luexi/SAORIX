import { useState, useEffect, useMemo } from 'react'
import { useAuthFetch } from '@/stores/authStore'

interface SaleItem {
    productName: string
    productCode: string
    quantity: number
    priceAtSale: number
    discount: number
    subtotal: number
}

interface Sale {
    id: string
    folio: string
    total: number
    subtotal: number
    tax: number
    paymentMethod: string
    status: string
    customerName: string | null
    userName: string
    createdAt: string
    items: SaleItem[]
}

const paymentMethodLabels: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
}

const statusLabels: Record<string, { label: string; color: string }> = {
    completed: { label: 'Completada', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export default function HistorialVentas() {
    const authFetch = useAuthFetch()
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

    // Filters
    const [search, setSearch] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')

    // Pagination
    const [page, setPage] = useState(1)
    const itemsPerPage = 20

    useEffect(() => {
        fetchSales()
    }, [])

    const fetchSales = async () => {
        try {
            setLoading(true)
            const response = await authFetch('/api/sales')
            if (response.ok) {
                const data = await response.json()
                setSales(data.sales || data)
            } else {
                setError('Error al cargar ventas')
            }
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    // Filtered and paginated sales
    const filteredSales = useMemo(() => {
        return sales.filter((sale) => {
            // Search filter
            const matchesSearch =
                !search ||
                sale.folio.toLowerCase().includes(search.toLowerCase()) ||
                (sale.customerName?.toLowerCase().includes(search.toLowerCase())) ||
                sale.userName.toLowerCase().includes(search.toLowerCase())

            // Date filters
            const saleDate = new Date(sale.createdAt)
            const matchesDateFrom = !dateFrom || saleDate >= new Date(dateFrom)
            const matchesDateTo = !dateTo || saleDate <= new Date(dateTo + 'T23:59:59')

            // Status filter
            const matchesStatus = statusFilter === 'all' || sale.status === statusFilter

            // Payment method filter
            const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter

            return matchesSearch && matchesDateFrom && matchesDateTo && matchesStatus && matchesPayment
        })
    }, [sales, search, dateFrom, dateTo, statusFilter, paymentFilter])

    const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
    const paginatedSales = filteredSales.slice((page - 1) * itemsPerPage, page * itemsPerPage)

    // Summary stats
    const stats = useMemo(() => {
        const total = filteredSales.reduce((acc, s) => acc + s.total, 0)
        const count = filteredSales.length
        const avgTicket = count > 0 ? total / count : 0
        return { total, count, avgTicket }
    }, [filteredSales])

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const clearFilters = () => {
        setSearch('')
        setDateFrom('')
        setDateTo('')
        setStatusFilter('all')
        setPaymentFilter('all')
        setPage(1)
    }

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
                        Historial de Ventas
                    </h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Consulta y filtra todas las ventas realizadas
                    </p>
                </div>
                <button
                    onClick={fetchSales}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                    Actualizar
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">receipt_long</span>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                Total Ventas
                            </p>
                            <p className="text-2xl font-bold text-text-primary-light dark:text-white">
                                {stats.count}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                Monto Total
                            </p>
                            <p className="text-2xl font-bold text-green-500">
                                ${stats.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <span className="material-symbols-outlined">avg_pace</span>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                Ticket Promedio
                            </p>
                            <p className="text-2xl font-bold text-blue-500">
                                ${stats.avgTicket.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary-light">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por folio, cliente o vendedor..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Date From */}
                    <div>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Status */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="completed">Completada</option>
                        <option value="pending">Pendiente</option>
                        <option value="cancelled">Cancelada</option>
                    </select>

                    {/* Payment */}
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="px-4 py-2.5 text-sm rounded-lg border-0 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">Todos los pagos</option>
                        <option value="cash">Efectivo</option>
                        <option value="card">Tarjeta</option>
                        <option value="transfer">Transferencia</option>
                    </select>

                    {/* Clear Filters */}
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2.5 text-sm font-medium text-text-secondary-light hover:text-text-primary-light transition-colors"
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Sales Table */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Folio
                                </th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Vendedor
                                </th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Pago
                                </th>
                                <th className="text-left px-5 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="text-right px-5 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="text-right px-5 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {paginatedSales.map((sale) => (
                                <tr
                                    key={sale.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                                >
                                    <td className="px-5 py-4">
                                        <span className="font-mono text-sm font-medium text-primary">
                                            {sale.folio}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-text-primary-light dark:text-white">
                                        {formatDate(sale.createdAt)}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-text-primary-light dark:text-white">
                                        {sale.customerName || 'Público General'}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        {sale.userName}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-sm">
                                            {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusLabels[sale.status]?.color || 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {statusLabels[sale.status]?.label || sale.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="text-sm font-semibold text-text-primary-light dark:text-white">
                                            ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedSale(sale)}
                                            className="text-primary hover:text-primary-dark transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                visibility
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {paginatedSales.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="material-symbols-outlined text-[48px] text-gray-300 dark:text-gray-600 mb-4">
                            receipt_long
                        </span>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            No se encontraron ventas
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            Mostrando {(page - 1) * itemsPerPage + 1} a{' '}
                            {Math.min(page * itemsPerPage, filteredSales.length)} de {filteredSales.length}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sale Detail Modal */}
            {selectedSale && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h2 className="text-xl font-bold text-text-primary-light dark:text-white">
                                    Detalle de Venta
                                </h2>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    {selectedSale.folio}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="text-text-secondary-light hover:text-text-primary-light"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto max-h-[calc(80vh-80px)]">
                            {/* Sale Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                        Fecha
                                    </p>
                                    <p className="font-medium text-text-primary-light dark:text-white">
                                        {formatDate(selectedSale.createdAt)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                        Cliente
                                    </p>
                                    <p className="font-medium text-text-primary-light dark:text-white">
                                        {selectedSale.customerName || 'Público General'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                        Vendedor
                                    </p>
                                    <p className="font-medium text-text-primary-light dark:text-white">
                                        {selectedSale.userName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                        Método de Pago
                                    </p>
                                    <p className="font-medium text-text-primary-light dark:text-white">
                                        {paymentMethodLabels[selectedSale.paymentMethod]}
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-text-primary-light dark:text-white mb-3">
                                    Productos
                                </h3>
                                <div className="space-y-2">
                                    {selectedSale.items?.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-text-primary-light dark:text-white">
                                                    {item.productName}
                                                </p>
                                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                    {item.quantity} x ${item.priceAtSale.toFixed(2)}
                                                    {item.discount > 0 && (
                                                        <span className="text-green-500 ml-2">
                                                            (-{item.discount}%)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-text-primary-light dark:text-white">
                                                ${item.subtotal.toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary-light dark:text-text-secondary-dark">
                                        Subtotal
                                    </span>
                                    <span className="text-text-primary-light dark:text-white">
                                        ${selectedSale.subtotal?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary-light dark:text-text-secondary-dark">
                                        IVA (16%)
                                    </span>
                                    <span className="text-text-primary-light dark:text-white">
                                        ${selectedSale.tax?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-text-primary-light dark:text-white">Total</span>
                                    <span className="text-primary">${selectedSale.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
