import { getSales } from '@/apis/app/sales'
import { SalesList } from '@/modules/sales/pages/sales-list'
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
    sortField = field || 'id'
    sortOrder = order === 'desc' ? 'desc' : 'asc'
  }

  const sales = await getSales({
    businessId: uuid?.toString(),
    sortBy: sortField ?? 'id',
    sortDirection: sortOrder ?? 'asc'
  })

  return (
    <>
      <SalesList
        salesData={sales}
        searchQuery={searchParams.searchQuery?.toString()}
      />
    </>
  )
}
