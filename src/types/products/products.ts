import { Brand } from './brands'

export interface Product {
  id: string // UUID maps to string in TypeScript
  name: string
  description: string | null
  code: string
  // price: number // numeric(10,2) maps to number
  category_id: number | null // bigint maps to number
  unit: string
  brand_id: string | null // UUID maps to string in TypeScript
  supplier_code: string | null
  location: string | null
  created_at: string // timestamp with time zone can be Date or ISO string
  is_active: boolean
  has_variants: boolean
  tags: string[] | null
  updated_at: string | null
  images: ProductImage[] | null
}

export interface ProductDetails extends Omit<Product, 'brand_id'> {
  brand: Brand | null
}

export interface ProductImage {
  uuid: string
  product_uuid: string
  url: string
  is_banner: boolean
  created_at: string
  updated_at: string
}
