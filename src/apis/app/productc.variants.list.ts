// products.ts
// Añade estas funciones a tu archivo existente
'use server'
import { ProductDetails, ProductVariant } from '@/types'
import { createClient } from '@/utils/supabase/server'

/**
 * Instancia de Supabase en contexto de servidor
 */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

/**
 * Obtiene productos y sus variantes para selección en compras
 * @param searchTerm - Término de búsqueda (nombre o código)
 * @param limit - Límite de resultados
 * @returns Promise<Array<ProductSelectionItem>>
 */

interface VariantAttribute {
  attribute_type: string
  attribute_value: string
}

export interface ProductVariantItem {
  id: string
  name: string
  description: string | null
  code: string
  attributes: VariantAttribute[]
}

export interface CombinedResult extends ProductDetails {
  variants?: ProductVariantItem[]
}

export interface CombinedResultPrice extends CombinedResult {
  price?: number
  discount?: number
  temp_id?: string // ID temporal para gestión local
}

export interface CombinedResultExtended extends CombinedResult {
  quantity?: number
  price?: number
  bar_code?: string
  discount?: number
  original_product_name?: string | null
  original_variant_name?: string | null
}
export interface CombinedResultExtendedSales extends CombinedResult {
  quantity?: number
  unit_price?: number
  discount_amount?: number
  total_price?: number
}

export async function getProductsAndVariantsForPurchase({
  businessId,
  searchTerm = '',
  limit = 10
}: {
  businessId?: string
  searchTerm?: string
  limit?: number
}): Promise<CombinedResult[]> {
  const supabase = await getSupabase()

  // Primero obtener las marcas del negocio
  const { data: businessBrands } = await supabase
    .from('brands')
    .select('id')
    .eq('business_id', businessId)

  const brandIds = businessBrands?.map((brand) => brand.id) || []

  // Luego obtener productos de esas marcas
  const { data: productsWithoutVariants } = await supabase
    .from('products')
    .select('*, brand:brand_id(*)')
    .in('brand_id', brandIds)
    .or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`
    )
    .limit(limit)

  // Obtener IDs de productos del negocio para usar en la consulta de variantes
  const businessProductIds =
    productsWithoutVariants?.map((product) => product.id) || []

  // Obtener variantes de productos del negocio
  let productsWithVariants: ProductVariant[] | null = []

  if (businessProductIds.length > 0) {
    const { data, error } = await supabase
      .from('product_variants')
      .select(
        `
      *,
      product:product_id(
        *,
        brand:brand_id(*)
      ),
      product_variant_attributes:product_variant_attributes(
        attribute_type,
        attribute_value
      )
    `
      )
      // .in('product_id', businessProductIds)
      .eq('product.brand.business_id', businessId)
      .or(`product_id.in.(${businessProductIds.join(',')})`)

    if (error) {
      console.error('Error fetching variants:', error)
      productsWithVariants = []
    } else {
      productsWithVariants = data as ProductVariant[]
    }
  } else {
    productsWithVariants = []
  }

  // Combine results with proper typing
  const combinedResults: CombinedResult[] =
    productsWithoutVariants?.map((product) => ({
      ...product,

      variants: productsWithVariants
        .filter((variant) => variant.product_id === product.id)
        .map((variant) => ({
          id: variant.id,
          name: variant.name,
          description: variant.description,
          code: variant.code,
          attributes: variant.attributes
        }))
    })) || []

  return combinedResults
}
