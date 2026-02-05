import { useState } from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'

// Mock data
const salesByMonth = [
    { month: 'Ene', ventas: 45000, meta: 50000 },
    { month: 'Feb', ventas: 52000, meta: 50000 },
    { month: 'Mar', ventas: 48000, meta: 52000 },
    { month: 'Abr', ventas: 61000, meta: 55000 },
    { month: 'May', ventas: 55000, meta: 55000 },
    { month: 'Jun', ventas: 67000, meta: 60000 },
]

const topProducts = [
    { name: 'Laptop HP 15"', ventas: 45, ingresos: 562500 },
    { name: 'Monitor 24"', ventas: 38, ingresos: 171000 },
    { name: 'Teclado Mecánico', ventas: 72, ingresos: 61200 },
    { name: 'Mouse Inalámbrico', ventas: 95, ingresos: 33250 },
    { name: 'Audífonos Bluetooth', ventas: 44, ingresos: 34320 },
]

const salesByCategory = [
    { name: 'Electrónica', value: 65, color: '#6366f1' },
    { name: 'Alimentos', value: 20, color: '#22c55e' },
    { name: 'Oficina', value: 10, color: '#f59e0b' },
    { name: 'Otros', value: 5, color: '#8b5cf6' },
]

const salesByEmployee = [
    { name: 'Carlos R.', ventas: 120, monto: 185000 },
    { name: 'Ana L.', ventas: 98, monto: 156000 },
    { name: 'Pedro S.', ventas: 87, monto: 132000 },
]

type ReportType = 'ventas' | 'productos' | 'empleados'

export default function Reportes() {
    const [reportType, setReportType] = useState<ReportType>('ventas')
    const [dateRange, setDateRange] = useState('month')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary-light dark:text-white">
                        Reportes
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
                        Análisis y métricas de tu negocio
                    </p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 rounded-xl border-0 bg-surface-light dark:bg-surface-dark ring-1 ring-gray-200 dark:ring-gray-700 text-sm"
                    >
                        <option value="week">Última semana</option>
                        <option value="month">Último mes</option>
                        <option value="quarter">Último trimestre</option>
                        <option value="year">Último año</option>
                    </select>
                    <button className="bg-primary text-white px-6 py-2 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Exportar PDF
                    </button>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="flex gap-4">
                {[
                    { id: 'ventas' as ReportType, label: 'Ventas', icon: 'trending_up' },
                    { id: 'productos' as ReportType, label: 'Productos', icon: 'inventory_2' },
                    { id: 'empleados' as ReportType, label: 'Empleados', icon: 'badge' },
                ].map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setReportType(type.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${reportType === type.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">{type.icon}</span>
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {reportType === 'ventas' && <SalesReport />}
            {reportType === 'productos' && <ProductsReport />}
            {reportType === 'empleados' && <EmployeesReport />}
        </div>
    )
}

function SalesReport() {
    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon="payments" label="Ingresos Totales" value="$328,000" trend="+12.5%" positive />
                <StatCard icon="receipt_long" label="Total Ventas" value="487" trend="+8.2%" positive />
                <StatCard icon="avg_pace" label="Ticket Promedio" value="$673" trend="-2.1%" positive={false} />
                <StatCard icon="group" label="Clientes Únicos" value="156" trend="+15.3%" positive />
            </div>

            {/* Chart - Ventas vs Meta */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="text-lg font-bold text-text-primary-light dark:text-white mb-4">
                    Ventas vs Meta Mensual
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesByMonth}>
                            <defs>
                                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                            <Area type="monotone" dataKey="ventas" stroke="#6366f1" fill="url(#colorVentas)" strokeWidth={2} name="Ventas" />
                            <Area type="monotone" dataKey="meta" stroke="#22c55e" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-bold text-text-primary-light dark:text-white mb-4">
                        Ventas por Categoría
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={salesByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {salesByCategory.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number) => [`${v}%`, '']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-bold text-text-primary-light dark:text-white mb-4">
                        Resumen Rápido
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Mejor día</span>
                            <span className="font-bold text-text-primary-light dark:text-white">Sábado</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Hora pico</span>
                            <span className="font-bold text-text-primary-light dark:text-white">12:00 - 14:00</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Método pago popular</span>
                            <span className="font-bold text-text-primary-light dark:text-white">Efectivo (62%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProductsReport() {
    return (
        <div className="space-y-6">
            {/* Top Products */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="text-lg font-bold text-text-primary-light dark:text-white mb-4">
                    Productos Más Vendidos
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProducts} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                            <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={120} />
                            <Tooltip formatter={(v: number) => [v, 'Unidades']} />
                            <Bar dataKey="ventas" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase">#</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase">Producto</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase">Unidades</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase">Ingresos</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {topProducts.map((p, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4 text-sm font-bold text-primary">{i + 1}</td>
                                <td className="px-6 py-4 text-sm font-medium text-text-primary-light dark:text-white">{p.name}</td>
                                <td className="px-6 py-4 text-sm text-right text-text-secondary-light dark:text-text-secondary-dark">{p.ventas}</td>
                                <td className="px-6 py-4 text-sm text-right font-semibold text-text-primary-light dark:text-white">${p.ingresos.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function EmployeesReport() {
    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {salesByEmployee.map((emp, i) => (
                    <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                                {emp.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-text-primary-light dark:text-white">{emp.name}</p>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Vendedor</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Ventas</p>
                                <p className="text-xl font-bold text-text-primary-light dark:text-white">{emp.ventas}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Ingresos</p>
                                <p className="text-xl font-bold text-primary">${(emp.monto / 1000).toFixed(0)}k</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bar Chart */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="text-lg font-bold text-text-primary-light dark:text-white mb-4">
                    Comparativa de Ventas por Empleado
                </h3>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesByEmployee}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="ventas" fill="#6366f1" radius={[4, 4, 0, 0]} name="Ventas" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, trend, positive }: { icon: string; label: string; value: string; trend: string; positive: boolean }) {
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-text-primary-light dark:text-white">{value}</p>
                        <span className={`text-xs font-medium ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {trend}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
