import { NewPurchasePage } from '@/modules/purchases'
import { Params } from '@/types'

interface Props {
  params: Params
}

export default async function Page(props: Props) {
  const params = await props.params
  const uuid = params.uuid

  return (
    <div className="py-6">
      <NewPurchasePage businessId={uuid?.toString()} />
    </div>
  )
}
