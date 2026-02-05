import { useState, useMemo } from 'react'
import { useCartStore, CartItem } from '@/stores/cartStore'

// Mock de productos (después vendrán del backend)
const mockProducts = [
    { productId: 'p1', code: 'PROD-001', name: 'Laptop HP 15"', price: 12500, category: 'Electrónica', stock: 15 },
    { productId: 'p2', code: 'PROD-002', name: 'Mouse Inalámbrico', price: 350, category: 'Electrónica', stock: 42 },
    { productId: 'p3', code: 'PROD-003', name: 'Teclado Mecánico', price: 850, category: 'Electrónica', stock: 28 },
    { productId: 'p4', code: 'PROD-004', name: 'Monitor 24"', price: 4500, category: 'Electrónica', stock: 12 },
    { productId: 'p5', code: 'PROD-005', name: 'Café Molido 500g', price: 120, category: 'Alimentos', stock: 35 },
    { productId: 'p6', code: 'PROD-006', name: 'Audífonos Bluetooth', price: 780, category: 'Electrónica', stock: 20 },
    { productId: 'p7', code: 'PROD-007', name: 'Webcam HD', price: 950, category: 'Electrónica', stock: 18 },
    { productId: 'p8', code: 'PROD-008', name: 'Hub USB-C', price: 450, category: 'Electrónica', stock: 25 },
]

// Mock de clientes
const mockCustomers = [
    { id: 'general', name: 'Público en General', email: null },
    { id: 'c1', name: 'María García López', email: 'maria@email.com' },
    { id: 'c2', name: 'Juan Pérez Rodríguez', email: 'juan.perez@empresa.com' },
    { id: 'c3', name: 'Ana Martínez Sánchez', email: null },
    { id: 'c4', name: 'Empresa ABC S.A. de C.V.', email: 'compras@empresaabc.com' },
]

const categories = ['Todos', 'Electrónica', 'Alimentos', 'General']

