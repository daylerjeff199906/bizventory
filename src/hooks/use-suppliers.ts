'use client'
import { useState, useEffect } from 'react'
import { getSuppliers } from '@/apis/app'
import { Supplier } from '@/types'

export const useSuppliers = ({businessId}: {businessId?: string}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    getSuppliers({ 
      businessId: businessId?.toString() || ''
    })
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
  }, [businessId])

  return { suppliers, loading, error }
}
