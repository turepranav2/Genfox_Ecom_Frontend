import api from './api-config'

export interface SupplierProfile {
  id: string
  name: string
  email: string
  phone?: string
  gstin?: string
  address?: string
  logo?: string
  bankDetails?: {
    accountHolderName: string
    accountNumber: string
    ifscCode: string
    bankName: string
  }
  status: string
  createdAt: string
}

export interface SupplierPaymentSummary {
  totalRevenue: number
  totalCommission: number
  netPayout: number
  pendingPayout: number
}

export interface SupplierTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
  orderId?: string
}

export const supplierProfileAPI = {
  // Get supplier profile
  getProfile: async () => {
    const response = await api.get('/api/supplier/profile')
    return response.data
  },

  // Update supplier profile
  updateProfile: async (data: Partial<SupplierProfile>) => {
    const response = await api.put('/api/supplier/profile', data)
    return response.data
  },
}

export const supplierPaymentAPI = {
  // Get payment summary
  getSummary: async () => {
    const response = await api.get('/api/supplier/payments/summary')
    return response.data
  },

  // Get transactions
  getTransactions: async () => {
    const response = await api.get('/api/supplier/payments/transactions')
    return response.data
  },
}
