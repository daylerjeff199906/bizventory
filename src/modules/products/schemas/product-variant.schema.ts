import { z } from 'zod'

export const productVariantAttributeSchema = z.object({
  id: z.string().optional(),
  variant_id: z.string().optional(),
  attribute_type: z.string().min(1, 'El tipo de atributo es obligatorio'),
  attribute_value: z.string().min(1, 'El valor del atributo es obligatorio')
})

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  price: z.coerce.number().min(0),
  attributes: z.array(productVariantAttributeSchema),
  images: z.array(z.string()).max(3, 'Máximo 3 imágenes por variante')
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
