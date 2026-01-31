import { ProductDetails } from './products'

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  price: number
  description: string | null
  code: string
  created_at: string
  updated_at: string | null
  attributes: ProductVariantAttribute[]
}

export interface ProductVariantAttribute {
  id?: string // Opcional porque puede no ser seleccionado en la consulta
  variant_id?: string // Opcional por la misma razón
  attribute_type: string
  attribute_value: string
  created_at?: string
  updated_at?: string | null
}

export interface ProductWithVariants extends ProductDetails {
  variants: ProductVariant[]
}
