import { redirect } from 'next/navigation'

export default async function EditSalePage({
    params
}: {
    params: { uuid: string, saleId: string }
}) {
    // Repurposing the edit route to a view-only invoice page
    redirect(`/dashboard/${params.uuid}/sales/${params.saleId}`)
}
