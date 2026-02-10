import api from './api-config'

// Image upload via Cloudinary (backend handles Cloudinary with multer)
export const uploadAPI = {
  /**
   * Upload a single image file. Backend uses multer + Cloudinary.
   * Expects multipart/form-data with field name "image".
   * Returns { url: "https://res.cloudinary.com/..." }
   */
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Upload multiple image files sequentially.
   * Returns an array of Cloudinary URLs.
   */
  uploadMultiple: async (files: File[]): Promise<string[]> => {
    const urls: string[] = []
    for (const file of files) {
      const formData = new FormData()
      formData.append('image', file)
      const response = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      urls.push(response.data.url)
    }
    return urls
  },
}
