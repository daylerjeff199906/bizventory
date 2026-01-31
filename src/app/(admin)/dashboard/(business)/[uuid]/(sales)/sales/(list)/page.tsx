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

  const q = searchParams.q?.toString()
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 10
  const fromDate = searchParams.from?.toString()
  const toDate = searchParams.to?.toString()

  const sales = await getSales({
    businessId: uuid?.toString(),
    sortBy: sortField ?? 'created_at',
    sortDirection: sortOrder ?? 'desc',
    page,
    pageSize: limit,
    fromDate,
    toDate,
    filters: {
      reference_number: q,
    }
  })

  return (
    <>
      <SalesList
        businessId={uuid?.toString() || ''}
        salesData={sales}
        searchQuery={q}
        filters={{
          from: fromDate,
          to: toDate
        }}
      />
    </>
  )
}
