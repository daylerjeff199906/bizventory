'use client'
import { useState } from 'react'
import {
  CombinedResultPrice,
  getProductsAndVariantsForPurchase
} from '@/apis/app/productc.variants.list'

export const useProductsPrices = () => {
  const [items, setItems] = useState<CombinedResultPrice[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchItems = async (searchTerm: string = '', limit: number = 10) => {
    try {
      setLoading(true)
      setError(null)

      const results = await getProductsAndVariantsForPurchase(searchTerm, limit)
      setItems(results)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('An unknown error occurred')
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    items,
    loading,
    error,
    fetchItems
  }
}
