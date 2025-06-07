export interface SaleItemInput {
  temp_id?: string // ID temporal único para gestión local
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  discount_amount: number
  total_price: number
}
