import { useState, useCallback } from 'react'
import { handleAPIError } from './api-utils'

interface UseAPIOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useAPI<T = any>(apiFunction: (...args: any[]) => Promise<T>, options?: UseAPIOptions) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await apiFunction(...args)
        setData(result)
        
        if (options?.onSuccess) {
          options.onSuccess(result)
        }
        
        return result
      } catch (err: any) {
        const errorMessage = handleAPIError(err)
        setError(errorMessage)
        
        if (options?.onError) {
          options.onError(errorMessage)
        }
        
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

// Example usage:
// const { data, loading, error, execute } = useAPI(productAPI.getAll)
// useEffect(() => { execute() }, [])