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
  status?: 'pending' | 'completed' | 'cancelled' | null
  payment_status?: 'pending' | 'paid' | 'partially_paid' | 'cancelled' | null
  reference_number?: string | null
  notes?: string | null
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
  status?: 'pending' | 'completed' | 'cancelled' | null
  payment_status?: 'pending' | 'paid' | 'partially_paid' | 'cancelled' | null
  reference_number?: string | null
  notes?: string | null
}

// Tipos adicionales que necesitarás definir
export type ProductSelectionItem = {
  type: 'product' | 'variant'
  id: string
  fullName: string
  name: string
  brand: string | null
}

// code: string | null
// unit: string
// description: string | null
// variantName?: string
// variantAttributes?: Record<string, unknown> | null
// productId?: string // Solo para variantes
// originalVariantName?: string // Solo para variantes
// originalProductName?: string // Solo para variantes
