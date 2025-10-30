import React from 'react'
import { ProductsList } from '@/modules/products'
import { getProducts } from '@/apis/app'
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

  let sortField: string | undefined
  let sortOrder: 'asc' | 'desc' | undefined

  if (sortBy) {
    const [field, order] = sortBy.toString()?.split('.')
    sortField = field
    sortOrder = order === 'desc' ? 'desc' : 'asc'
  }

  const products = await getProducts({
    filters: {
      name: searchParams.name
    },
    sortBy: sortField,
    sortDirection: sortOrder,
    idBusiness: uuid?.toString()
  })

  return (
    <>
      <ProductsList dataProducts={products} />
    </>
  )
}
