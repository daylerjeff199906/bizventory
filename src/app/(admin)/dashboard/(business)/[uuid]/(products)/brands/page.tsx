import { BrandList } from '@/modules/products'
import { getBrands } from '@/apis/app'
import { SearchParams } from '@/types'

interface Props {
  searchParams: SearchParams
}

export default async function Page(props: Props) {
  const searchParams = await props.searchParams
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
    sortBy: sortField,
    sortDirection: sortOrder
  })

  return (
    <>
      <BrandList brandslist={brandList.data || []} />
    </>
  )
}

export const dynamic = 'force-dynamic'
