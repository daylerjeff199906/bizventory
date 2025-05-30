import { getPurchases } from '@/apis/app'
import { PurchasesList } from '@/modules/purchases'
import { SearchParams } from '@/types'

interface Props {
  searchParams: SearchParams
}

export default async function Page(props: Props) {
  const searchParams = await props.searchParams
  const sortBy = searchParams.sortBy

  let sortField: string = 'id'
  let sortOrder: 'asc' | 'desc' = 'asc'

  if (sortBy) {
    const [field, order] = sortBy.toString()?.split('.')
    sortField = field || 'id'
    sortOrder = order === 'desc' ? 'desc' : 'asc'
  }

  const purchases = await getPurchases({
    sortBy: sortField,
    sortDirection: sortOrder
  })

  return (
    <>
      <PurchasesList purchasesData={purchases.data} />
    </>
  )
}
