import { ProductDetails, ProductVariant } from '../products'

export interface InventoryMovement {
  id: string
  product_id?: string | null
  date?: string | null // ISO timestamp string
  quantity: number
  created_at?: string | null // ISO timestamp string
}
export interface InventoryMovementWithProduct {
  id: string
  product_id?: string | null
  product_variant_id?: string | null
  business_id?: string | null
  quantity: number
  movement_date: string
  reference_id: string
  reference_type: string
  movement_status: string
  notes?: string | null
  created_at: string
  movement_type?: string | null
  date?: string | null
  product?: ProductDetails | null
  variant?: ProductVariant | null
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
  product_full_name: string
  code: string
  brand_name?: string
  stock_total: number
}
