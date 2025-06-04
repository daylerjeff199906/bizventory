import { z } from 'zod'

export const productVariantAttributeSchema = z.object({
  attribute_type: z.string().min(1, 'El tipo de atributo es obligatorio'),
  attribute_value: z.string().min(1, 'El valor del atributo es obligatorio')
})

export const productVariantSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  code: z.string().min(1, 'El código es obligatorio'),
  attributes: z.array(productVariantAttributeSchema)
})

export const productVariantsSchema = z.array(productVariantSchema)

export type ProductVariantAttributeData = z.infer<
  typeof productVariantAttributeSchema
>
export type ProductVariantData = z.infer<typeof productVariantSchema>
export type ProductVariantsData = z.infer<typeof productVariantsSchema>

// Tipos de atributos predefinidos
export const ATTRIBUTE_TYPES = {
  flavor: 'Sabor',
  scent: 'Aroma',
  color: 'Color',
  size: 'Tamaño',
  size_label: 'Talla',
  clothing_size: 'Talla de ropa',
  dimensions: 'Dimensiones',
  capacity: 'Capacidad',
  resolution: 'Resolución',
  power: 'Potencia',
  material: 'Material',
  style: 'Estilo',
  packaging: 'Presentación',
  language: 'Idioma',
  region: 'Región',
  compatibility: 'Compatibilidad'
} as const

export type AttributeType = keyof typeof ATTRIBUTE_TYPES
