import { z } from 'zod'
export const saleItemSchema = z.object({
  code: z.string().optional(),
  product_id: z.string().min(1, 'ID del producto es requerido'),
  variant_id: z.string().optional(),
  product_name: z.string().optional(),
  product_description: z.string().nullable(),
  variant_name: z.string().optional(),
  attributes: z
    .array(
      z.object({
        attribute_type: z.string(),
        attribute_value: z.string()
      })
    )
    .optional(),
  unit: z.string().optional(),
  brand: z
    .object({
      id: z.string(),
      name: z.string()
    })
    .optional(),
  stock: z.number().optional(),
  _temp_id: z.string().optional(),
  price_unit: z.number().optional(),
  subtotal: z.number().optional(),
  quantity: z.number().optional(),
  discount: z.number().optional(),
  image_url: z.string().optional().nullable()
})

export const saleFormSchema = z.object({
  currency: z.string().min(1, 'Selecciona una moneda').optional(),
  payment_method: z.string().min(1, 'Selecciona un método de pago'),
  shipping_address: z.string().optional(),
  tax_rate: z.number().min(0).max(1, 'La tasa de IGV debe estar entre 0 y 1'),
  date: z.string().min(1, 'La fecha es requerida'),
  items: z.array(saleItemSchema).optional(),
  status: z.string().optional(),
  customer_id: z.string().optional()
})

// Schema for validation
export const SaleSchema = z.object({
  business_id: z.string().uuid(),
  date: z.string().min(1, 'Date is required'),
  customer_id: z.string().nullable(),
  status: z.string().default('pending'),
  payment_method: z.string().nullable(),
  shipping_address: z.string().nullable(),
  tax_amount: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  total_items: z.number().min(1).default(1),
  total_amount: z.number().min(0),
  salesperson_id: z.string().nullable()
})

export const itemSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  product_variant_id: z.string().nullable(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be at least 0'),
  discount_amount: z.number().min(0, 'Discount amount must be at least 0'),
  total_price: z.number().min(0, 'Total price must be at least 0')
})

export type SaleFormValues = z.infer<typeof saleFormSchema>
export type SaleItemValues = z.infer<typeof saleItemSchema>

export type SaleValues = z.infer<typeof SaleSchema>
export type ItemValues = z.infer<typeof itemSchema>
