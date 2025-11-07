import { getCompanyInfoById } from '@/apis/app'
import { getSaleById } from '@/apis/app/sales'
// import { InvoiceDetailPrint } from '@/modules/sales/pages'
import { Params } from '@/types'

interface Props {
  params: Params
}

const UUID_BUSS = '4beae67e-790c-4140-89f8-4bd3f1c9c122' // Reemplazar con el UUID real

export default async function Page(props: Props) {
  const params = await props.params
  const sale_id = params.sale_id

  const companyInfo = await getCompanyInfoById(UUID_BUSS)
  const sale = await getSaleById(String(sale_id))

  if (!companyInfo || !sale) {
    return <div>Error: Información no encontrada</div>
  }

  return <>{/* <InvoiceDetailPrint company={companyInfo} sale={sale} /> */}</>
}
