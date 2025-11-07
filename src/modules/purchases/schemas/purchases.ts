import { z } from 'zod'

export const VariantAttributeSchema = z.object({
  attribute_type: z.string(),
  attribute_value: z.string()
})

export const PurchaseItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    purchase_id: z.string().uuid().nullable().optional(),
    product_id: z.string().uuid().nullable().optional(),
    product_variant_id: z.string().uuid().nullable().optional(),
    quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
    price: z.number().positive('El precio debe ser mayor a 0').max(99999999.99),
    bar_code: z.string().nullable().optional(),
    discount: z.number().min(0).max(100).nullable().optional(),
    variant_attributes: z.array(VariantAttributeSchema).nullable().optional(),
    original_variant_name: z.string().nullable().optional(),
    original_product_name: z.string().nullable().optional()
  })
  .refine(
    (data) => data.product_id !== null || data.product_variant_id !== null,
    {
      message: 'Debe proporcionar un product_id o product_variant_id',
      path: ['product_id']
    }
  )

export type StatusPurchase = 
  | 'draft'
  | 'pending'
  | 'completed'
  | 'cancelled' 

export enum StatusPurchaseEnum {
    DRAFT = 'draft',
    PENDING = 'pending',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export type PaymentStatusPurchase = 
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'cancelled'

  export enum PaymentStatusPurchaseEnum {
    PENDING = 'pending',
    PAID = 'paid',
    PARTIALLY_PAID = 'partially_paid',
    CANCELLED = 'cancelled'
}

export enum PurchaseMovementTypeEnum {
    ENTRY = 'entry',
    EXIT = 'exit',
    PURCHASE = 'purchase',
    SALE = 'sale',
    PURCHASE_RETURN = 'purchase_return'
}

// Esquema para el formulario (permite items vacíos)
export const PurchaseFormSchema = z.object({
  business_id: z.string(),
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
  _temp_id?: string // Para manejar IDs temporales en el frontend
  _index?: number // Para manejar el índice del item en el formulario
  // Información del producto/variante
  is_product_header?: boolean
  has_variants?: boolean
  variants_count?: number
  // Información del producto
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
    attributes: VariantAttributeType[]
  }
}

export type Purchase = z.infer<typeof PurchaseSchema> & {
  supplier: {
    id: string
    name: string
  }
}

export type CreatePurchaseData = z.infer<typeof PurchaseSchema>
export type PurchaseFormData = z.infer<typeof PurchaseFormSchema>
export type VariantAttributeType = z.infer<typeof VariantAttributeSchema>
