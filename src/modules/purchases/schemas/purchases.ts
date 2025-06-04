import { z } from 'zod'

export const PurchaseItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    purchase_id: z.string().uuid().nullable().optional(),
    product_id: z.string().uuid().optional(),
    product_variant_id: z.string().uuid().optional(),
    quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
    price: z.number().positive('El precio debe ser mayor a 0').max(99999999.99),
    code: z.string().optional(),
    bar_code: z.string().optional(),
    discount: z.number().min(0).max(100).optional(),
    variant_attributes: z.record(z.unknown()).optional(),
    original_variant_name: z.string().optional(),
    original_product_name: z.string().optional()
  })
  .refine((data) => data.product_id || data.product_variant_id, {
    message: 'Debe proporcionar un product_id o product_variant_id',
    path: ['product_id']
  })

// Esquema para el formulario (permite items vacíos)
export const PurchaseFormSchema = z.object({
  date: z.string(),
  supplier_id: z.string(),
  guide_number: z.string().optional(),
  reference_number: z.string().optional(),
  code: z.string().optional(),
  subtotal: z.number(),
  discount: z.number(), // NO .optional()
  tax_rate: z.number(),
  tax_amount: z.number(),
  total_amount: z.number(),
  status: z.enum(['draft', 'pending', 'completed', 'cancelled']),
  payment_status: z.enum(['pending', 'paid', 'partially_paid', 'cancelled']),
  notes: z.string().optional(),
  inventory_updated: z.boolean(),
  items: z.array(z.any()),
  updated_at: z.string().optional()
})

// Esquema para validación final (requiere al menos 1 item)
export const PurchaseSchema = PurchaseFormSchema.extend({
  items: z.array(PurchaseItemSchema).min(1, 'Debe agregar al menos un producto')
})

export type PurchaseItem = z.infer<typeof PurchaseItemSchema> & {
  product?: {
    id: string
    name: string
    unit: string
    brand: string | null
    description: string | null
  }
  variant?: {
    id: string
    name: string
    attributes: Record<string, unknown>
  }
}

export type Purchase = z.infer<typeof PurchaseSchema> & {
  supplier?: {
    id: string
    name: string
  }
}

export type CreatePurchaseData = z.infer<typeof PurchaseSchema>
export type PurchaseFormData = z.infer<typeof PurchaseFormSchema>
