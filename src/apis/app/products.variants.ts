// products.ts
// Servicio de funciones CRUD para la tabla 'products' usando Supabase en Server Components
'use server'
import { APP_URLS } from '@/config/app-urls'
import { ProductWithVariants } from '@/types'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function getSupabase() {
  const supabase = createClient()
  return supabase
}

// En tu archivo de API (/apis/app/product-variants.ts)

type CreateProductVariantsResponse = {
  data: { id: string; code: string }[] | null
  error: string | null
}

// Crear variantes de producto con atributos
export const createProductVariants = async ({
  businessId,
  productId,
  variants,
  revalidateUrl
}: {
  businessId: string
  productId: string
  variants: {
    name: string
    price: number
    attributes: {
      attribute_type: string
      attribute_value: string
    }[]
  }[]
  revalidateUrl?: string
}): Promise<CreateProductVariantsResponse> => {
  const supabase = await getSupabase()

  try {
    // Iniciar transacción
    const { data: createdVariants, error: variantsError } = await supabase
      .from('product_variants')
      .insert(
        variants.map((variant) => ({
          product_id: productId,
          name: variant.name,
          price: variant.price
        }))
      )
      .select('id, code')

    if (variantsError)
      return {
        data: null,
        error: variantsError.message || String(variantsError)
      }

    // Preparar atributos para todas las variantes
    const allAttributes = variants.flatMap((variant, index) => {
      return variant.attributes.map((attr) => ({
        variant_id: createdVariants[index].id,
        attribute_type: attr.attribute_type,
        attribute_value: attr.attribute_value
      }))
    })

    // Insertar atributos
    if (allAttributes.length > 0) {
      const { error: attributesError } = await supabase
        .from('product_variant_attributes')
        .insert(allAttributes)

      if (attributesError)
        return {
          data: null,
          error: attributesError.message || String(attributesError)
        }
    }
    revalidatePath(
      revalidateUrl ||
      APP_URLS.ORGANIZATION.PRODUCTS.CREATE_VARIANT(businessId, productId)
    )
    return {
      data: createdVariants,
      error: null
    }
  } catch (error) {
    console.error('Error creating variants:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      data: null,
      error: errorMessage
    }
  }
}

export const getProductWithVariants = async (
  productId: string
): Promise<ProductWithVariants> => {
  const supabase = await getSupabase()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (productError) throw productError

  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select(
      `
      *,
      attributes:product_variant_attributes(*)
    `
    )
    .eq('product_id', productId)
    .eq('is_active', true)

  if (variantsError) throw variantsError

  return {
    ...product,
    variants
  }
}
