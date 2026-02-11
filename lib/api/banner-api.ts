import api from './api-config'

export interface Banner {
  id?: string
  _id?: string
  imageUrl: string
  link: string
  title?: string
  isActive: boolean
  order?: number
  createdAt?: string
  updatedAt?: string
}

// Public API - get active banners for homepage carousel
export const bannerAPI = {
  getActive: async (): Promise<Banner[]> => {
    const response = await api.get('/api/banners')
    const data = response.data
    return Array.isArray(data) ? data : data.banners || []
  },
}

// Admin API - full CRUD for banners
export const adminBannerAPI = {
  getAll: async (): Promise<Banner[]> => {
    const response = await api.get('/api/admin/banners')
    const data = response.data
    return Array.isArray(data) ? data : data.banners || []
  },

  create: async (data: { imageUrl: string; link: string; title?: string; isActive?: boolean; order?: number }) => {
    const response = await api.post('/api/admin/banners', data)
    return response.data
  },

  update: async (id: string, data: Partial<Banner>) => {
    const response = await api.put(`/api/admin/banners/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/admin/banners/${id}`)
    return response.data
  },

  reorder: async (bannerIds: string[]) => {
    const response = await api.put('/api/admin/banners/reorder', { bannerIds })
    return response.data
  },
}
