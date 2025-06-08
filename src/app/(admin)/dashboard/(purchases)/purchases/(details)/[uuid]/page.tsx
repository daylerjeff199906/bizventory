import { Params } from '@/types'
import { getPurchaseById } from '@/apis/app'
import { PurchaseInvoice } from '@/modules/purchases'

interface Props {
  params: Params
}

export default async function Page(props: Props) {
  const params = await props.params
  const uuid = await params.uuid

  const response = await getPurchaseById(String(uuid))

  if (!response) {
    return <div>Purchase not found</div>
  }

  return (
    <>
      <PurchaseInvoice purchase={response} items={response.items} />
    </>
  )
}
