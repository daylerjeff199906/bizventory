import React from 'react'
import { CreateVariantForm } from '@/modules/products'
import { Params } from '@/types'
import { getProductById } from '@/apis/app'
import { getProductWithVariants } from '@/apis/app/products.variants'

interface Props {
  params: Params
}

export default async function Page(props: Props) {
  const params = await props.params
  const uuid = await params.uuid

  const productData = await getProductById(uuid?.toString() || '')
  const productsWithVariants = await getProductWithVariants(
    uuid?.toString() || ''
  )

  if (!productData) {
    return <div>Product not found</div>
  }

  return (
    <>
      <CreateVariantForm
        productId={productData.id}
        productCode={productData.code || 'SIN CÓDIGO'}
        productName={`${productData?.brand?.name} ${productData?.description}`}
        productWithVariants={productsWithVariants}
      />
    </>
  )
}
