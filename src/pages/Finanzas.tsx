import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Expense {
    id: string
    date: string
    amount: number
    category: string
    description: string
}

// Mock data
const mockExpenses: Expense[] = [
    { id: 'e1', date: '2026-01-29', amount: 1500, category: 'Servicios', description: 'Electricidad enero' },
    { id: 'e2', date: '2026-01-28', amount: 850, category: 'Operación', description: 'Combustible vehículo' },
    { id: 'e3', date: '2026-01-27', amount: 3200, category: 'Inventario', description: 'Compra mercancía' },
    { id: 'e4', date: '2026-01-25', amount: 450, category: 'Servicios', description: 'Internet oficina' },
    { id: 'e5', date: '2026-01-24', amount: 2100, category: 'Nómina', description: 'Bono empleados' },
    { id: 'e6', date: '2026-01-20', amount: 1800, category: 'Mantenimiento', description: 'Reparación equipo' },
]

const mockMonthlyData = [
    { name: 'Sep', ingresos: 45000, gastos: 28000 },
    { name: 'Oct', ingresos: 52000, gastos: 32000 },
    { name: 'Nov', ingresos: 48000, gastos: 29000 },
    { name: 'Dic', ingresos: 68000, gastos: 42000 },
    { name: 'Ene', ingresos: 55000, gastos: 35000 },
]

const expenseCategories = [
    { name: 'Servicios', value: 4500, color: '#3b82f6' },
    { name: 'Operación', value: 3200, color: '#22c55e' },
    { name: 'Inventario', value: 8500, color: '#f59e0b' },
    { name: 'Nómina', value: 12000, color: '#ef4444' },
    { name: 'Mantenimiento', value: 2800, color: '#8b5cf6' },
]

const categoryOptions = ['Servicios', 'Operación', 'Inventario', 'Nómina', 'Mantenimiento', 'Marketing', 'Otros']

