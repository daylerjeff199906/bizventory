import { Params } from '@/types'
import { getPurchaseById } from '@/apis/app'

interface Props {
  params: Params
}

export default async function Page(props: Props) {
  const params = await props.params
  const uuid = await params.uuid

  return <div></div>
}
