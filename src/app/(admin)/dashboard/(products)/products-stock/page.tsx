import { getFullProductStock } from '@/apis/app/inventory'
import { InventoryStockTable } from '@/modules/purchases'

export default async function Page() {
  const productTotals = await getFullProductStock()

  return <InventoryStockTable inventoryStock={productTotals} />
}
