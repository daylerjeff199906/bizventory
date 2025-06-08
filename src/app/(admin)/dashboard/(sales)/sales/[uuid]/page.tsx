import { getCompanyInfoById } from '@/apis/app'
import { getSaleById } from '@/apis/app/sales'
import { InvoiceDetail } from '@/modules/sales/pages/invoice-detail'
import { Params } from '@/types'

interface Props {
  params: Params
}

const UUID_BUSS = '4beae67e-790c-4140-89f8-4bd3f1c9c122' // Reemplazar con el UUID real

export default async function Page(props: Props) {
  const params = await props.params
  const uuid = await params.uuid

  const companyInfo = await getCompanyInfoById(UUID_BUSS)
  const sale = await getSaleById(String(uuid))

  if (!companyInfo || !sale) {
    return <div>Error: Información no encontrada</div>
  }

  return (
    <>
      <InvoiceDetail company={companyInfo} sale={sale} />
    </>
  )
}
