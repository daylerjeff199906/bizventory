import { SuppliersList } from '@/modules/suppliers'
import { getSuppliers } from '@/apis/app'
import { Params } from '@/types'

interface Props {
  params: Params
}

export default async function Page(props: Props) {
  const params = await props.params
  const uuid = params.uuid
  const suppliers = await getSuppliers({
    businessId: uuid?.toString() || ''
  })

  return (
    <SuppliersList
      bussinessId={uuid?.toString() || ''}
      suppliersList={suppliers || []}
    />
  )
}

export const dynamic = 'force-dynamic' // Forzar revalidación en cada solicitud
