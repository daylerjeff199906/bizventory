import { z } from 'zod'

export const PurchaseItemSchema = z.object({
  id: z.string().uuid().optional(),
  purchase_id: z.string().uuid().nullable(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  price: z.number().positive('El precio debe ser mayor a 0').max(99999999.99),
  code: z.string().optional(),
  discount: z.number().min(0).max(99999999.99).optional(),
  bar_code: z.string().optional()
})

export const PurchaseSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().optional(),
  date: z
    .string()
    .refine((value) => !isNaN(Date.parse(value)), 'Fecha inválida'),
  supplier_id: z.string().uuid('Debe seleccionar un proveedor'),
  guide_number: z.string().optional(),
  subtotal: z.number().min(0).max(99999999.99),
  discount: z.number().min(0).max(99999999.99).optional(),
  tax_rate: z.number().min(0).max(100).optional(), // IGV en porcentaje
  tax_amount: z.number().min(0).max(99999999.99).optional(),
  total_amount: z.number().positive().max(99999999.99),
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
}

export type CreatePurchaseData = z.infer<typeof PurchaseSchema>
