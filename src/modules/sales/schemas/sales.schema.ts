import { z } from 'zod'

export const saleItemSchema = z.object({
  temp_id: z.string().optional(),
  product_id: z.string().min(1, 'ID del producto es requerido'),
  variant_id: z.string().optional(),
  product_name: z.string().min(1, 'Nombre del producto es requerido'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  unit_price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  discount_amount: z.number().min(0, 'El descuento debe ser mayor o igual a 0'),
  total_price: z.number().min(0, 'El total debe ser mayor o igual a 0')
})

export const saleFormSchema = z.object({
  // currency: z.enum(['PEN', 'USD'], {
  //   required_error: 'Selecciona una moneda'
  // }),
  currency: z.string().min(1, 'Selecciona una moneda').optional(),
  reference_number: z.string().min(1, 'El número de referencia es requerido'),
  payment_method: z.string().min(1, 'Selecciona un método de pago'),
  shipping_address: z.string().optional(),
  tax_rate: z.number().min(0).max(1, 'La tasa de IGV debe estar entre 0 y 1'),
  date: z.string().min(1, 'La fecha es requerida'),
  items: z.array(saleItemSchema).optional()
  // tax_exempt: z.boolean(),
})

export type SaleFormValues = z.infer<typeof saleFormSchema>
export type SaleItemValues = z.infer<typeof saleItemSchema>
