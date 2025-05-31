import { getProductTotals } from '@/apis/app/inventory'
import { InventoryStockTable } from '@/modules/purchases'

export default async function Page() {
  const productTotals = await getProductTotals()

  return <InventoryStockTable inventoryStock={productTotals.data} />
}
