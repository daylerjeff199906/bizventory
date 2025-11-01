import { Params } from '@/types'
import { getPurchaseById } from '@/apis/app'
import { PurchaseInvoice } from '@/modules/purchases'

interface LayoutProps {
  params: Params
}

export default async function Page(props: LayoutProps) {
  const params = await props.params
  const purchase = params.purchase_id

  const response = await getPurchaseById(String(purchase))

  if (!response) {
    return <div>Purchase not found</div>
  }

  return (
    <>
      <PurchaseInvoice purchase={response} items={response.items} />
    </>
  )
}
