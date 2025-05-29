import { z } from 'zod'

export const supplierSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  contact: z.string().min(2, 'El contacto debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'El teléfono debe tener al menos 9 caracteres'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  currency: z.string().min(3, 'La moneda debe tener al menos 3 caracteres'),
  status: z.enum(['activo', 'inactivo', 'pendiente'], {
    required_error: 'Selecciona un estado'
  }),
  notes: z.string().optional(),
  company_type: z.string().min(2, 'El tipo de empresa es requerido'),
  document_type: z.string().min(2, 'El tipo de documento es requerido'),
  document_number: z
    .string()
    .min(5, 'El número de documento debe tener al menos 5 caracteres')
})

export const createSupplierSchema = supplierSchema

export const updateSupplierSchema = supplierSchema.extend({
  id: z.string(),
  updated_at: z.string()
})

export type CreateSupplierData = z.infer<typeof createSupplierSchema>
export type UpdateSupplierData = z.infer<typeof updateSupplierSchema>
