import { Params } from '@/types'
import { getPurchaseById } from '@/apis/app'
import { PurchaseInvoice } from '@/modules/purchases'
import { EmptyState } from '@/components/miscellaneous/empty-state'

interface Props {
  params: Params
}

export default async function Page(props: Props) {
  const params = await props.params
  const purchase_id = await params.purchase

  const response = await getPurchaseById(String(purchase_id))

  if (!response) {
    return (
      <EmptyState
        title="Compra no encontrada"
        description="La compra que estás buscando no existe o ha sido eliminada."
      />
    )
  }

  return (
    <>
      <PurchaseInvoice purchase={response} items={response.items} />
    </>
  )
}
