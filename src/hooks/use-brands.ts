import { useState } from 'react'
import { getBrands } from '@/apis/app'
import { Brand, ResApi } from '@/types'

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBrands = async ({ query = '', idBusiness }: { query?: string, idBusiness?: string } = {}) => {
    try {
      setLoading(true)
      const response: ResApi<Brand> = await getBrands({
        filters: {
          name: query
        },
        idBusiness: idBusiness,
        page: 1,
        pageSize: 100 // Ajusta el tamaño de página según tus necesidades
      })
      setBrands(response.data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { brands, loading, error, fetchBrands }
}
