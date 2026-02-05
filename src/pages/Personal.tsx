import { useState } from 'react'

// Mock data
const mockPositions = [
    { id: 'p1', name: 'Gerente', baseSalary: 15000, employees: 2 },
    { id: 'p2', name: 'Cajero', baseSalary: 8000, employees: 3 },
    { id: 'p3', name: 'Almacenista', baseSalary: 7500, employees: 2 },
]

const mockEmployees = [
    { id: 'e1', code: 'EMP-001', name: 'Carlos Ramírez', position: 'Gerente', salary: 15000, hireDate: '2024-01-15', phone: '555-0101', active: true },
    { id: 'e2', code: 'EMP-002', name: 'Ana López', position: 'Cajero', salary: 8500, hireDate: '2024-03-20', phone: '555-0102', active: true },
    { id: 'e3', code: 'EMP-003', name: 'Pedro Sánchez', position: 'Cajero', salary: 8000, hireDate: '2024-06-10', phone: '555-0103', active: true },
]

type Tab = 'employees' | 'positions' | 'payroll' | 'schedules'

export default function Personal() {
    const [activeTab, setActiveTab] = useState<Tab>('employees')

    const tabs = [
        { id: 'employees' as Tab, label: 'Empleados', icon: 'badge' },
        { id: 'positions' as Tab, label: 'Puestos', icon: 'work' },
        { id: 'payroll' as Tab, label: 'Nómina', icon: 'payments' },
        { id: 'schedules' as Tab, label: 'Horarios', icon: 'schedule' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary-light dark:text-white">
                        Personal
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
                        Gestión de empleados, nómina y horarios
                    </p>
                </div>
                <button className="bg-primary text-white px-6 py-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Nuevo Empleado
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'employees' && <EmployeesTab />}
                {activeTab === 'positions' && <PositionsTab />}
                {activeTab === 'payroll' && <PayrollTab />}
                {activeTab === 'schedules' && <SchedulesTab />}
            </div>
        </div>
    )
}

// Tab: Empleados
function EmployeesTab() {
    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon="badge" label="Total Empleados" value="7" color="blue" />
                <StatCard icon="check_circle" label="Activos" value="7" color="green" />
                <StatCard icon="cancel" label="Inactivos" value="0" color="red" />
                <StatCard icon="payments" label="Nómina Mensual" value="$65,000" color="purple" />
            </div>

            {/* Table */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Código</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Puesto</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Salario</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Fecha Ingreso</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {mockEmployees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-text-primary-light dark:text-white">{emp.code}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary-light dark:text-white">{emp.name}</p>
                                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{emp.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">{emp.position}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-text-primary-light dark:text-white">${emp.salary.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">{emp.hireDate}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                        Activo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-text-secondary-light hover:text-primary">
                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Tab: Puestos
function PositionsTab() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockPositions.map((pos) => (
                <div key={pos.id} className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">work</span>
                        </div>
                        <button className="text-text-secondary-light hover:text-primary">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary-light dark:text-white mb-2">{pos.name}</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Salario Base</span>
                            <span className="font-semibold text-text-primary-light dark:text-white">${pos.baseSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Empleados</span>
                            <span className="font-semibold text-text-primary-light dark:text-white">{pos.employees}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// Tab: Nómina
function PayrollTab() {
    return (
        <div className="text-center py-12">
            <span className="material-symbols-outlined text-[64px] text-gray-300 dark:text-gray-600 mb-4">payments</span>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">Módulo de nómina en construcción</p>
        </div>
    )
}

// Tab: Horarios
function SchedulesTab() {
    return (
        <div className="text-center py-12">
            <span className="material-symbols-outlined text-[64px] text-gray-300 dark:text-gray-600 mb-4">schedule</span>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">Módulo de horarios en construcción</p>
        </div>
    )
}

// Componente de estadística
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
    const colors = {
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        red: 'bg-red-500/10 text-red-600 dark:text-red-400',
        purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    }

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center gap-4">
                <div className={`size-12 rounded-xl flex items-center justify-center ${colors[color as keyof typeof colors]}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{label}</p>
                    <p className="text-2xl font-bold text-text-primary-light dark:text-white">{value}</p>
                </div>
            </div>
        </div>
    )
}
