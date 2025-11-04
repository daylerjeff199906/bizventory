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
    bussinessId: uuid?.toString() || ''
  })

  return (
    <>
      <PurchasesList
        businessId={uuid?.toString() || ''}
        purchasesData={purchases.data}
      />
    </>
  )
}
