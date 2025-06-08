'use client'
import { useState } from 'react'
import {
  getProductsWithVariantsAndStock,
  GetProductsWithVariantsAndStockProps,
  ProductListResponse
} from '@/apis/app'

export const useProductsPrices = () => {
  const [items, setItems] = useState<ProductListResponse>({
    data: [],
    total_items: 0,
    total_pages: 0
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchItems = async (props: GetProductsWithVariantsAndStockProps) => {
    try {
      setLoading(true)
      setError(null)

      const results = await getProductsWithVariantsAndStock(props)

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
