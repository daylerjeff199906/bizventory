import { z } from 'zod'
import { StatusItems } from '@/types'

// Enum para el estado
export const StatusItemsSchema = z.enum([
  StatusItems.ACTIVE,
  StatusItems.INACTIVE,
  StatusItems.DELETED
])

// Schema para crear una marca
export const CreateBrandSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(255, 'El nombre es muy largo'),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
  status: StatusItemsSchema
})

// Schema para actualizar una marca
export const UpdateBrandSchema = CreateBrandSchema.partial().extend({
  id: z.string().uuid('ID inválido')
})

// Schema completo de la marca
export const BrandSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  name: z.string().nullable(),
  updated_at: z.string().datetime().nullable(),
  logo_url: z.string().nullable(),
  status: StatusItemsSchema.nullable()
})

export type CreateBrand = z.infer<typeof CreateBrandSchema>
export type UpdateBrand = z.infer<typeof UpdateBrandSchema>