export default function POS() {
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('Todos')
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState(mockCustomers[0]) // Público en General por defecto
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

    const {
        items,
        subtotal,
        taxAmount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
    } = useCartStore()

    // Filtrar productos
    const filteredProducts = useMemo(() => {
        return mockProducts.filter(p => {
            const matchesSearch =
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.code.toLowerCase().includes(search.toLowerCase())
            const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [search, selectedCategory])

    // Procesar pago
    const handlePayment = (method: string, amountPaid: number) => {
        // Aquí se enviaría al backend
        console.log('Procesando pago:', { method, amountPaid, total, items, customer: selectedCustomer })

        // Limpiar carrito
        clearCart()
        setSelectedCustomer(mockCustomers[0]) // Reset a Público en General
        setShowPaymentModal(false)
    }

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">
            {/* Panel Izquierdo - Productos */}
            <div className="flex-1 flex flex-col">
                {/* Búsqueda y Categorías */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary-light">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar producto o código..."
                            className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border-0 bg-surface-light dark:bg-surface-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary shadow-sm"
                        />
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${selectedCategory === cat
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de Productos */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.productId}
                                product={product}
                                onAdd={() => addItem({
                                    productId: product.productId,
                                    code: product.code,
                                    name: product.name,
                                    price: product.price,
                                })}
                            />
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="material-symbols-outlined text-[48px] text-gray-300 dark:text-gray-600 mb-4">
                                inventory_2
                            </span>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                No se encontraron productos
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Panel Derecho - Carrito */}
            <div className="w-[380px] flex flex-col bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating border border-gray-100 dark:border-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">shopping_cart</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-text-primary-light dark:text-white">
                                Orden Actual
                            </h3>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                {items.length} producto{items.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                            Vaciar
                        </button>
                    )}
                </div>

                {/* Selector de Cliente */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                        Cliente
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-left hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                    {selectedCustomer.id === 'general' ? '👤' : selectedCustomer.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary-light dark:text-white">
                                        {selectedCustomer.name}
                                    </p>
                                    {selectedCustomer.email && (
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                            {selectedCustomer.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-[18px] text-text-secondary-light">
                                expand_more
                            </span>
                        </button>

                        {showCustomerDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10 max-h-48 overflow-y-auto">
                                {mockCustomers.map((customer) => (
                                    <button
                                        key={customer.id}
                                        onClick={() => {
                                            setSelectedCustomer(customer)
                                            setShowCustomerDropdown(false)
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedCustomer.id === customer.id ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                            {customer.id === 'general' ? '👤' : customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary-light dark:text-white">
                                                {customer.name}
                                            </p>
                                            {customer.email && (
                                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                    {customer.email}
                                                </p>
                                            )}
                                        </div>
                                        {selectedCustomer.id === customer.id && (
                                            <span className="material-symbols-outlined text-primary text-[18px] ml-auto">check</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Items del Carrito */}
                <div className="flex-1 overflow-y-auto p-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <span className="material-symbols-outlined text-[64px] text-gray-200 dark:text-gray-700 mb-4">
                                shopping_cart
                            </span>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                El carrito está vacío
                            </p>
                            <p className="text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/70 mt-1">
                                Agrega productos para comenzar
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {items.map((item) => (
                                <CartItemRow
                                    key={item.productId}
                                    item={item}
                                    onUpdateQuantity={(qty) => updateQuantity(item.productId, qty)}
                                    onRemove={() => removeItem(item.productId)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Totales y Cobrar */}
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 rounded-b-2xl">
                    {/* Totales */}
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">Subtotal</span>
                            <span className="text-text-primary-light dark:text-white">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">IVA (16%)</span>
                            <span className="text-text-primary-light dark:text-white">${taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-text-primary-light dark:text-white">Total</span>
                            <span className="text-primary">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Botón Cobrar */}
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        disabled={items.length === 0}
                        className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">payments</span>
                        Cobrar ${total.toFixed(2)}
                    </button>
                </div>
            </div>

            {/* Modal de Pago */}
            {showPaymentModal && (
                <PaymentModal
                    total={total}
                    onClose={() => setShowPaymentModal(false)}
                    onPayment={handlePayment}
                />
            )}
        </div>
    )
}

// Componente de tarjeta de producto
function ProductCard({
    product,
    onAdd
}: {
    product: typeof mockProducts[0]
    onAdd: () => void
}) {
    return (
        <button
            onClick={onAdd}
            className="group flex flex-col p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all text-left"
        >
            {/* Product Icon */}
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">inventory_2</span>
            </div>

            {/* Info */}
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-1">
                {product.code}
            </p>
            <h4 className="text-sm font-medium text-text-primary-light dark:text-white line-clamp-2 mb-2">
                {product.name}
            </h4>

            {/* Price and Stock */}
            <div className="mt-auto flex items-end justify-between">
                <span className="text-lg font-bold text-primary">
                    ${product.price.toLocaleString()}
                </span>
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Stock: {product.stock}
                </span>
            </div>
        </button>
    )
}

// Componente de item del carrito
function CartItemRow({
    item,
    onUpdateQuantity,
    onRemove,
}: {
    item: CartItem
    onUpdateQuantity: (qty: number) => void
    onRemove: () => void
}) {
    return (
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-xl">
            {/* Icon */}
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text-primary-light dark:text-white truncate">
                    {item.name}
                </h4>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    ${item.price.toLocaleString()} c/u
                </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onUpdateQuantity(item.quantity - 1)}
                    className="size-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <span className="w-8 text-center text-sm font-medium text-text-primary-light dark:text-white">
                    {item.quantity}
                </span>
                <button
                    onClick={() => onUpdateQuantity(item.quantity + 1)}
                    className="size-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
            </div>

            {/* Subtotal */}
            <div className="text-right min-w-[70px]">
                <p className="text-sm font-semibold text-text-primary-light dark:text-white">
                    ${(item.price * item.quantity).toLocaleString()}
                </p>
            </div>

            {/* Remove */}
            <button
                onClick={onRemove}
                className="text-red-400 hover:text-red-500"
            >
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    )
}

// Modal de Pago
function PaymentModal({
    total,
    onClose,
    onPayment,
}: {
    total: number
    onClose: () => void
    onPayment: (method: string, amount: number) => void
}) {
    const [method, setMethod] = useState<'cash' | 'card' | 'transfer'>('cash')
    const [amountPaid, setAmountPaid] = useState(total)

    const change = method === 'cash' ? Math.max(0, amountPaid - total) : 0

    const handleSubmit = () => {
        if (method === 'cash' && amountPaid < total) {
            return
        }
        onPayment(method, amountPaid)
    }

    const quickAmounts = [50, 100, 200, 500, 1000]

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-text-primary-light dark:text-white">
                        Cobrar
                    </h2>
                    <button onClick={onClose} className="text-text-secondary-light hover:text-text-primary-light">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-5">
                    {/* Total */}
                    <div className="text-center mb-6">
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
                            Total a pagar
                        </p>
                        <p className="text-4xl font-bold text-primary">
                            ${total.toFixed(2)}
                        </p>
                    </div>

                    {/* Payment Methods */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                            { id: 'cash', icon: 'payments', label: 'Efectivo' },
                            { id: 'card', icon: 'credit_card', label: 'Tarjeta' },
                            { id: 'transfer', icon: 'swap_horiz', label: 'Transferencia' },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMethod(m.id as typeof method)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${method === m.id
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 dark:border-gray-700 text-text-secondary-light dark:text-text-secondary-dark hover:border-gray-300'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[24px]">{m.icon}</span>
                                <span className="text-xs font-medium">{m.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Cash Amount */}
                    {method === 'cash' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                                Monto recibido
                            </label>
                            <input
                                type="number"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(Number(e.target.value))}
                                className="w-full p-3 text-xl font-bold text-center rounded-xl border-0 bg-gray-100 dark:bg-gray-800 text-text-primary-light dark:text-white focus:ring-2 focus:ring-primary"
                            />

                            {/* Quick amounts */}
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {quickAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setAmountPaid(amt)}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        ${amt}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setAmountPaid(total)}
                                    className="px-3 py-1.5 text-sm rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20"
                                >
                                    Exacto
                                </button>
                            </div>

                            {/* Change */}
                            {change > 0 && (
                                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Cambio</p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        ${change.toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={method === 'cash' && amountPaid < total}
                        className="w-full bg-primary text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">check_circle</span>
                        Confirmar Pago
                    </button>
                </div>
            </div>
        </div>
    )
}
