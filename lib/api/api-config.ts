import axios from 'axios'

// Base URL: env var > auto-detect (production=Render, dev=localhost)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://genfox-ecom-backend.onrender.com'
    : 'http://localhost:5000')

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized — redirect to the correct login page based on role
    if (error.response?.status === 401) {
      const role = localStorage.getItem('userRole')
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'

      if (role === 'ADMIN') {
        window.location.href = '/admin/login'
      } else if (role === 'SUPPLIER') {
        window.location.href = '/supplier/login'
      } else {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api