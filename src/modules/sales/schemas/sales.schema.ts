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
  discount: z.number().optional()
})

export const saleFormSchema = z.object({
  currency: z.string().min(1, 'Selecciona una moneda').optional(),
  reference_number: z.string().min(1, 'El número de referencia es requerido'),
  payment_method: z.string().min(1, 'Selecciona un método de pago'),
  shipping_address: z.string().optional(),
  tax_rate: z.number().min(0).max(1, 'La tasa de IGV debe estar entre 0 y 1'),
  date: z.string().min(1, 'La fecha es requerida'),
  items: z.array(saleItemSchema).optional()
})

export type SaleFormValues = z.infer<typeof saleFormSchema>
export type SaleItemValues = z.infer<typeof saleItemSchema>
