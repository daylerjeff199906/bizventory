'use client'
import { useState } from 'react'
import {
  CombinedResult,
  getProductsAndVariantsForPurchase
} from '@/apis/app/productc.variants.list'

export const useProductsAndVariants = ({
  businessId
}: { businessId?: string } = {}) => {
  const [items, setItems] = useState<CombinedResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchItems = async (searchTerm: string = '', limit: number = 15) => {
    try {
      setLoading(true)
      setError(null)

      const results = await getProductsAndVariantsForPurchase({
        businessId: businessId,
        searchTerm: searchTerm,
        limit: limit
      })
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
