import { getProductByIdDetails } from '@/apis/app'
import { EditProductPage } from '@/modules/products'
import { Params } from '@/types'

interface Props {
  params: Params
}

export default async function Page(props: Props) {
  const params = await props.params

  const uuid = await params.uuid
  const product = await params.product

  const productData = await getProductByIdDetails(product?.toString() || '')

  if (!productData) {
    return <div>Product not found</div>
  }

  return (
    <>
      <EditProductPage
        businessId={uuid?.toString() || ''}
        productDefault={productData}
      />
    </>
  )
}
