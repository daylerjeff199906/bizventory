import { getPurchases } from '@/apis/app'
import { PurchasesList } from '@/modules/purchases'
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
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 10
  const qParam = searchParams.q
  const searchQuery = Array.isArray(qParam) ? qParam[0] : qParam || ''
  const fromParam = searchParams.from
  const toParam = searchParams.to
  const fromDate = Array.isArray(fromParam) ? fromParam[0] : fromParam
  const toDate = Array.isArray(toParam) ? toParam[0] : toParam

  let sortField: string | undefined
  let sortOrder: 'asc' | 'desc' | undefined

  if (sortBy) {
    const [field, order] = sortBy.toString()?.split('.')
    sortField = field || 'id'
    sortOrder = order === 'desc' ? 'desc' : 'asc'
  }

  const purchases = await getPurchases({
    sortBy: sortField ?? 'id',
    sortDirection: sortOrder ?? 'asc',
    bussinessId: uuid?.toString() || '',
    page,
    pageSize: limit,
    fromDate,
    toDate,
    code: searchQuery
  })

  return (
    <>
      <PurchasesList
        businessId={uuid?.toString() || ''}
        purchasesData={purchases.data}
        meta={{
          total: purchases.total,
          total_pages: purchases.total_pages,
          page: purchases.page,
          page_size: purchases.page_size
        }}
        searchQuery={searchQuery}
        filters={{
          from: fromDate,
          to: toDate
        }}
      />
    </>
  )
}
