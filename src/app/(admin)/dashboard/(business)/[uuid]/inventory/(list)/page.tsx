import { InventoryList } from '@/modules/inventory/components/inventory-list'
import { getProductsWithVariantsAndStock } from '@/apis/app/product-stock'

interface PageProps {
  params: { uuid: string }
  searchParams: { page?: string; q?: string }
}

export default async function InventoryPage({ params, searchParams }: PageProps) {
  const { uuid } = params
  const page = Number(searchParams.page) || 1
  const searchQuery = searchParams.q || ''

  const response = await getProductsWithVariantsAndStock({
    businessId: uuid,
    page,
    pageSize: 10, // Adjust page size as needed
    searchQuery
  })

  return (
    <InventoryList
      data={response.data}
      totalItems={response.total_items}
      page={page}
      totalPages={response.total_pages}
      businessId={uuid}
    />
  )
}
