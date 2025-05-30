import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres'),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  code: z.string().optional(),
  images: z.array(z.string()).optional()
})

export const createProductSchema = productSchema

export type CreateProductData = z.infer<typeof createProductSchema>
