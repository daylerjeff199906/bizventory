'use server'
import { createClient } from '@/utils/supabase/server'
import { InventoryMovementWithProduct, InventoryStock, ResApi } from '@/types'

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
  pageSize,
  businessId
}: {
  businessId?: string
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

  const validSortColumns = [
    'id',
    'date',
    'created_at',
    'quantity',
    'product_id'
  ]
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'date'

  let query = supabase
    .from('inventory_movements')
    .select(
      `
      *,
      product:products(id, name, code, description, brand:brands(*)),
      variant:product_variants(
        *,
        attributes:product_variant_attributes(attribute_type, attribute_value)
      )
    `,
      { count: 'exact' }
    )
    .order(sortColumn, { ascending: sortDirection === 'asc' })

  if (businessId) {
    query = query.eq('business_id', businessId)
  }


  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
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
    }
  }

  query = query.range(from, to)

  const { data, error, count } = await query

  if (error || !data) {
    console.error(error)
    return {
      data: [],
      page: currentPage,
      page_size: currentPageSize,
      total: 0,
      total_pages: 0
    }
  }

  const mappedData: InventoryMovementWithProduct[] = data.map((item) => ({
    ...item,
    product: item.product || null,
    variant: item.variant || null,
    reference_type: item.reference_type || null,
    movement_date: item.movement_date || item.date,
    movement_status: item.movement_status || 'completed',
    movement_type: item.movement_type || null
  }))

  return {
    data: mappedData,
    page: currentPage,
    page_size: currentPageSize,
    total: count || 0,
    total_pages: Math.ceil((count || 0) / currentPageSize)
  }
}

//procedure get_product_totals
export async function getFullProductStock(): Promise<InventoryStock[]> {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .rpc('get_full_product_stock')
    .select('*')

  if (error) {
    console.error('Error fetching product stock:', error)
    return []
  }

  return data || []
}
