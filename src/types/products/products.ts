export interface Product {
  uuid: string
  name: string
  description?: string | null
  code: string
  images: ProductImage[]
  created_at: string
  updated_at: string
}

export interface ProductImage {
  uuid: string
  product_uuid: string
  url: string
  is_banner: boolean
  created_at: string
  updated_at: string
}
