'use server'
import { getSupabase } from '@/services/core.supabase'

interface ProductVariantAttribute {
  id?: string
  attribute_type: string
  attribute_value: string
}

export interface ProductVariant {
  id?: string
  product_id?: string
  name: string
  description: string | null
  code: string
  created_at?: string
  updated_at?: string
  attributes?: ProductVariantAttribute[]
  is_active?: boolean
}

interface ProductVariantWithAttributes extends ProductVariant {
  product_variant_attributes?: ProductVariantAttribute[]
}

interface DatabaseProductVariant {
  id: string
  product_id: string
  name: string
  description: string | null
  code: string
  created_at: string
  updated_at: string
  is_active?: boolean
}

interface DatabaseProductVariantAttribute {
  id: string
  variant_id: string
  attribute_type: string
  attribute_value: string
  created_at: string
  updated_at: string
}

interface SupabaseResponse<T> {
  data: T | null
  error: unknown | null
}

// Función principal para manejar variantes de productos
async function manageProductVariants(
  productId: string,
  variantsData: ProductVariant[]
): Promise<SupabaseResponse<ProductVariant[]>> {
  try {
    const supabase = await getSupabase()

    // Obtener variantes existentes
    const {
      data: existingVariants,
      error: fetchError
    }: SupabaseResponse<ProductVariantWithAttributes[]> = await supabase
      .from('product_variants')
      .select(
        `
        *,
        product_variant_attributes (*)
      `
      )
      .eq('product_id', productId)

    if (fetchError) throw fetchError

    // Preparar datos para upsert
    const variantsToUpsert: Partial<DatabaseProductVariant>[] =
      variantsData.map((variant) => ({
        id: variant.id || undefined,
        product_id: productId,
        name: variant.name,
        description: variant.description,
        code: variant.code,
        is_active: true
      }))

    // Upsert de variantes
    const {
      data: createdVariants,
      error: variantsError
    }: SupabaseResponse<DatabaseProductVariant[]> = await supabase
      .from('product_variants')
      .upsert(variantsToUpsert, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()

    if (variantsError) throw variantsError

    if (!createdVariants) {
      throw new Error('No se pudieron crear/actualizar las variantes')
    }

    // Manejar atributos para cada variante
    for (let i = 0; i < variantsData.length; i++) {
      const variant = variantsData[i]
      const createdVariant = createdVariants[i]

      if (variant.attributes && createdVariant) {
        await manageVariantAttributes(createdVariant.id, variant.attributes)
      }
    }

    // Desactivar variantes que no están en la lista nueva
    const newVariantIds: string[] = variantsData
      .map((v) => v.id)
      .filter((id): id is string => !!id)

    const variantsToDeactivate: ProductVariantWithAttributes[] = (
      existingVariants || []
    ).filter((ev) => ev.id && !newVariantIds.includes(ev.id))

    if (variantsToDeactivate.length > 0) {
      const { error: deactivateError } = await supabase
        .from('product_variants')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in(
          'id',
          variantsToDeactivate.map((v) => v.id)
        )

      if (deactivateError) throw deactivateError
    }

    return { data: createdVariants as ProductVariant[], error: null }
  } catch (error) {
    console.error('Error managing product variants:', error)
    return { data: null, error }
  }
}

// Función para manejar atributos de variantes
async function manageVariantAttributes(
  variantId: string,
  attributes: ProductVariantAttribute[]
): Promise<SupabaseResponse<ProductVariantAttribute[]>> {
  try {
    const supabase = await getSupabase()

    // Obtener atributos existentes
    const {
      data: existingAttributes,
      error: fetchError
    }: SupabaseResponse<DatabaseProductVariantAttribute[]> = await supabase
      .from('product_variant_attributes')
      .select('*')
      .eq('variant_id', variantId)

    if (fetchError) throw fetchError

    // Preparar datos para upsert
    const attributesToUpsert: Partial<DatabaseProductVariantAttribute>[] =
      attributes.map((attr) => ({
        id: attr.id || undefined,
        variant_id: variantId,
        attribute_type: attr.attribute_type,
        attribute_value: attr.attribute_value
      }))

    // Upsert de atributos
    if (attributesToUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('product_variant_attributes')
        .upsert(attributesToUpsert, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (upsertError) throw upsertError
    }

    // Eliminar atributos que no están en la nueva lista
    const newAttributeIds: string[] = attributes
      .map((a) => a.id)
      .filter((id): id is string => !!id)

    const attributesToDelete: DatabaseProductVariantAttribute[] = (
      existingAttributes || []
    ).filter((ea) => ea.id && !newAttributeIds.includes(ea.id))

    if (attributesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('product_variant_attributes')
        .delete()
        .in(
          'id',
          attributesToDelete.map((a) => a.id)
        )

      if (deleteError) throw deleteError
    }

    return { data: attributes as ProductVariantAttribute[], error: null }
  } catch (error) {
    console.error('Error managing variant attributes:', error)
    return { data: null, error }
  }
}

// Función wrapper completa
export async function handleProductVariantsUpdate({
  productId,
  variantsData
}: {
  productId: string
  variantsData: ProductVariant[]
}): Promise<SupabaseResponse<ProductVariantWithAttributes[]>> {
  const supabase = await getSupabase()

  const result = await manageProductVariants(productId, variantsData)

  if (result.error) {
    console.error('Error completo:', result.error)
    return { data: null, error: result.error }
  }

  // Obtener los datos completos actualizados
  const {
    data: completeData,
    error: fetchError
  }: SupabaseResponse<ProductVariantWithAttributes[]> = await supabase
    .from('product_variants')
    .select(
      `
      *,
      product_variant_attributes (*)
    `
    )
    .eq('product_id', productId)
    .eq('is_active', true)

  console.log('Datos completos de variantes obtenidos:', completeData)
  console.log('Error al obtener datos completos:', fetchError)

  return { data: completeData, error: fetchError }
}
