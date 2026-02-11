// Export all API services from a single file for easier imports

export * from './api-config'
export * from './auth-api'
export * from './product-api'
export * from './cart-api'
export * from './order-api'
export * from './admin-api'
export * from './dashboard-api'
export * from './supplier-api'
export * from './upload-api'
export * from './category-api'
export * from './banner-api'

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${process.env.NODE_ENV === 'production' 
      ? 'https://genfox-ecom-backend.onrender.com'
      : 'http://localhost:5000'}/health`)
    return response.json()
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}