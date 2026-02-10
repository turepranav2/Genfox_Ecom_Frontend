import api from './api-config'

export interface OrderItem {
  productId: string
  quantity: number
  price?: number
  product?: {
    name: string
    images: string[]
  }
}

export interface Order {
  id?: string
  _id?: string
  userId?: string
  items: OrderItem[]
  total: number
  address: string
  status: string
  createdAt: string
  updatedAt: string
  // Delivery confirmation fields
  supplierConfirmed?: boolean
  userConfirmed?: boolean
  cashCollected?: number
  deliveredAt?: string
  userConfirmedAt?: string
}

export interface CreateOrderData {
  items: { productId: string; quantity: number }[]
  address: string
}

export const orderAPI = {
  // User place order (COD)
  create: async (data: CreateOrderData) => {
    const response = await api.post('/api/orders', data)
    return response.data
  },

  // User get their orders
  getMyOrders: async () => {
    const response = await api.get('/api/orders/my')
    return response.data
  },

  // Get single order details
  getById: async (id: string) => {
    const response = await api.get(`/api/orders/${id}`)
    return response.data
  },

  // User confirms they received the order (cross-check with supplier)
  confirmReceipt: async (orderId: string) => {
    const response = await api.put(`/api/orders/${orderId}/confirm-receipt`)
    return response.data
  },
}

// Supplier Order API
export const supplierOrderAPI = {
  // Get supplier orders
  getOrders: async () => {
    const response = await api.get('/api/orders/supplier')
    return response.data
  },

  // Update order status (if supplier has permission)
  updateStatus: async (orderId: string, status: string) => {
    const response = await api.put(`/api/orders/supplier/${orderId}/status`, { status })
    return response.data
  },

  // Supplier confirms delivery + cash collection (COD)
  confirmDelivery: async (orderId: string, data: { cashCollected: number; supplierConfirmed: boolean }) => {
    const response = await api.put(`/api/orders/supplier/${orderId}/deliver`, data)
    return response.data
  },
}

// Admin Order API
export const adminOrderAPI = {
  // Get all orders
  getAllOrders: async () => {
    const response = await api.get('/api/orders/admin')
    return response.data
  },

  // Update order status
  updateStatus: async (orderId: string, status: string) => {
    const response = await api.put(`/api/orders/admin/${orderId}/status`, { status })
    return response.data
  },
}