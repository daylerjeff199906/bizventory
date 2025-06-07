import { Brand, ProductDetails } from '../products'

export interface PurchaseItem {
  id: string // UUID
  purchase_id?: string | null // UUID referencing purchases.id
  product_id?: string | null // UUID referencing products.id
  quantity: number
  price: number
  code?: string // Código del producto
  bar_code?: string // Código de barras del producto
  discount?: number // Descuento aplicado al producto
}

export interface PurchaseItemList {
  id: string // UUID
  purchase_id?: string | null // UUID referencing purchases.id
  product?: ProductDetails | null // UUID referencing products.id
  brand?: Brand | null // UUID referencing brands.id
  quantity: number
  price: number
  //observations thats props
  code?: string // Código del producto
  bar_code?: string // Código de barras del producto
  discount?: number // Descuento aplicado al producto
}
