import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres'),
  tags: z.array(z.string()).optional(),
  brand_id: z.string().optional(),
  code: z.string().optional(),
  price: z.coerce.number().min(0).default(0),
  discount_active: z.boolean().default(false),
  discount_value: z.coerce.number().min(0).default(0),
  images: z.array(z.string()).max(5, 'Máximo 5 imágenes por producto').optional().default([])
})

export const editProductSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.'
  }),
  code: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().min(1, {
    message: 'La unidad es requerida.'
  }),
  location: z.string().optional(),
  is_active: z.boolean(),
  tags: z.array(z.string().min(1)).optional(),
  brand_id: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  discount_active: z.boolean().optional(),
  discount_value: z.coerce.number().min(0).optional(),
  images: z.array(z.string()).max(5).optional()
})

export const createProductSchema = productSchema

export type CreateProductData = z.infer<typeof createProductSchema>
export type EditProductData = z.infer<typeof editProductSchema>
