import api from './api-config'

// Helper to set auth cookie so middleware can read it (localStorage is client-only)
const setAuthCookie = (token: string) => {
  document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`
}

const clearAuthCookie = () => {
  document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
}

// User profile types
export interface UserAddress {
  _id?: string
  label: string
  street: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export interface UserProfile {
  id?: string
  _id?: string
  name: string
  email: string
  phone: string
  addresses: UserAddress[]
}

// User Authentication
export const authAPI = {
  // User Register
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },

  // User Login
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userRole', 'USER')
      setAuthCookie(response.data.token)
    }
    return response.data
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/api/auth/profile')
    return response.data
  },

  // Update user profile (name, phone, addresses)
  updateProfile: async (data: { name?: string; phone?: string; addresses?: UserAddress[] }) => {
    const response = await api.put('/api/auth/profile', data)
    return response.data
  },
}

// Supplier Authentication
export const supplierAuthAPI = {
  // Supplier Register
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/api/supplier/auth/register', data)
    return response.data
  },

  // Supplier Login
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/supplier/auth/login', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userRole', 'SUPPLIER')
      setAuthCookie(response.data.token)
    }
    return response.data
  },
}

// Admin Authentication
export const adminAuthAPI = {
  // Admin Login
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/admin/login', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userRole', 'ADMIN')
      setAuthCookie(response.data.token)
    }
    return response.data
  },
}

// Logout (common for all)
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  clearAuthCookie()
}