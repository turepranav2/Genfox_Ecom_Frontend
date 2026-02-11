import api from './api-config'

export interface SubCategory {
  id?: string
  _id?: string
  name: string
  slug?: string
}

export interface Category {
  id?: string
  _id?: string
  name: string
  slug?: string
  image?: string
  subcategories?: SubCategory[]
  supplierId?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export const categoryAPI = {
  // Get all categories (public - for navbar/home)
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/api/categories')
    const data = response.data
    return Array.isArray(data) ? data : data.categories || []
  },

  // Get single category
  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/api/categories/${id}`)
    return response.data
  },
}

// Supplier can create/manage categories
export const supplierCategoryAPI = {
  // Create category
  create: async (data: { name: string; image?: string }) => {
    const response = await api.post('/api/categories', data)
    return response.data
  },

  // Update category
  update: async (id: string, data: { name: string; image?: string }) => {
    const response = await api.put(`/api/categories/${id}`, data)
    return response.data
  },

  // Delete category
  delete: async (id: string) => {
    const response = await api.delete(`/api/categories/${id}`)
    return response.data
  },

  // Add subcategory to a category
  addSubcategory: async (categoryId: string, data: { name: string }) => {
    const response = await api.post(`/api/categories/${categoryId}/subcategories`, data)
    return response.data
  },

  // Update subcategory
  updateSubcategory: async (categoryId: string, subId: string, data: { name: string }) => {
    const response = await api.put(`/api/categories/${categoryId}/subcategories/${subId}`, data)
    return response.data
  },

  // Delete subcategory
  deleteSubcategory: async (categoryId: string, subId: string) => {
    const response = await api.delete(`/api/categories/${categoryId}/subcategories/${subId}`)
    return response.data
  },
}
