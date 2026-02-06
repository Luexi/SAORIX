import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useAuthFetch } from '@/stores/authStore'

type LeadStatus = 'NEW' | 'CONTACTED' | 'NEGOTIATION' | 'WON' | 'LOST'

interface Lead {
    id: string
    name: string
    company: string | null
    email: string | null
    phone: string | null
    source: string | null
    status: LeadStatus
    estimatedValue: number | null
    notes: string | null
    nextFollowUpAt: string | null
    createdAt: string
    updatedAt: string
}

const statusOrder: LeadStatus[] = ['NEW', 'CONTACTED', 'NEGOTIATION', 'WON', 'LOST']

const statusLabels: Record<LeadStatus, string> = {
    NEW: 'Nuevo',
    CONTACTED: 'Contactado',
    NEGOTIATION: 'Negociación',
    WON: 'Ganado',
    LOST: 'Perdido',
}

const statusClasses: Record<LeadStatus, string> = {
    NEW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    CONTACTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    NEGOTIATION: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    WON: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    LOST: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export default function PipelineCRM() {
    const authFetch = useAuthFetch()
    const [leads, setLeads] = useState<Lead[]>([])
    const [reminders, setReminders] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        source: '',
        estimatedValue: '',
        notes: '',
        nextFollowUpAt: '',
    })

    useEffect(() => {
        void fetchPipeline()
        void fetchReminders()
    }, [])

    async function fetchPipeline() {
        setLoading(true)
        setError('')
        try {
            const response = await authFetch('/leads')
            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'No se pudo cargar pipeline')
            }
            const data = await response.json()
            setLeads(data)
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Error de conexión'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    async function fetchReminders() {
        try {
            const response = await authFetch('/leads/reminders?days=7')
            if (!response.ok) return
            const data = await response.json()
            setReminders(data)
        } catch (requestError) {
            console.error(requestError)
        }
    }

    const groupedLeads = useMemo(() => {
        return statusOrder.reduce<Record<LeadStatus, Lead[]>>((grouped, status) => {
            grouped[status] = leads.filter((lead) => lead.status === status)
            return grouped
        }, {
            NEW: [],
            CONTACTED: [],
            NEGOTIATION: [],
            WON: [],
            LOST: [],
        })
    }, [leads])

    async function createLead(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!form.name.trim()) {
            setError('El nombre del lead es requerido')
            return
        }

        setSaving(true)
        setError('')
        try {
            const response = await authFetch('/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    company: form.company || null,
                    email: form.email || null,
                    phone: form.phone || null,
                    source: form.source || null,
                    estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
                    notes: form.notes || null,
                    nextFollowUpAt: form.nextFollowUpAt || null,
                }),
            })
            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'No se pudo crear lead')
            }
            setForm({
                name: '',
                company: '',
                email: '',
                phone: '',
                source: '',
                estimatedValue: '',
                notes: '',
                nextFollowUpAt: '',
            })
            setShowForm(false)
            await fetchPipeline()
            await fetchReminders()
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Error al crear lead'
            setError(message)
        } finally {
            setSaving(false)
        }
    }

    async function moveLead(lead: Lead, status: LeadStatus) {
        if (lead.status === status) return
        setError('')
        try {
            const response = await authFetch(`/leads/${lead.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || 'No se pudo actualizar lead')
            }
            await fetchPipeline()
            await fetchReminders()
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Error al mover lead'
            setError(message)
        }
    }

    function formatMoney(value: number | null) {
        if (!value) return '-'
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            maximumFractionDigits: 0,
        }).format(value)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-white">CRM Pipeline</h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Seguimiento comercial con recordatorios de próxima acción
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                >
                    Nuevo lead
                </button>
            </div>

            {error && (
                <div className="rounded-xl p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <h2 className="font-semibold text-text-primary-light dark:text-white mb-3">Recordatorios (7 días)</h2>
                {reminders.length === 0 ? (
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        No hay seguimientos próximos.
                    </p>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {reminders.map((lead) => (
                            <div key={lead.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-medium text-text-primary-light dark:text-white">{lead.name}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusClasses[lead.status]}`}>
                                        {statusLabels[lead.status]}
                                    </span>
                                </div>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                                    {lead.company || 'Sin empresa'} • {lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleDateString('es-MX') : '-'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
                    Cargando pipeline...
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
                    {statusOrder.map((status) => (
                        <div key={status} className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-text-primary-light dark:text-white">{statusLabels[status]}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${statusClasses[status]}`}>
                                    {groupedLeads[status].length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {groupedLeads[status].map((lead) => (
                                    <div key={lead.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                                        <p className="font-medium text-text-primary-light dark:text-white">{lead.name}</p>
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                                            {lead.company || 'Sin empresa'}
                                        </p>
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                            Valor: {formatMoney(lead.estimatedValue)}
                                        </p>
                                        {lead.nextFollowUpAt && (
                                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                Seguimiento: {new Date(lead.nextFollowUpAt).toLocaleDateString('es-MX')}
                                            </p>
                                        )}
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {statusOrder.map((targetStatus) => (
                                                <button
                                                    key={targetStatus}
                                                    onClick={() => void moveLead(lead, targetStatus)}
                                                    disabled={targetStatus === lead.status}
                                                    className={`px-2 py-1 rounded-lg text-xs border ${targetStatus === lead.status
                                                        ? 'opacity-50 border-gray-200 dark:border-gray-700'
                                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                                                        }`}
                                                >
                                                    {statusLabels[targetStatus]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {groupedLeads[status].length === 0 && (
                                    <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                        Sin leads
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-xl bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-text-primary-light dark:text-white">Nuevo lead</h2>
                            <button onClick={() => setShowForm(false)} className="text-text-secondary-light dark:text-text-secondary-dark">
                                Cerrar
                            </button>
                        </div>
                        <form onSubmit={createLead} className="p-5 space-y-4">
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
                                    <label className="block text-sm mb-1">Empresa</label>
                                    <input
                                        value={form.company}
                                        onChange={(event) => setForm({ ...form, company: event.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Origen</label>
                                    <input
                                        value={form.source}
                                        onChange={(event) => setForm({ ...form, source: event.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                        placeholder="Referido, Web, WhatsApp..."
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
                                    <label className="block text-sm mb-1">Valor estimado</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.estimatedValue}
                                        onChange={(event) => setForm({ ...form, estimatedValue: event.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Próximo seguimiento</label>
                                    <input
                                        type="date"
                                        value={form.nextFollowUpAt}
                                        onChange={(event) => setForm({ ...form, nextFollowUpAt: event.target.value })}
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
                                    className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium disabled:opacity-60"
                                >
                                    {saving ? 'Guardando...' : 'Crear lead'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
