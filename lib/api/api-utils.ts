// Helper functions for API interactions

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export const getUserRole = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userRole')
  }
  return null
}

export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

export const isAdmin = (): boolean => {
  return getUserRole() === 'ADMIN'
}

export const isSupplier = (): boolean => {
  return getUserRole() === 'SUPPLIER'
}

export const isUser = (): boolean => {
  return getUserRole() === 'USER'
}

export const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
  }
}

export const setAuth = (token: string, role: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
    localStorage.setItem('userRole', role)
  }
}

// Error handler
export const handleAPIError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || error.response.data?.error || 'An error occurred'
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.'
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred'
  }
}

// Format price
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

// Format date
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Order status colors
export const getOrderStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    PENDING: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50',
    PROCESSING: 'bg-blue-900/40 text-blue-400 border border-blue-700/50',
    SHIPPED: 'bg-purple-900/40 text-purple-400 border border-purple-700/50',
    DELIVERED: 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50',
    CANCELLED: 'bg-red-900/40 text-red-400 border border-red-700/50',
  }
  return statusColors[status] || 'bg-neutral-800 text-neutral-400'
}

// Supplier status colors
export const getSupplierStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    PENDING: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50',
    APPROVED: 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50',
    REJECTED: 'bg-red-900/40 text-red-400 border border-red-700/50',
  }
  return statusColors[status] || 'bg-neutral-800 text-neutral-400'
}