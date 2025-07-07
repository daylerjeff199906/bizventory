import { fetchInventoryStats, getBrands } from '@/apis/app'
import { getInventoryMovements } from '@/apis/app/inventory'
import { InventoryDashboard } from '@/modules/dashboard'

export default async function Page() {
  const inventoryMovements = await getInventoryMovements({
    page: 1,
    pageSize: 8,
    sortBy: 'date',
    sortDirection: 'desc'
  })

  const statsSummary = await fetchInventoryStats()

  const brandsList = await getBrands({})

  return (
    <InventoryDashboard
      movements={inventoryMovements.data || []}
      inventoryStats={{
        lowStock: statsSummary?.out_of_stock_products || 0,
        totalProducts: statsSummary?.total_products || 0,
        outOfStock: statsSummary?.out_of_stock_products || 0,
        totalValue: statsSummary?.total_sales || 0
      }}
      brandsList={brandsList.data || []}
    />
  )
}
