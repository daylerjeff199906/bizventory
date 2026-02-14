import React from 'react'
import { ProductsList, FiltersProducts } from '@/modules/products'
import { getProductsByBusinessId } from '@/apis/app'
import { Params, SearchParams } from '@/types'
import { PageHeader } from '@/components/app/header-section'
import { APP_URLS } from '@/config/app-urls'

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

  const page = searchParams.page ? parseInt(searchParams.page.toString()) : 1
  const pageSize = searchParams.limit ? parseInt(searchParams.limit.toString()) : 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const products = await getProductsByBusinessId({
    from,
    to,
    sortColumn: sortField || 'created_at',
    sortDirection: sortOrder as 'asc' | 'desc',
    idBusiness: uuid?.toString() || '',
    searchTerm: name?.toString() || ''
  })

  return (
    <div className="flex flex-col gap-4">
      <ProductsList
        bussinessId={uuid?.toString() || ''}
        dataProducts={products}
      />
    </div>
  )
}
