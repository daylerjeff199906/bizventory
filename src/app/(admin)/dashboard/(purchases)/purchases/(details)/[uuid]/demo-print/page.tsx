import { Params } from '@/types'
import { getPurchaseById } from '@/apis/app'
import DemoPage from './demo-page'

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
      <DemoPage purchase={response} items={response.items} />
    </>
  )
}
