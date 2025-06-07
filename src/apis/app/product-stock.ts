// products.ts
'use server'
import { createClient } from '@/utils/supabase/server'

// Type definitions for combined results
export interface CombinedResultPrice {
  id: string
  name: string
  description: string | null
  code: string
  category_id: number | null
  unit: string
  brand_id: string | null
  brand?: {
    id: string
    name: string
  } | null
  location: string | null
  created_at: string
  is_active: boolean
  has_variants: boolean
  tags: string[] | null
  updated_at: string | null
  stock: number // Calculated stock based on inventory movements
  variant_id?: string // Only for variants, not products
  variant_name?: string // Only for variants, not products
  variant_description?: string | null // Only for variants, not products
  variant_code?: string // Only for variants, not products
  attributes?: { attribute_type: string; attribute_value: string }[] // Variant attributes if applicable
  is_variant?: boolean // Flag to indicate if this is a variant or a product itself
}
// Type definitions for database entities
interface ProductVariantAttribute {
  attribute_type: string
  attribute_value: string
}

interface ProductVariant {
  id: string
  name: string
  description: string | null
  code: string
  product_id: string
  product_variant_attributes?: ProductVariantAttribute[]
}

interface Brand {
  id: string
  name: string
  // Add other brand properties as needed
}

interface Product {
  id: string
  name: string
  description: string | null
  code: string
  category_id: number | null
  unit: string
  brand_id: string | null
  brand?: Brand
  location: string | null
  created_at: string
  is_active: boolean
  has_variants: boolean
  tags: string[] | null
  updated_at: string | null
  product_variants?: ProductVariant[]
}

interface InventoryMovement {
  product_id: string
  product_variant_id: string | null
  quantity: number
  movement_type: 'entrada' | 'salida'
}

// Filter and pagination types
interface QueryFilters {
  category_id?: number
  brand_id?: string
  is_active?: boolean
  min_stock?: number
  max_stock?: number
}

interface PaginationParams {
  page?: number
  pageSize?: number
}

interface QueryResult {
  data: CombinedResultPrice[]
  totalCount: number
}

async function getSupabase() {
  return createClient()
}

export async function getProductsAndVariantsWithStock(
  searchTerm: string = '',
  filters: QueryFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): Promise<QueryResult> {
  const supabase = await getSupabase()
  const { page = 1, pageSize = 10 } = pagination
  const offset = (page - 1) * pageSize

  try {
    // Base query for products with variants
    let query = supabase.from('products').select(
      `*, 
       brand:brand_id(*), 
       product_variants (
         id, name, description, code, product_id, 
         product_variant_attributes (attribute_type, attribute_value)
       )`,
      { count: 'exact' }
    )

    // Apply search filter
    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`
      )
    }

    // Apply additional filters
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.brand_id) {
      query = query.eq('brand_id', filters.brand_id)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    // Get paginated results
    const {
      data: products,
      count,
      error
    } = await query
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!products || products.length === 0) {
      return { data: [], totalCount: 0 }
    }

    // Type guard for Product array
    const typedProducts = products as Product[]

    // Get all relevant IDs for stock calculation
    const productIds = typedProducts.map((p: Product) => p.id)
    const variantIds = typedProducts.flatMap(
      (p: Product) => p.product_variants?.map((v: ProductVariant) => v.id) ?? []
    )

    // Fetch inventory movements in single query
    const { data: movements, error: movementsError } = await supabase
      .from('inventory_movements')
      .select('product_id, product_variant_id, quantity, movement_type')
      .in('product_id', productIds)
      .in('product_variant_id', variantIds)

    if (movementsError) throw movementsError

    // Create stock lookup map for performance
    const stockMap = new Map<string, number>()
    movements?.forEach((movement: InventoryMovement) => {
      const key = movement.product_variant_id
        ? `variant:${movement.product_variant_id}`
        : `product:${movement.product_id}`

      const current = stockMap.get(key) ?? 0
      const adjustment =
        movement.movement_type === 'entrada'
          ? movement.quantity
          : -movement.quantity

      stockMap.set(key, current + adjustment)
    })

    // Transform results - return either product OR its variants
    const results: CombinedResultPrice[] = typedProducts.flatMap(
      (product: Product) => {
        const baseData = {
          ...product,
          brand: product.brand || null,
          is_variant: false
        }

        // If product has variants, return only variants
        if (product.has_variants && product.product_variants?.length) {
          return product.product_variants.map((variant: ProductVariant) => ({
            ...baseData,
            id: product.id, // keep product id for reference
            variant_id: variant.id,
            variant_name: variant.name,
            variant_description: variant.description,
            variant_code: variant.code,
            attributes: variant.product_variant_attributes,
            stock: stockMap.get(`variant:${variant.id}`) ?? 0,
            is_variant: true
          }))
        }

        // If no variants, return the product itself
        return {
          ...baseData,
          stock: stockMap.get(`product:${product.id}`) ?? 0
        }
      }
    )

    // Apply stock filters if specified
    const filteredResults = results.filter((item: CombinedResultPrice) => {
      const stock = item.stock ?? 0
      if (filters.min_stock !== undefined && stock < filters.min_stock) {
        return false
      }
      if (filters.max_stock !== undefined && stock > filters.max_stock) {
        return false
      }
      return true
    })

    return {
      data: filteredResults.slice(0, pageSize),
      totalCount: count || 0
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { data: [], totalCount: 0 }
  }
}
