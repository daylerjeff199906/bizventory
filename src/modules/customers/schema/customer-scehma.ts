import { z } from 'zod'

export const customerSchema = z.object({
  person_id: z.string().min(1, 'El ID de la persona es requerido')
})

export const createCustomerSchema = customerSchema

export const updateCustomerSchema = customerSchema.extend({
  updated_at: z.string()
})

export type CreateCustomerData = z.infer<typeof createCustomerSchema>
export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>
