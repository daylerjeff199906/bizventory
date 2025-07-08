import { getCompanyInfoById } from '@/apis/app'
import { getFullProductStock } from '@/apis/app/inventory'
import { InventoryStockTableReport } from '@/modules/reports'

const UUID_BUSS = '4beae67e-790c-4140-89f8-4bd3f1c9c122' // Reemplazar con el UUID real

export default async function Page() {
  const productTotals = await getFullProductStock()

  const companyInfo = await getCompanyInfoById(UUID_BUSS)

  if (!companyInfo || !productTotals) {
    return <div>Error: Información no encontrada</div>
  }

  return (
    <InventoryStockTableReport
      company={companyInfo}
      inventoryStock={productTotals}
    />
  )
}
