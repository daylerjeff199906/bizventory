'use server'
import { APP_URLS } from '@/config/app-urls'
import { getSupabase } from '@/services/core.supabase'
import { revalidatePath } from 'next/cache'

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
        product_variant_attributes(*)
      `
      )
      .eq('product_id', productId)
    console.log('Variantes existentes obtenidas:', existingVariants)

    if (fetchError) throw fetchError

    // Preparar datos para upsert
    const variantsToUpsert: Partial<DatabaseProductVariant>[] =
      variantsData.map((variant) => {
        const variantData: Partial<DatabaseProductVariant> = {
          product_id: productId,
          name: variant.name,
          description: variant.description,
          code: variant.code,
          is_active: true
        }

        // Solo incluir el id si existe
        if (variant.id) {
          variantData.id = variant.id
        }

        return variantData
      })
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

    // Crear un mapa para encontrar las variantes creadas por código
    const createdVariantsMap = new Map(
      createdVariants.map((variant) => [variant.code, variant])
    )

    // Manejar atributos para cada variante usando el código como referencia
    for (const variant of variantsData) {
      const createdVariant = createdVariantsMap.get(variant.code)

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

    // Preparar datos para upsert - NO incluir id si es undefined
    const attributesToUpsert: Partial<DatabaseProductVariantAttribute>[] =
      attributes.map((attr) => {
        const attributeData: Partial<DatabaseProductVariantAttribute> = {
          variant_id: variantId,
          attribute_type: attr.attribute_type,
          attribute_value: attr.attribute_value
        }

        // Solo incluir el id si existe
        if (attr.id) {
          attributeData.id = attr.id
        }

        return attributeData
      })

    console.log('Atributos a upsert:', attributesToUpsert)

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
  businessUnitId,
  productId,
  variantsData
}: {
  businessUnitId: string
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
  revalidatePath(
    APP_URLS.ORGANIZATION.PRODUCTS.CREATE_VARIANT(businessUnitId, productId)
  )

  return { data: completeData, error: fetchError }
}
