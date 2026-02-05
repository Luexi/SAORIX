import { create } from 'zustand'

// Tipos
export interface CartItem {
    productId: string
    code: string
    name: string
    price: number
    quantity: number
    discount: number // Porcentaje de descuento
}

interface CartState {
    items: CartItem[]
    customerId: string | null
    customerName: string | null
    notes: string

    // Calculados
    subtotal: number
    taxAmount: number
    discountAmount: number
    total: number

    // Actions
    addItem: (product: Omit<CartItem, 'quantity' | 'discount'>) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    applyItemDiscount: (productId: string, discount: number) => void
    setCustomer: (id: string | null, name: string | null) => void
    setNotes: (notes: string) => void
    clearCart: () => void
    getItemCount: () => number
}

// Tasa de IVA México
const TAX_RATE = 0.16

// Calcular totales
function calculateTotals(items: CartItem[]) {
    const subtotalBruto = items.reduce((sum, item) => {
        const itemSubtotal = item.price * item.quantity
        const itemDiscount = itemSubtotal * (item.discount / 100)
        return sum + (itemSubtotal - itemDiscount)
    }, 0)

    // El subtotal ya incluye descuentos por item
    const subtotal = subtotalBruto
    const taxAmount = subtotal * TAX_RATE
    const discountAmount = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity * (item.discount / 100))
    }, 0)
    const total = subtotal + taxAmount

    return { subtotal, taxAmount, discountAmount, total }
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    customerId: null,
    customerName: null,
    notes: '',
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,

    addItem: (product) => {
        set((state) => {
            const existingIndex = state.items.findIndex(i => i.productId === product.productId)

            let newItems: CartItem[]
            if (existingIndex >= 0) {
                // Incrementar cantidad
                newItems = state.items.map((item, idx) =>
                    idx === existingIndex
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            } else {
                // Agregar nuevo
                newItems = [...state.items, { ...product, quantity: 1, discount: 0 }]
            }

            return { items: newItems, ...calculateTotals(newItems) }
        })
    },

    removeItem: (productId) => {
        set((state) => {
            const newItems = state.items.filter(i => i.productId !== productId)
            return { items: newItems, ...calculateTotals(newItems) }
        })
    },

    updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(productId)
            return
        }

        set((state) => {
            const newItems = state.items.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            )
            return { items: newItems, ...calculateTotals(newItems) }
        })
    },

    applyItemDiscount: (productId, discount) => {
        set((state) => {
            const newItems = state.items.map(item =>
                item.productId === productId
                    ? { ...item, discount: Math.min(100, Math.max(0, discount)) }
                    : item
            )
            return { items: newItems, ...calculateTotals(newItems) }
        })
    },

    setCustomer: (id, name) => {
        set({ customerId: id, customerName: name })
    },

    setNotes: (notes) => {
        set({ notes })
    },

    clearCart: () => {
        set({
            items: [],
            customerId: null,
            customerName: null,
            notes: '',
            subtotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            total: 0,
        })
    },

    getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
    },
}))
