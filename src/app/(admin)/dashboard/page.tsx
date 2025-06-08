import { getInventoryMovements } from '@/apis/app/inventory'
import { InventoryDashboard } from '@/modules/dashboard'

export default async function Page() {
  const inventoryMovements = await getInventoryMovements({
    page: 1,
    pageSize: 8,
    sortBy: 'date',
    sortDirection: 'desc'
  })

  return <InventoryDashboard movements={inventoryMovements.data || []} />
}
