import { Params } from '@/types'
import { getPurchaseById } from '@/apis/app'
import { EmptyState } from '@/components/miscellaneous/empty-state'
import { EditPurchasePage } from '@/modules/purchases'

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
        // defaultPurchase={{
        //   ...response,
        //   items:
        //     response.items?.map((item) => ({
        //       ...item,
        //       // ensure required numeric fields are present and not undefined
        //       quantity: item.quantity ?? 0,
        //       price: item.price ?? 0,
        //       // avoid accessing a non-existent `product_name` property; use fallbacks safely
        //       original_product_name: String(
        //         // prefer an existing original_product_name, then try common shapes, otherwise empty string
        //         (item as any).original_product_name ??
        //           (item as any).product_name ??
        //           (item as any).product?.name ??
        //           ''
        //       )
        //     })) || []
        // }}
      />
    </>
  )
}
