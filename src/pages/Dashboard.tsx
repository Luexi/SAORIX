import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts'
import { useAuthStore } from '@/stores/authStore'

// Mock data
const salesData = [
    { month: 'May', value: 18000 },
    { month: 'Jun', value: 24000 },
    { month: 'Jul', value: 21000 },
    { month: 'Ago', value: 32000 },
    { month: 'Sep', value: 38000 },
    { month: 'Oct', value: 42500 },
]

const metrics = [
    {
        title: 'Ingresos Totales',
        value: '$124,500',
        change: 12,
        changeType: 'positive' as const,
        icon: 'payments',
    },
    {
        title: 'Nuevos Clientes',
        value: '45',
        change: 5,
        changeType: 'positive' as const,
        icon: 'person_add',
    },
    {
        title: 'Productos Vendidos',
        value: '328',
        change: 0,
        changeType: 'neutral' as const,
        icon: 'inventory_2',
    },
    {
        title: 'Ticket Promedio',
        value: '$380',
        change: -3,
        changeType: 'negative' as const,
        icon: 'receipt',
    },
]

const recentActivity = [
    {
        id: 1,
        type: 'sale',
        message: 'Venta registrada',
        detail: 'Cliente: María García - $1,250',
        time: 'Hace 5 min',
        icon: 'point_of_sale',
        color: 'emerald',
    },
    {
        id: 2,
        type: 'customer',
        message: 'Nuevo cliente registrado',
        detail: 'TechCorp México',
        time: 'Hace 2 horas',
        icon: 'person_add',
        color: 'blue',
    },
    {
        id: 3,
        type: 'stock',
        message: 'Stock bajo',
        detail: 'Producto: Laptop HP 15" - 3 unidades',
        time: 'Hace 3 horas',
        icon: 'warning',
        color: 'amber',
    },
    {
        id: 4,
        type: 'payment',
        message: 'Pago recibido',
        detail: 'Factura #1024 - $4,500',
        time: 'Hace 5 horas',
        icon: 'payments',
        color: 'emerald',
    },
]

export default function Dashboard() {
    const user = useAuthStore((state) => state.user)

    return (
        <div className="flex flex-col gap-8">
            {/* Oripio Style Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary-light dark:text-white mb-2 tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Monitor and control what happens with your money today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-surface-dark rounded-full shadow-soft hover:shadow-md transition-all text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                        <span>{new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#1F2937] dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold text-sm">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {metrics.map((metric) => (
                    <MetricCard key={metric.title} {...metric} />
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="xl:col-span-2 bg-white dark:bg-surface-dark rounded-[24px] shadow-soft border border-gray-100/50 dark:border-gray-700/50 hover:shadow-floating transition-all duration-300">
                    <div className="p-8 border-b border-gray-100/50 dark:border-gray-800/50 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-text-primary-light dark:text-white">
                                Resumen de Ventas
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                                <h2 className="text-3xl font-bold text-text-primary-light dark:text-white">$84,849.93</h2>
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold">+2.1%</span>
                            </div>
                        </div>
                        <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl">
                            <button className="px-4 py-2 text-xs font-bold rounded-lg bg-white dark:bg-surface-dark shadow-sm text-text-primary-light dark:text-white">
                                Monthly
                            </button>
                            <button className="px-4 py-2 text-xs font-bold rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                Weekly
                            </button>
                        </div>
                    </div>
                    <div className="p-8 h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventas']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10B981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white dark:bg-surface-dark rounded-[24px] shadow-soft border border-gray-100/50 dark:border-gray-700/50 flex flex-col max-h-[550px]">
                    <div className="p-8 border-b border-gray-100/50 dark:border-gray-800/50 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-text-primary-light dark:text-white">
                            Actividad Reciente
                        </h3>
                        <button className="text-gray-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="relative pl-2">
                            {/* Timeline line */}
                            <div className="absolute left-[19px] top-2 bottom-6 w-[2px] bg-gray-100 dark:bg-gray-800" />

                            {recentActivity.map((activity, index) => (
                                <ActivityItem
                                    key={activity.id}
                                    {...activity}
                                    isLast={index === recentActivity.length - 1}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Metric Card Component Updated (Oripio Style)
function MetricCard({
    title,
    value,
    change,
    changeType,
    icon
}: {
    title: string
    value: string
    change: number
    changeType: 'positive' | 'negative' | 'neutral'
    icon: string
}) {
    // Colores más sutiles y "pasteles" para Oripio
    const iconContainerColors = {
        positive: 'bg-emerald-50 text-emerald-600',
        negative: 'bg-rose-50 text-rose-600',
        neutral: 'bg-indigo-50 text-indigo-600',
    }

    const trendColors = {
        positive: 'text-emerald-500 bg-emerald-50',
        negative: 'text-rose-500 bg-rose-50',
        neutral: 'text-gray-500 bg-gray-50',
    }

    const trendIcons = {
        positive: 'trending_up',
        negative: 'trending_down',
        neutral: 'remove',
    }

    return (
        <div className="bg-white dark:bg-surface-dark rounded-[24px] p-7 shadow-soft hover:shadow-floating transition-all duration-300 border border-gray-100/50 dark:border-gray-700/50 group">
            <div className="flex justify-between items-start mb-6">
                <div className={`size-12 rounded-2xl flex items-center justify-center ${iconContainerColors[changeType] || 'bg-gray-50 text-gray-600'} transition-transform group-hover:scale-110`}>
                    <span className="material-symbols-outlined text-[24px]">{icon}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${trendColors[changeType]}`}>
                        <span className="material-symbols-outlined text-[14px]">
                            {trendIcons[changeType]}
                        </span>
                        {Math.abs(change)}%
                    </span>
                    <button className="text-gray-300 hover:text-gray-500">
                        <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-1">
                    {title}
                </p>
                <h3 className="text-3xl font-bold text-text-primary-light dark:text-white tracking-tight">
                    {value}
                </h3>
            </div>
        </div>
    )
}

// Activity Item Component
function ActivityItem({
    message,
    detail,
    time,
    icon,
    color,
    isLast,
}: {
    message: string
    detail: string
    time: string
    icon: string
    color: string
    isLast: boolean
}) {
    const colorClasses: Record<string, string> = {
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    }

    return (
        <div className={`relative flex gap-4 ${isLast ? '' : 'pb-6'}`}>
            <div className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white dark:ring-surface-dark ${colorClasses[color]}`}>
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
            <div className="flex flex-col pt-1 flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary-light dark:text-white">
                    {message}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 truncate">
                    {detail}
                </p>
                <span className="text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/70 mt-1">
                    {time}
                </span>
            </div>
        </div>
    )
}
