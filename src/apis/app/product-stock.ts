'use server'
import { VariantAttributeType } from '@/modules/purchases'
import { Brand } from '@/types'
import { createClient } from '@/utils/supabase/server'

// Tipos para variantes de producto
export interface ProductVariant {
  id: string
  product_id: string
  name: string
  description: string | null
  code: string
  created_at: string
  updated_at: string | null
  attributes?: VariantAttributeType[]
  stock?: number // Calculado dinámicamente
  price_unit?: number
  subtotal?: number // Para manejo de UI
}

// Tipos para productos principales
export interface Product {
  id: string
  name: string
  description: string | null
  code: string
  category_id: number | null
  unit: string
  brand: Brand
  location: string | null
  created_at: string
  is_active: boolean
  has_variants: boolean
  tags: string[] | null
  updated_at: string | null
  variants?: ProductVariant[] // Solo si has_variants = true
  stock?: number // Calculado dinámicamente (solo si no tiene variantes)
  price_unit?: number
  subtotal?: number // Para manejo de UI
}

// Tipos para la respuesta
export interface ProductListResponse {
  data: Product[]
  total_items: number
  total_pages: number
}

export interface GetProductsWithVariantsAndStockProps {
  searchQuery?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

async function getSupabase() {
  return createClient()
}

export async function getProductsWithVariantsAndStock({
  searchQuery = '',
  page = 1,
  pageSize = 20,
  sortBy = 'name',
  sortOrder = 'asc'
}: GetProductsWithVariantsAndStockProps): Promise<ProductListResponse> {
  const supabase = await getSupabase()
  const offset = (page - 1) * pageSize

  try {
    // 1. Obtener productos principales
    let productsQuery = supabase
      .from('products')
      .select('*, brand:brands(*)', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + pageSize - 1)

    // Aplicar filtro de búsqueda en productos principales
    if (searchQuery) {
      productsQuery = productsQuery.or(
        `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`
      )
    }

    const { data: products, count, error: productsError } = await productsQuery

    if (productsError) throw productsError
    if (!products || products.length === 0) {
      return {
        data: [],
        total_items: 0,
        total_pages: 0
      }
    }

    // 2. Obtener variantes para los productos encontrados
    const productIds = products.map((p) => p.id)
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .in('product_id', productIds)

    if (variantsError) throw variantsError

    // 3. Obtener atributos para las variantes
    const variantIds = variants?.map((v) => v.id) || []
    const { data: variantAttributes, error: attributesError } = await supabase
      .from('product_variant_attributes')
      .select('*')
      .in('variant_id', variantIds)
    console.log(variantAttributes, attributesError)

    if (attributesError) throw attributesError

    // 4. Obtener movimientos de inventario para productos y variantes
    const { data: movements, error: movementsError } = await supabase
      .from('inventory_movements')
      .select('product_id, product_variant_id, quantity, movement_type')
      .or(
        `product_id.in.(${productIds.join(
          ','
        )}),product_variant_id.in.(${variantIds.join(',')})`
      )

    if (movementsError) throw movementsError

    // 5. Calcular stocks
    const stockMap = new Map<string, number>()

    movements?.forEach((movement) => {
      const key = movement.product_variant_id
        ? `variant:${movement.product_variant_id}`
        : `product:${movement.product_id}`
      const adjustment =
        movement.movement_type === 'entry'
          ? movement.quantity
          : -movement.quantity
      stockMap.set(key, (stockMap.get(key) || 0) + adjustment)
    })

    // 6. Combinar datos
    const processedProducts = products.map((product) => {
      // Obtener variantes para este producto
      const productVariants =
        variants?.filter((v) => v.product_id === product.id) || []

      // Si tiene variantes, calcular stock para cada una y añadir atributos
      if (product.has_variants && productVariants.length > 0) {
        const variantsWithStockAndAttributes = productVariants.map(
          (variant) => {
            const attributes = variantAttributes
              ?.filter((attr) => attr.variant_id === variant.id)
              .map((attr) => ({
                attribute_type: attr.attribute_type,
                attribute_value: attr.attribute_value
              }))

            return {
              ...variant,
              stock: stockMap.get(`variant:${variant.id}`) || 0,
              attributes: attributes || []
            }
          }
        )

        return {
          ...product,
          variants: variantsWithStockAndAttributes,
          stock: 0 // Producto padre con variantes tiene stock 0
        }
      }

      // Si no tiene variantes, usar stock del producto
      return {
        ...product,
        stock: stockMap.get(`product:${product.id}`) || 0,
        variants: undefined
      }
    })

    // 7. Filtrar por búsqueda en variantes si es necesario
    const filteredProducts = searchQuery
      ? processedProducts.filter((product) => {
          // Si coincide con el producto principal, mantenerlo
          if (
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            product.code.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            return true
          }

          // Si tiene variantes que coincidan, mantenerlo
          if (
            product.variants?.some(
              (variant: ProductVariant) =>
                variant.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                variant.description
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                variant.code.toLowerCase().includes(searchQuery.toLowerCase())
            )
          ) {
            return true
          }

          return false
        })
      : processedProducts

    return {
      data: filteredProducts,
      total_items: count || 0,
      total_pages: Math.ceil((count || 0) / pageSize)
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      data: [],
      total_items: 0,
      total_pages: 0
    }
  }
}
