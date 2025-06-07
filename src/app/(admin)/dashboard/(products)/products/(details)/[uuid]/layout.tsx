import React from 'react'
import { LayoutProduct } from '@/modules/products'
import { APP_URLS } from '@/config/app-urls'
import { Params } from '@/types'

interface LayoutsProps {
  params: Params
  children: React.ReactNode
}

export default async function Layout(props: LayoutsProps) {
  const params = await props.params
  const uuid = await params.uuid

  return (
    <LayoutProduct
      title="Opciones de producto"
      items={[
        {
          name: 'Editar Producto',
          url: APP_URLS.PRODUCTS.EDIT(String(uuid))
        },
        {
          name: 'Crear Variante',
          url: APP_URLS.PRODUCTS.CREATE_VARIANT(String(uuid))
        },
        // {
        //   name: 'Multimedia',
        //   url: APP_URLS.PRODUCTS.MULTIMEDIA(String(uuid))
        // },
        // {
        //   name: 'Detalles',
        //   url: APP_URLS.PRODUCTS.DETAIL(String(uuid))
        // }
      ]}
    >
      {props.children}
    </LayoutProduct>
  )
}
