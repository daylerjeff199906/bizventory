import { Supplier } from '../suppliers'

export interface Purchase {
  id: string // UUID
  date?: Date | null
  supplier_id: string // UUID referencing suppliers.id
  total_amount: number
  code?: string | null
  guide_number?: string | null
  subtotal: number
  discount?: number | null
  tax_rate?: number | null
  tax_amount?: number | null
  created_at?: Date | null
  updated_at?: Date | null
}

export interface PurchaseList {
  id: string // UUID
  date?: Date | null
  supplier: Supplier | null // UUID referencing suppliers.id
  total_amount: number
  code?: string | null
  guide_number?: string | null
  subtotal: number
  discount?: number | null
  tax_rate?: number | null
  tax_amount?: number | null
  created_at?: Date | null
  updated_at?: Date | null
}
