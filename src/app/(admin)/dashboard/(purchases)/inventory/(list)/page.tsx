import { getInventoryMovements } from '@/apis/app/inventory'
import { InventoryMovementsTable } from '@/modules/purchases'

export default async function Page() {
  const inventoryMovements = await getInventoryMovements({
    page: 1,
    pageSize: 30,
    sortBy: 'date',
    sortDirection: 'desc'
  })

  return (
    <>
      <InventoryMovementsTable movements={inventoryMovements.data} />
    </>
  )
}
