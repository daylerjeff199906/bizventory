import { z } from 'zod'

// Schema base para la información de la empresa
export const companyInfoSchema = z.object({
  id: z.string().uuid('ID debe ser un UUID válido'),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  legal_name: z
    .string()
    .min(2, 'La razón social debe tener al menos 2 caracteres')
    .max(200, 'La razón social no puede exceder 200 caracteres')
    .trim(),
  tax_number: z
    .string()
    .min(8, 'El número de documento debe tener al menos 8 caracteres')
    .max(20, 'El número de documento no puede exceder 20 caracteres')
    .regex(
      /^[A-Z0-9-]+$/,
      'El número de documento solo puede contener letras mayúsculas, números y guiones'
    )
    .trim(),
  address: z
    .string()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(500, 'La dirección no puede exceder 500 caracteres')
    .trim(),
  phone: z
    .string()
    .regex(
      /^[+]?[1-9][\d]{0,15}$/,
      'El teléfono debe ser un número válido (ej: +51987654321)'
    )
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  email: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  created_at: z.date().nullable().optional(),
  updated_at: z.date().nullable().optional()
})

// Schema para crear una nueva empresa (sin ID, created_at, updated_at)
export const createCompanySchema = companyInfoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

// Schema para actualizar una empresa (todos los campos opcionales excepto ID)
export const updateCompanySchema = companyInfoSchema
  .partial()
  .required({ id: true })

// Schema solo para los campos editables en el formulario
export const companyFormSchema = companyInfoSchema.pick({
  name: true,
  legal_name: true,
  tax_number: true,
  address: true,
  phone: true,
  email: true,
  logo_url: true
})

// Tipos derivados de los schemas
export type CompanyInfo = z.infer<typeof companyInfoSchema>
export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
export type CompanyFormData = z.infer<typeof companyFormSchema>

// Función helper para validar datos de empresa
export const validateCompanyData = (data: unknown) => {
  return companyInfoSchema.safeParse(data)
}

// Función helper para validar datos del formulario
export const validateCompanyForm = (data: unknown) => {
  return companyFormSchema.safeParse(data)
}
