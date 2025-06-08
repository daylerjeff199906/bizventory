'use client'
import { useState, useEffect } from 'react'
import { getSuppliers } from '@/apis/app'
import { Supplier } from '@/types'

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    getSuppliers()
      .then((data) => {
        if (isMounted) {
          setSuppliers(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err)
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  return { suppliers, loading, error }
}
