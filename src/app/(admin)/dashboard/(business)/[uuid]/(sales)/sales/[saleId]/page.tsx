import { getSaleById } from '@/apis/app/sales'
import { InvoiceDetailPrint } from '@/modules/sales/pages/invoice-print-details'
import { Params } from '@/types'
import { notFound } from 'next/navigation'

interface Props {
    params: Params
}

export default async function SaleDetailsPage(props: Props) {
    const params = await props.params
    // const businessId = params.uuid as string
    const saleId = params.saleId as string
    const sale = await getSaleById(saleId)

    console.log(sale)

    if (!sale) {
        notFound()
    }

    return (
        <InvoiceDetailPrint sale={sale} />
    )
}
