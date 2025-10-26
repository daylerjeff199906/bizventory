import { z } from 'zod'

export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// Esquema para la tabla businesses
export const businessSchema = z.object({
  id: z.string().optional(),
  business_name: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
  business_type: z.string().min(1, 'Selecciona el tipo de empresa'),
  description: z.string().optional(),
  business_email: z.string().email('Ingresa un correo electrónico válido'),
  document_number: z.string().optional(),
  brand: z.string().optional().nullable(),
  acronym: z.string().optional(),
  cover_image_url: z.string().optional(),
  map_iframe_url: z.string().optional().nullable(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  documents: z.any().optional(), // jsonb field
  validation_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  status: z.enum([BusinessStatus.ACTIVE, BusinessStatus.INACTIVE]).optional()
})

// Esquema para el formulario de búsqueda
export const searchBusinessSchema = z.object({
  search_term: z.string().min(2, 'Ingresa al menos 2 caracteres para buscar')
})

export const businessSearchResultSchema = z.object({
  id: z.string().uuid(),
  business_name: z.string(),
  business_type: z.string(),
  contact_email: z.string().email(),
  description: z.string().optional(),
  validation_status: z.enum(['pending', 'approved', 'rejected'])
})

export const registrationRequestSchema = z.object({
  id: z.string().optional(),
  business_name: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
  business_type: z.string().min(1, 'Selecciona el tipo de empresa'),
  contact_email: z.string().email('Ingresa un correo electrónico válido'),
  contact_phone: z.string().optional(),
  contact_person: z
    .string()
    .min(2, 'El nombre de contacto debe tener al menos 2 caracteres')
    .optional(),
  documents: z.any().optional(),
  request_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  business_uuid: z.string().optional()
})

// Test schema
export const requestBusinessSchema = z.object({
  business_name: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
  business_type: z.string().min(1, 'Selecciona el tipo de empresa'),
  business_email: z.string().email('Ingresa un correo electrónico válido'),
  contact_phone: z.string().optional(),
  description: z
    .string()
    .min(2, 'La descripción debe tener al menos 2 caracteres')
    .optional(),
  contact_person: z
    .string()
    .min(2, 'El nombre de contacto debe tener al menos 2 caracteres'),
  contact_email: z.string().email('Ingresa un correo electrónico válido'),
  request_status: z.enum(['pending', 'approved', 'rejected']).optional()
})

export type BusinessForm = z.infer<typeof businessSchema>
export type SearchBusiness = z.infer<typeof searchBusinessSchema>
export type BusinessSearchResult = z.infer<typeof businessSearchResultSchema>
export type RegistrationBusinessForm = z.infer<typeof requestBusinessSchema>
export type RegistrationRequestForm = z.infer<typeof registrationRequestSchema>

// Tipos de empresa disponibles
export const businessTypes = [
  { value: 'universidad', label: 'Universidad' },
  { value: 'ong', label: 'ONG' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'gobierno', label: 'Institución Gubernamental' },
  { value: 'fundacion', label: 'Fundación' },
  { value: 'asociacion', label: 'Asociación' },
  { value: 'cooperativa', label: 'Cooperativa' },
  { value: 'grupo-independiente', label: 'Grupo Independiente' },
  { value: 'otro', label: 'Otro' }
] as const
