import { BrandList } from '@/modules/products'
import { getBrands } from '@/apis/app'
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

  const brandList = await getBrands({
    filters: {
      name: searchParams.name
    },
    idBusiness: uuid?.toString(),
    sortBy: sortField,
    sortDirection: sortOrder
  })

  console.log({ brandList })

  return (
    <>
      <BrandList brandslist={brandList.data || []} />
    </>
  )
}

export const dynamic = 'force-dynamic'