export default function Finanzas() {
    const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
    const [showModal, setShowModal] = useState(false)
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
    const [dateFilter, setDateFilter] = useState<'week' | 'month' | 'year'>('month')

    const isAdmin = useAuthStore((state) => state.isAdmin)
    const canEdit = isAdmin()

    // Estadísticas
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalIncome = 55000 // Mock - vendría del backend
    const profit = totalIncome - totalExpenses
    const profitMargin = ((profit / totalIncome) * 100).toFixed(1)

    const handleNew = () => {
        setEditingExpense(null)
        setShowModal(true)
    }

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense)
        setShowModal(true)
    }

    const handleSave = (data: Partial<Expense>) => {
        if (editingExpense) {
            setExpenses(prev => prev.map(e =>
                e.id === editingExpense.id ? { ...e, ...data } : e
            ))
        } else {
            const newExpense: Expense = {
                id: `e${Date.now()}`,
                date: data.date || new Date().toISOString().split('T')[0],
                amount: data.amount || 0,
                category: data.category || 'Otros',
                description: data.description || '',
            }
            setExpenses(prev => [newExpense, ...prev])
        }
        setShowModal(false)
    }

    const handleDelete = (expenseId: string) => {
        if (confirm('¿Eliminar este gasto?')) {
            setExpenses(prev => prev.filter(e => e.id !== expenseId))
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-white">
                        Finanzas
                    </h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Controla tus ingresos y gastos
                    </p>
                </div>

                <div className="flex gap-3">
                    {/* Period Filter */}
                    <div className="flex bg-surface-light dark:bg-surface-dark rounded-xl p-1 ring-1 ring-gray-200 dark:ring-gray-700">
                        {(['week', 'month', 'year'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setDateFilter(period)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${dateFilter === period
                                        ? 'bg-primary text-white shadow'
                                        : 'text-text-secondary-light hover:text-text-primary-light'
                                    }`}
                            >
                                {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
                            </button>
                        ))}
                    </div>

                    {canEdit && (
                        <button
                            onClick={handleNew}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Nuevo Gasto
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon="trending_up"
                    label="Ingresos"
                    value={`$${totalIncome.toLocaleString()}`}
                    color="emerald"
                    trend="+12%"
                />
                <StatCard
                    icon="trending_down"
                    label="Gastos"
                    value={`$${totalExpenses.toLocaleString()}`}
                    color="red"
                    trend="-5%"
                />
                <StatCard
                    icon="account_balance"
                    label="Utilidad"
                    value={`$${profit.toLocaleString()}`}
                    color={profit >= 0 ? 'indigo' : 'red'}
                />
                <StatCard
                    icon="percent"
                    label="Margen"
                    value={`${profitMargin}%`}
                    color="amber"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Income vs Expenses Chart */}
                <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-text-primary-light dark:text-white mb-4">
                        Ingresos vs Gastos
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={mockMonthlyData}>
                            <defs>
                                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                            />
                            <Area type="monotone" dataKey="ingresos" stroke="#22c55e" fill="url(#incomeGradient)" strokeWidth={2} />
                            <Area type="monotone" dataKey="gastos" stroke="#ef4444" fill="url(#expenseGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Expenses by Category */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-text-primary-light dark:text-white mb-4">
                        Gastos por Categoría
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={expenseCategories}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {expenseCategories.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {expenseCategories.map((cat) => (
                            <div key={cat.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="size-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                    <span className="text-text-secondary-light dark:text-text-secondary-dark">{cat.name}</span>
                                </div>
                                <span className="font-medium text-text-primary-light dark:text-white">
                                    ${cat.value.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Expenses Table */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-text-primary-light dark:text-white">
                        Gastos Recientes
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary-light uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary-light uppercase tracking-wider">
                                    Descripción
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary-light uppercase tracking-wider">
                                    Categoría
                                </th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-text-secondary-light uppercase tracking-wider">
                                    Monto
                                </th>
                                {canEdit && (
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-text-secondary-light uppercase tracking-wider">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        {new Date(expense.date).toLocaleDateString('es-MX')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-text-primary-light dark:text-white">
                                            {expense.description}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <CategoryBadge category={expense.category} />
                                    </td>
                                    <td className="px-6 py-4 text-right font-semibold text-red-500">
                                        -${expense.amount.toLocaleString()}
                                    </td>
                                    {canEdit && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(expense)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-text-secondary-light hover:text-primary"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-text-secondary-light hover:text-red-500"
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
            </div>

            {/* Expense Modal */}
            {showModal && (
                <ExpenseModal
                    expense={editingExpense}
                    categories={categoryOptions}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    )
}

// Stat Card
function StatCard({
    icon,
    label,
    value,
    color,
    trend
}: {
    icon: string
    label: string
    value: string
    color: string
    trend?: string
}) {
    const colors: Record<string, string> = {
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    }

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
                <div className={`size-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.startsWith('+')
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="mt-3 text-2xl font-bold text-text-primary-light dark:text-white">{value}</p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{label}</p>
        </div>
    )
}

// Category Badge
function CategoryBadge({ category }: { category: string }) {
    const colors: Record<string, string> = {
        Servicios: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        Operación: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        Inventario: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        Nómina: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        Mantenimiento: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        Marketing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        Otros: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    }

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colors[category] || colors.Otros}`}>
            {category}
        </span>
    )
}

// Expense Modal
function ExpenseModal({
    expense,
    categories,
    onClose,
    onSave,
}: {
    expense: Expense | null
    categories: string[]
    onClose: () => void
    onSave: (data: Partial<Expense>) => void
}) {
    const [form, setForm] = useState({
        date: expense?.date || new Date().toISOString().split('T')[0],
        amount: expense?.amount || 0,
        category: expense?.category || 'Otros',
        description: expense?.description || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(form)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-text-primary-light dark:text-white">
                        {expense ? 'Editar Gasto' : 'Nuevo Gasto'}
                    </h2>
                    <button onClick={onClose} className="text-text-secondary-light hover:text-text-primary-light">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                                className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                                Monto *
                            </label>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                                min="0"
                                step="0.01"
                                required
                                className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            Categoría
                        </label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                            className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            Descripción *
                        </label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Ej: Pago de luz mes de enero"
                            required
                            className="w-full px-4 py-3 text-sm rounded-xl border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        {expense ? 'Guardar Cambios' : 'Registrar Gasto'}
                    </button>
                </form>
            </div>
        </div>
    )
}
