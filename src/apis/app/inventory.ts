'use server'
import { createClient } from '@/utils/supabase/server'
import { InventoryMovementWithProduct, InventoryStock, ResApi } from '@/types'

// type StockAlert = {
//   product_id: string
//   product_name: string
//   product_code: string
//   current_stock: number
//   min_stock: number
// }

/**
 * Instancia de Supabase en contexto de servidor
 */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

/**
 * Lista movimientos de inventario con filtros opcionales
 * @param filters - campos y valores a filtrar
 * @returns Promise<InventoryMovement[]>
 */
export async function getInventoryMovements({
  filters,
  sortBy = 'date',
  sortDirection = 'desc',
  page,
  pageSize
}: {
  page?: number
  pageSize?: number
  filters?: Record<string, string | number | string[] | undefined>
  sortBy: string
  sortDirection: 'asc' | 'desc'
}): Promise<ResApi<InventoryMovementWithProduct>> {
  const supabase = await getSupabase()
  const currentPage = page ?? 1
  const currentPageSize = pageSize ?? 10
  const from = (currentPage - 1) * currentPageSize
  const to = from + currentPageSize - 1

  // Columnas válidas para ordenar
  const validSortColumns = [
    'id',
    'date',
    'created_at',
    'quantity',
    'product_id'
  ]
  if (sortBy && !validSortColumns.includes(sortBy)) {
    throw new Error(`No se puede ordenar por la columna ${sortBy}`)
  }
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'date'

  let query = supabase
    .from('inventory_movements')
    .select(
      '*, product:products(name, code, description, brand:brands(*)), variant:product_variants(*)'
    )
    .range(from, to)
    .order(sortColumn, { ascending: sortDirection === 'asc' })

  // traer los atributos de los productos desde product_variant_attributes
  let queryWithAttributes = query.select(
    `
        *,
        variant:product_variants(
          *,
          attributes:product_variant_attributes(attribute_type, attribute_value)
        )
      `
  )

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'string') {
          query = query.ilike(key, `%${value}%`)
        } else {
          query = query.eq(key, value)
        }
      }
    })
  }

  query = query.order(sortColumn, { ascending: sortDirection === 'asc' })

  const { data, error, count } = await query
  if (error)
    return {
      data: [],
      page: currentPage,
      page_size: currentPageSize,
      total: 0,
      total_pages: 0
    }

  // Mapeamos los datos para agregar los detalles del producto
  const mappedData: InventoryMovementWithProduct[] = data.map(
    (item: InventoryMovementWithProduct) => ({
      ...item,
      product: item.product || {}, // Garantizamos que el producto exista
      variant: item.variant || null, // Aseguramos que el variant esté presente
      reference_type: item.reference_type || null,
      movement_date: item.movement_date || item.date, // Usamos 'movement_date' si está presente, si no, usamos 'date'
      movement_status: item.movement_status || 'completed', // Definimos un valor predeterminado para el estado
      movement_type: item.movement_type || null,
      
    }),
  )

  return {
    data: mappedData,
    page: currentPage,
    page_size: currentPageSize,
    total: count || 0,
    total_pages: Math.ceil((count || 0) / currentPageSize)
  }
}

//procedure get_product_totals
export async function getProductTotals(): Promise<ResApi<InventoryStock>> {
  const supabase = await getSupabase()

  const { data, error } = await supabase.rpc('get_product_stock').select('*')

  if (error) {
    return {
      data: [],
      page: 1,
      page_size: 0,
      total: 0,
      total_pages: 0
    }
  }

  return {
    data: data || [],
    page: 1,
    page_size: data ? data.length : 0,
    total: data ? data.length : 0,
    total_pages: 1
  }
}
