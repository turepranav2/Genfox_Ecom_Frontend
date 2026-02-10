import api from './api-config'

export interface CartItem {
  id: string
  productId: string
  quantity: number
  product?: {
    id: string
    name: string
    price: number
    images: string[]
    stock: number
  }
}

export interface Cart {
  items: CartItem[]
  total: number
}

export const cartAPI = {
  // Get cart
  get: async () => {
    const response = await api.get('/api/cart')
    return response.data
  },

  // Add to cart
  add: async (data: { productId: string; quantity: number }) => {
    const response = await api.post('/api/cart/add', data)
    return response.data
  },

  // Update cart quantity
  update: async (data: { productId: string; quantity: number }) => {
    const response = await api.put('/api/cart/update', data)
    return response.data
  },

  // Remove from cart
  remove: async (productId: string) => {
    const response = await api.delete(`/api/cart/remove/${productId}`)
    return response.data
  },

  // Clear cart
  clear: async () => {
    const response = await api.delete('/api/cart/clear')
    return response.data
  },
}