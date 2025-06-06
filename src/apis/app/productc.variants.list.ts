// products.ts
// Añade estas funciones a tu archivo existente
'use server'
import { Product, ProductDetails, ProductVariant } from '@/types'
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

export interface CombinedResult extends ProductDetails {
  variant_id?: string
  variant_name?: string
  variant_description?: string | null
  variant_code?: string
  attributes?: VariantAttribute[]
}

export interface CombinedResultExtended extends CombinedResult {
  quantity?: number
  price?: number
  bar_code?: string
  discount?: number
}

export async function getProductsAndVariantsForPurchase(
  searchTerm: string,
  limit: number = 10
): Promise<CombinedResult[]> {
  const supabase = await getSupabase()

  // Fetch products without variants
  const { data: productsWithoutVariants } = await supabase
    .from('products')
    .select('*, brand:brand_id(*)')
    .eq('has_variants', false)
    .or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`
    )
    .limit(limit)

  // Fetch products with variants
  const { data: productsWithVariants } = await supabase
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
    .or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`
    )
    .limit(limit)

  // Combine results with proper typing
  const combinedResults: CombinedResult[] = [
    ...((productsWithoutVariants || []) as Product[]),
    ...(productsWithVariants || ([] as ProductVariant[])).map((variant) => ({
      ...variant.product,
      is_variant: true,
      variant_id: variant.id,
      variant_name: variant.name,
      variant_description: variant.description,
      variant_code: variant.code,
      attributes: variant.product_variant_attributes
    }))
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit)

  return combinedResults
}

// /**
//  * Obtiene un producto o variante por ID para compras
//  * @param id - ID del producto o variante
//  * @param type - 'product' o 'variant'
//  */
// export async function getProductOrVariantForPurchase(
//   id: string,
//   type: 'product' | 'variant'
// ): Promise<PurchaseItem | null> {
//   const supabase = await getSupabase()

//   if (type === 'product') {
//     const { data: product, error } = await supabase
//       .from('products')
//       .select('id, name, code, unit, brand:brands(name), description, price')
//       .eq('id', id)
//       .single()

//     if (error || !product) return null

//     return {
//       product_id: product.id,
//       quantity: 1,
//       price: product.price || 0,
//       code: product.code,
//       original_product_name: product.name,
//       product: {
//         id: product.id,
//         name: product.name,
//         unit: product.unit,
//         brand: product.brand?.name || null,
//         description: product.description || null
//       }
//     }
//   } else {
//     const { data: variant, error } = await supabase
//       .from('product_variants')
//       .select(
//         `
//         id,
//         name,
//         attributes,
//         price,
//         product:products(id, name, code, unit, brand:brands(name), description
//       `
//       )
//       .eq('id', id)
//       .single()

//     if (error || !variant) return null

//     return {
//       product_variant_id: variant.id,
//       variant_attributes: variant.attributes,
//       quantity: 1,
//       price: variant.price || 0,
//       code: variant.product.code,
//       original_variant_name: variant.name,
//       original_product_name: variant.product.name,
//       product: {
//         id: variant.product.id,
//         name: variant.product.name,
//         unit: variant.product.unit,
//         brand: variant.product.brand?.name || null,
//         description: variant.product.description || null
//       },
//       variant: {
//         id: variant.id,
//         name: variant.name,
//         attributes: variant.attributes
//       }
//     }
//   }
// }
