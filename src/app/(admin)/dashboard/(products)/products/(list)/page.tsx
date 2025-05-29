import { ProductsList } from '@/modules/products'
import React from 'react'

export default function page() {
  return (
    <>
      <ProductsList
        dataProducts={{
          data: [],
          page: 1,
          page_size: 10,
          total: 0,
          total_pages: 0
        }}
      />
    </>
  )
}
