import { Params } from '@/types'
import { getPurchaseById } from '@/apis/app'
import DemoPage from '@/modules/purchases/page/demo-page'

interface Props {
  params: Params
}

export default async function Page(props: Props) {
  const params = await props.params
  const purchase_id = params.purchase_id

  const response = await getPurchaseById(String(purchase_id))

  if (!response) {
    return <div>Purchase not found</div>
  }

  return (
    <>
      <DemoPage purchase={response} items={response.items} />
    </>
  )
}
