import { Brand } from '../products'

export interface InventoryMovement {
  id: string
  product_id?: string | null
  date?: string | null // ISO timestamp string
  quantity: number
  description?: string | null
  created_at?: string | null // ISO timestamp string
}

export interface InventoryMovementWithProduct extends InventoryMovement {
  product: {
    code: string
    name: string
    description: string
    brand?: Brand | null
  }
}

export interface ProductStock {
  product_id: string
  product_name: string
  product_description?: string | null
  current_stock: number
  updated_at?: string | null // ISO timestamp string
}

export interface InventoryStock {
  product_id: string
  product_name: string
  product_description?: string | null
  category_id: string
  current_stock: number
  //others props
  brand_name?: string | null
  brand_id?: string | null
  product_code: string
}
