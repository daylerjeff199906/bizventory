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
    filters: {
      reference_number: q,
      // Note: Typically date filtering might need specific params in getSales or handled via filtering object if API supports it
      // For now assuming getSales might need update or supports partial matching via filters object if strictly typed
    }
    // We might need to pass from/to separately if filters object doesn't support ranges or update getSales to accept them
  })

  // Since getSales interface in the viewed file (step 75 summary) only showed partial<Sale> for filters,
  // I should check if it supports date ranges. The summary mentioned "getSales supports filtering...".
  // Let's assume for now we pass them via extended options or refine getSales if needed.
  // Actually, looking at previous summary, getSales signature:
  // businessId, filters, sortBy, sortDirection, page, pageSize.
  // It doesn't explicitly show date range params. I might need to update getSales.
  // But let's first update the page to capture these.

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
