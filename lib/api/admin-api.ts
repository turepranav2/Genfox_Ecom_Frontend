import api from './api-config'

export interface Supplier {
  id: string
  name: string
  email: string
  phone?: string
  gstin?: string
  address?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  commissionRate?: number
  productCount?: number
  bankDetails?: {
    accountHolderName?: string
    accountNumber?: string
    ifscCode?: string
    bankName?: string
  }
  createdAt: string
  updatedAt: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  addresses?: {
    label?: string
    street?: string
    city?: string
    state?: string
    pincode?: string
    isDefault?: boolean
  }[]
  orderCount?: number
  createdAt: string
  updatedAt?: string
}

export const adminAPI = {
  // Get all suppliers (with full details)
  getAllSuppliers: async () => {
    const response = await api.get('/api/admin/suppliers')
    return response.data
  },

  // Approve supplier
  approveSupplier: async (supplierId: string) => {
    const response = await api.put(`/api/admin/suppliers/${supplierId}/approve`)
    return response.data
  },

  // Reject supplier
  rejectSupplier: async (supplierId: string) => {
    const response = await api.put(`/api/admin/suppliers/${supplierId}/reject`)
    return response.data
  },

  // Get all users (with full details: phone, addresses, orderCount)
  getAllUsers: async () => {
    const response = await api.get('/api/admin/users')
    return response.data
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/api/admin/users/${userId}`)
    return response.data
  },

  // Get all products (admin - includes all approval statuses)
  getAllProducts: async () => {
    const response = await api.get('/api/admin/products')
    return response.data
  },

  // Approve product
  approveProduct: async (productId: string) => {
    const response = await api.put(`/api/admin/products/${productId}/approve`)
    return response.data
  },

  // Reject product
  rejectProduct: async (productId: string) => {
    const response = await api.put(`/api/admin/products/${productId}/reject`)
    return response.data
  },
}