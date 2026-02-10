import api from './api-config'

export interface SupplierDashboard {
  productsCount: number
  ordersCount: number
  revenue: number
  commissionPaid: number
  recentOrders: any[]
}

export interface AdminDashboard {
  totalUsers: number
  totalSuppliers: number
  totalOrders: number
  totalRevenue: number
  pendingSuppliers: number
  recentOrders: any[]
}

export const dashboardAPI = {
  // Supplier Dashboard
  getSupplierDashboard: async () => {
    const response = await api.get('/api/dashboard/supplier')
    return response.data as SupplierDashboard
  },

  // Admin Dashboard
  getAdminDashboard: async () => {
    const response = await api.get('/api/dashboard/admin')
    return response.data as AdminDashboard
  },
}