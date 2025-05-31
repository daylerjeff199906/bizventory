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
  }
}

export interface ProductStock {
  product_id: string
  product_name: string
  product_code: string
  current_stock: number
  updated_at?: string | null // ISO timestamp string
}

export interface InventoryStock {
  product_id: string
  product_name: string
  product_code: string
  category_id: string
  total_quantity: number
}
