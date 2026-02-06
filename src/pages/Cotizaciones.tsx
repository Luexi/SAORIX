import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthFetch } from '@/stores/authStore'

interface Quote {
    id: string
    folio: string
    total: number
    subtotal: number
    tax: number
    status: string
    customerName: string
    userName: string
    validUntil: string | null
    createdAt: string
    itemsCount: number
}

export default function Cotizaciones() {
    const authFetch = useAuthFetch()
    const navigate = useNavigate()
    const [quotes, setQuotes] = useState<Quote[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [showModal, setShowModal] = useState(false)
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)

    const statusColors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    }

    const statusLabels: Record<string, string> = {
        draft: 'Borrador',
        sent: 'Enviada',
        accepted: 'Aceptada',
        rejected: 'Rechazada',
        converted: 'Convertida',
    }

    const fetchQuotes = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter !== 'all') params.append('status', statusFilter)

            const res = await authFetch(`/quotes?${params}`)
            if (res.ok) {
                const data = await res.json()
                setQuotes(data.quotes)
            }
        } catch (error) {
            console.error('Error fetching quotes:', error)
        } finally {
            setLoading(false)
        }
    }, [authFetch, statusFilter])

    useEffect(() => {
        fetchQuotes()
    }, [fetchQuotes])

    const handleConvertToSale = async (quote: Quote) => {
        if (!confirm(`¿Convertir cotización ${quote.folio} a venta?`)) return

        try {
            const res = await authFetch(`/quotes/${quote.id}/convert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentMethod: 'CASH' })
            })

            if (res.ok) {
                const data = await res.json()
                alert(`¡Venta creada! Folio: ${data.sale.folio}`)
                fetchQuotes()
            } else {
                const error = await res.json()
                alert(error.error || 'Error al convertir')
            }
        } catch (error) {
            console.error('Error converting quote:', error)
        }
    }

    const handleUpdateStatus = async (quote: Quote, newStatus: string) => {
        try {
            const res = await authFetch(`/quotes/${quote.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                fetchQuotes()
                setShowModal(false)
            }
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Cotizaciones
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Gestiona tus cotizaciones y conviértelas a ventas
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/cotizaciones/nueva')}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Nueva Cotización
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {['all', 'draft', 'sent', 'accepted', 'converted'].map(status => {
                        const count = status === 'all'
                            ? quotes.length
                            : quotes.filter(q => q.status === status).length
                        return (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`p-4 rounded-xl border-2 transition-all ${statusFilter === status
                                    ? 'border-primary bg-primary/10'
                                    : 'border-transparent bg-white dark:bg-gray-800'
                                    }`}
                            >
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {count}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                    {status === 'all' ? 'Todas' : statusLabels[status]}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-12 text-center">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
                            progress_activity
                        </span>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando cotizaciones...</p>
                    </div>
                ) : quotes.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">
                            description
                        </span>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">No hay cotizaciones</p>
                        <button
                            onClick={() => navigate('/cotizaciones/nueva')}
                            className="mt-4 text-primary hover:underline"
                        >
                            Crear primera cotización
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Folio
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {quotes.map(quote => (
                                        <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono font-medium text-gray-900 dark:text-white">
                                                    {quote.folio}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                {quote.customerName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                {formatCurrency(quote.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[quote.status]}`}>
                                                    {statusLabels[quote.status]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(quote.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {quote.status !== 'converted' && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedQuote(quote)
                                                                    setShowModal(true)
                                                                }}
                                                                className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                title="Cambiar estado"
                                                            >
                                                                <span className="material-symbols-outlined text-xl">edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleConvertToSale(quote)}
                                                                className="p-2 text-green-500 hover:text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                                                                title="Convertir a venta"
                                                            >
                                                                <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => window.print()}
                                                        className="p-2 text-gray-500 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        title="Imprimir PDF"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">print</span>
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
            </div>

            {/* Status Update Modal */}
            {showModal && selectedQuote && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Cambiar Estado - {selectedQuote.folio}
                        </h3>
                        <div className="space-y-2">
                            {['draft', 'sent', 'accepted', 'rejected'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleUpdateStatus(selectedQuote, status.toUpperCase())}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${selectedQuote.status === status
                                        ? 'bg-primary/10 border-2 border-primary'
                                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${statusColors[status]}`}>
                                        {statusLabels[status]}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
