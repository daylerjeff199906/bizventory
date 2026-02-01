import { redirect } from 'next/navigation'

export default function SaleDetailsPage({
    params
}: {
    params: { uuid: string; saleId: string }
}) {
    console.log('--- [saleId] Page Params:', params)
    redirect(`/dashboard/${params.uuid}/sales/${params.saleId}/edit`)
}
