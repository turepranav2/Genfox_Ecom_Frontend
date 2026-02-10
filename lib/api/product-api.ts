import api from './api-config'

export interface Product {
  id: string
  name: string
  slug?: string
  description?: string
  price: number
  mrp?: number
  stock: number
  category: string
  images: string[]
  isActive?: boolean
  ratings?: {
    average: number
    count: number
  }
  supplierId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateProductData {
  name: string
  price: number
  stock: number
  category: string
  images: string[]
}

export const productAPI = {
  // Get all products (Public)
  getAll: async () => {
    const response = await api.get('/api/products')
    return response.data
  },

  // Get single product
  getById: async (id: string) => {
    const response = await api.get(`/api/products/${id}`)
    return response.data
  },

  // Create product (Supplier only)
  create: async (data: CreateProductData) => {
    const response = await api.post('/api/products', data)
    return response.data
  },

  // Update product (Supplier only)
  update: async (id: string, data: Partial<CreateProductData>) => {
    const response = await api.put(`/api/products/${id}`, data)
    return response.data
  },

  // Delete product (Supplier only)
  delete: async (id: string) => {
    const response = await api.delete(`/api/products/${id}`)
    return response.data
  },

  // Get supplier's products
  getSupplierProducts: async () => {
    const response = await api.get('/api/products/supplier')
    return response.data
  },
}