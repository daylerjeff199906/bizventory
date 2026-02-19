import { ProductsList } from '@/modules/products'
import { getProductsWithVariantsAndStock } from '@/apis/app/product-stock'
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

  const page = searchParams.page ? parseInt(searchParams.page.toString()) : 1
  const pageSize = searchParams.limit ? parseInt(searchParams.limit.toString()) : 10

  const productsResponse = await getProductsWithVariantsAndStock({
    page,
    pageSize,
    searchQuery: name?.toString() || '',
    sortBy: sortField || 'created_at',
    sortOrder: sortOrder || 'desc',
    businessId: uuid?.toString() || ''
  })

  return (
    <div className="flex flex-col gap-4">
      <ProductsList
        bussinessId={uuid?.toString() || ''}
        dataProducts={{
          data: productsResponse.data,
          page: page,
          page_size: pageSize,
          total: productsResponse.total_items,
          total_pages: productsResponse.total_pages
        }}
      />
    </div>
  )
}
