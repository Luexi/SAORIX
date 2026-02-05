import { useState, useEffect } from 'react'
import { useAuthStore, useAuthFetch } from '@/stores/authStore'
import { Navigate } from 'react-router-dom'

interface LogEntry {
    id: string
    message: string
    action: string
    entity: string | null
    entityId: string | null
    userName: string
    createdAt: string
}

// Mock logs para desarrollo sin backend
const mockLogs: LogEntry[] = [
    {
        id: '1',
        message: 'Carlos Admin inició sesión',
        action: 'LOGIN',
        entity: 'User',
        entityId: 'admin-1',
        userName: 'Carlos Admin',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // hace 5 min
    },
    {
        id: '2',
        message: 'María Vendedora registró venta por $1,250',
        action: 'CREATE_SALE',
        entity: 'Sale',
        entityId: 'sale-001',
        userName: 'María Vendedora',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // hace 30 min
    },
    {
        id: '3',
        message: 'Carlos Admin canceló ticket #455',
        action: 'DELETE_SALE',
        entity: 'Sale',
        entityId: '455',
        userName: 'Carlos Admin',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // hace 2 horas
    },
    {
        id: '4',
        message: 'Carlos Admin cambió precio de Mouse Inalámbrico: $300 → $350',
        action: 'UPDATE_PRICE',
        entity: 'Product',
        entityId: 'prod-002',
        userName: 'Carlos Admin',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // hace 3 horas
    },
    {
        id: '5',
        message: 'María Vendedora registró venta por $4,500',
        action: 'CREATE_SALE',
        entity: 'Sale',
        entityId: 'sale-002',
        userName: 'María Vendedora',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // hace 5 horas
    },
]

export default function Logs() {
    const { hasPermission, isAdmin } = useAuthStore()
    const authFetch = useAuthFetch()

    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    // Verificar permisos - solo admin puede ver logs
    if (!hasPermission('logs:read') && !isAdmin()) {
        return <Navigate to="/" replace />
    }

    useEffect(() => {
        loadLogs()
    }, [])

    const loadLogs = async () => {
        setLoading(true)
        try {
            const response = await authFetch('/logs')
            if (response.ok) {
                const data = await response.json()
                setLogs(data.logs)
            } else {
                // Fallback a mock data
                setLogs(mockLogs)
            }
        } catch {
            // Usar mock data en desarrollo
            setLogs(mockLogs)
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = filter === 'all'
        ? logs
        : logs.filter(log => log.action === filter)

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)

        if (minutes < 60) {
            return `Hace ${minutes} min`
        } else if (hours < 24) {
            return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
        } else {
            return date.toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            })
        }
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'LOGIN': return 'login'
            case 'LOGOUT': return 'logout'
            case 'CREATE_SALE': return 'point_of_sale'
            case 'DELETE_SALE': return 'cancel'
            case 'UPDATE_PRICE': return 'price_change'
            case 'CREATE_USER': return 'person_add'
            case 'UPDATE_USER': return 'manage_accounts'
            case 'DELETE_USER': return 'person_remove'
            default: return 'info'
        }
    }

    const getActionColor = (action: string) => {
        switch (action) {
            case 'LOGIN':
            case 'CREATE_SALE':
            case 'CREATE_USER':
                return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            case 'DELETE_SALE':
            case 'DELETE_USER':
            case 'LOGOUT':
                return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
            case 'UPDATE_PRICE':
            case 'UPDATE_USER':
                return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
            default:
                return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-white">
                        Registro de Actividad
                    </h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                        Historial de acciones del sistema
                    </p>
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                    {['all', 'CREATE_SALE', 'DELETE_SALE', 'UPDATE_PRICE', 'LOGIN'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === f
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            {f === 'all' ? 'Todos' :
                                f === 'CREATE_SALE' ? 'Ventas' :
                                    f === 'DELETE_SALE' ? 'Cancelaciones' :
                                        f === 'UPDATE_PRICE' ? 'Precios' :
                                            f === 'LOGIN' ? 'Accesos' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-floating border border-gray-100 dark:border-gray-800">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <span className="material-symbols-outlined text-[32px] animate-spin text-primary">
                            progress_activity
                        </span>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="material-symbols-outlined text-[48px] text-gray-300 dark:text-gray-600 mb-4">
                            history
                        </span>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            No hay registros que mostrar
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-start gap-4 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                {/* Icon */}
                                <div className={`flex-none size-10 rounded-full flex items-center justify-center ${getActionColor(log.action)}`}>
                                    <span className="material-symbols-outlined text-[20px]">
                                        {getActionIcon(log.action)}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-primary-light dark:text-white">
                                        {log.message}
                                    </p>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                                        {formatTime(log.createdAt)}
                                    </p>
                                </div>

                                {/* Action Badge */}
                                <div className="flex-none">
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                                        {log.action.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Note */}
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark text-center">
                Los registros se mantienen por 90 días. Solo administradores pueden ver esta sección.
            </p>
        </div>
    )
}
