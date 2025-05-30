export interface PurchaseItem {
  id: string // UUID
  purchase_id?: string | null // UUID referencing purchases.id
  product_id?: string | null // UUID referencing products.id
  quantity: number
  price: number
}
