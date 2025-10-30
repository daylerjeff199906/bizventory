import { getProductById } from '@/apis/app'
import { EditProductPage } from '@/modules/products'
import { Params } from '@/types'
import React from 'react'

interface Props {
  params: Params
}

export default async function Page(props: Props) {
  const params = await props.params
  const product = await params.product

  const productData = await getProductById(product?.toString() || '')

  if (!productData) {
    return <div>Product not found</div>
  }

  return (
    <>
      <EditProductPage productDefault={productData} />
    </>
  )
}
