import { z } from 'zod'

export const personSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  whatsapp: z
    .string()
    .min(9, 'El número de WhatsApp debe tener al menos 9 caracteres'),
  secondary_phone: z
    .string()
    .min(9, 'El teléfono secundario debe tener al menos 9 caracteres'),
  email: z.string().email('El email no es válido'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  country: z.string().min(2, 'El país es requerido'),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

export type PersonType = z.infer<typeof personSchema>
