'use client'
import { useState } from 'react'
import { getProducts } from '@/apis/app'
import { ProductDetails, ResApi } from '@/types'

export const useProducts = () => {
  const [products, setProducts] = useState<ProductDetails[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = async ({ query = '', code = '' } = {}) => {
    try {
      setLoading(true)
      const response: ResApi<ProductDetails> = await getProducts({
        filters: {
          name: query,
          code: code
        }
      })
      setProducts(response.data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, error, fetchProducts }
}
