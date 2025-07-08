import { getCompanyInfoById } from '@/apis/app'
import { getInventoryMovements } from '@/apis/app/inventory'
import { InventoryMovementReport } from '@/modules/reports'

const UUID_BUSS = '4beae67e-790c-4140-89f8-4bd3f1c9c122' // Reemplazar con el UUID real

export default async function Page() {
  const inventoryMovements = await getInventoryMovements({
    page: 1,
    pageSize: 30,
    sortBy: 'date',
    sortDirection: 'desc'
  })

  const companyInfo = await getCompanyInfoById(UUID_BUSS)

  if (!companyInfo || !inventoryMovements) {
    return <div>Error: Información no encontrada</div>
  }

  return (
    <>
      <InventoryMovementReport
        company={companyInfo}
        movements={inventoryMovements.data}
      />
    </>
  )
}
