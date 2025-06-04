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

export const PurchaseSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().optional(),
  date: z
    .string()
    .refine((value) => !isNaN(Date.parse(value)), 'Fecha inválida'),
  supplier_id: z.string().uuid('Debe seleccionar un proveedor'),
  guide_number: z.string().optional(),
  reference_number: z.string().optional(),
  subtotal: z.number().min(0).max(99999999.99),
  discount: z.number().min(0).max(99999999.99).optional(),
  tax_rate: z.number().min(0).max(100).optional().default(18), // IGV en porcentaje
  tax_amount: z.number().min(0).max(99999999.99).optional().default(0),
  total_amount: z.number().min(0).max(99999999.99),
  status: z
    .enum(['draft', 'pending', 'completed', 'cancelled'])
    .optional()
    .default('draft'),
  payment_status: z
    .enum(['pending', 'partial', 'paid'])
    .optional()
    .default('pending'),
  notes: z.string().optional(),
  inventory_updated: z.boolean().optional().default(false),
  items: z
    .array(PurchaseItemSchema)
    .min(1, 'Debe agregar al menos un producto'),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
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
