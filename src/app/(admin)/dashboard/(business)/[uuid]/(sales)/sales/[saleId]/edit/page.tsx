import { getSaleById } from '@/apis/app/sales'
import EditSaleForm from '@/modules/sales/components/edit-sale-form'
import { notFound } from 'next/navigation'

export default async function EditSalePage({
    params
}: {
    params: { saleId: string }
}) {
    const sale = await getSaleById(params.saleId)

    if (!sale) {
        notFound()
    }

    return <EditSaleForm sale={sale} />
}
