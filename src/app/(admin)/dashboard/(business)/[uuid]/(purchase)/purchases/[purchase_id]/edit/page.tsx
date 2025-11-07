import { Params } from '@/types'
import { getPurchaseById } from '@/apis/app'
import { EmptyState } from '@/components/miscellaneous/empty-state'
import { EditPurchasePage } from '@/modules/purchases'
import { formatDateString } from '@/utils/format/format-currency'

interface Props {
  params: Params
}
export default async function Page(props: Props) {
  const params = await props.params
  const purchase_id = await params.purchase_id

  const response = await getPurchaseById(String(purchase_id))

  if (!response) {
    return (
      <EmptyState
        title="Compra no encontrada"
        description="La compra que estás buscando no existe o ha sido eliminada."
      />
    )
  }

  return (
    <>
      <EditPurchasePage
        purchaseId={String(purchase_id)}
        businessId={params.uuid?.toString()}
        defaultPurchase={{
          business_id: response.business_id ?? '',
          supplier_id: response.supplier_id ?? '',
          date: response.date
            ? formatDateString(response.date, { locale: 'yyyy-MM-DD' })
            : '',
          total_amount: response.total_amount ?? 0,
          code: response.code ?? '',
          guide_number: response.guide_number ?? '',
          subtotal: response.subtotal ?? 0,
          discount: response.discount ?? 0,
          tax_rate: response.tax_rate ?? 0,
          tax_amount: response.tax_amount ?? 0,
          status: response.status ?? 'pending',
          payment_status: response.payment_status ?? 'pending',
          reference_number: response.reference_number ?? '',
          notes: response.notes ?? '',
          supplier: {
            id: response.supplier?.id ?? '',
            name: response.supplier?.name ?? ''
          },
          updated_at: response.updated_at
            ? formatDateString(response.updated_at)
            : '',
          inventory_updated: false,
          items:
            response.items?.map((item) => ({
              ...item,
              quantity: item.quantity ?? 0,
              price: item.price ?? 0,
              description: item.description ?? '',
              name: item.name ?? '',
              original_product_name: item?.original_product_name,
              original_variant_name: item?.original_variant_name
            })) || []
        }}
      />
    </>
  )
}
