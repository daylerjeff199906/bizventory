import React from 'react'
import { ProductsList } from '@/modules/products'
import { getProductsByBusinessId } from '@/apis/app'
import { Params, SearchParams } from '@/types'

interface Props {
  searchParams: SearchParams
  params: Params
}

export default async function Page(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params

  const uuid = params.uuid

  const sortBy = searchParams.sortBy
  const name = searchParams.name

  let sortField: string | undefined
  let sortOrder: 'asc' | 'desc' | undefined

  if (sortBy) {
    const [field, order] = sortBy.toString()?.split('.')
    sortField = field
    sortOrder = order === 'desc' ? 'desc' : 'asc'
  }

  const products = await getProductsByBusinessId({
    from: 0,
    to: 49,
    sortColumn: sortField || 'created_at',
    sortDirection: sortOrder as 'asc' | 'desc',
    idBusiness: uuid?.toString() || '',
    searchTerm: name?.toString() || ''
  })

  return (
    <>
      <ProductsList dataProducts={products} />
    </>
  )
}
