import { SuppliersList } from '@/modules/suppliers'
import { getSuppliers } from '@/apis/app'

export default async function Page() {
  const suppliers = await getSuppliers()

  return <SuppliersList suppliersList={suppliers || []} />
}

export const dynamic = 'force-dynamic' // Forzar revalidación en cada solicitud
