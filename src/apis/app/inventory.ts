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
    .select('*, product:products(name, code, description)')
    .range(from, to)
    .order(sortColumn, { ascending: sortDirection === 'asc' })

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

  return {
    data: data || [],
    page: currentPage,
    page_size: currentPageSize,
    total: count || 0,
    total_pages: Math.ceil((count || 0) / currentPageSize)
  }
}

/**
 * Obtiene el stock actual de todos los productos
 * @param filters - filtros opcionales
 * @returns Promise<ProductStock[]>
 */
// export async function getProductsStock({
//   filters,
//   sortBy = 'current_stock',
//   sortDirection = 'asc',
//   page,
//   pageSize
// }: {
//   page?: number
//   pageSize?: number
//   filters?: {
//     product_id?: string
//     product_name?: string
//     product_code?: string
//     min_stock?: number
//     max_stock?: number
//   }
//   sortBy: string
//   sortDirection: 'asc' | 'desc'
// }): Promise<ResApi<ProductStock[]>> {
//   const supabase = await getSupabase()
//   const currentPage = page ?? 1
//   const currentPageSize = pageSize ?? 10
//   const from = (currentPage - 1) * currentPageSize
//   const to = from + currentPageSize - 1

//   // Columnas válidas para ordenar
//   const validSortColumns = [
//     'product_id',
//     'product_name',
//     'product_code',
//     'current_stock'
//   ]
//   if (sortBy && !validSortColumns.includes(sortBy)) {
//     throw new Error(`No se puede ordenar por la columna ${sortBy}`)
//   }

//   // Consulta para calcular el stock actual (suma de movimientos)
//   let query = supabase
//     .from('products')
//     .select(
//       'id as product_id, name as product_name, code as product_code, inventory_movements!inner(quantity)',
//       { count: 'exact' }
//     )
//     .range(from, to)

//   // Aplicar filtros
//   if (filters) {
//     if (filters.product_id) {
//       query = query.eq('id', filters.product_id)
//     }
//     if (filters.product_name) {
//       query = query.ilike('name', `%${filters.product_name}%`)
//     }
//     if (filters.product_code) {
//       query = query.ilike('code', `%${filters.product_code}%`)
//     }
//   }

//   const { data, error, count } = await query

//   if (error) throw error

//   // Calcular el stock actual para cada producto
//   const stocks = (data || []).map((product) => ({
//     product_id: product.product_id,
//     product_name: product.product_name,
//     product_code: product.product_code,
//     current_stock: product.inventory_movements.reduce(
//       (sum, movement) => sum + movement.quantity,
//       0
//     )
//   }))

//   // Aplicar filtros de stock después del cálculo
//   const filteredStocks = stocks.filter((stock) => {
//     if (!filters) return true
//     if (
//       filters.min_stock !== undefined &&
//       stock.current_stock < filters.min_stock
//     )
//       return false
//     if (
//       filters.max_stock !== undefined &&
//       stock.current_stock > filters.max_stock
//     )
//       return false
//     return true
//   })

//   // Ordenar los resultados
//   const sortedStocks = filteredStocks.sort((a, b) => {
//     const direction = sortDirection === 'asc' ? 1 : -1
//     if (sortBy === 'product_name') {
//       return a.product_name.localeCompare(b.product_name) * direction
//     }
//     if (sortBy === 'product_code') {
//       return a.product_code.localeCompare(b.product_code) * direction
//     }
//     return (a.current_stock - b.current_stock) * direction
//   })

//   return {
//     data: sortedStocks,
//     page: currentPage,
//     page_size: currentPageSize,
//     total: count || 0,
//     total_pages: Math.ceil((count || 0) / currentPageSize)
//   }
// }

//procedure get_product_totals
export async function getProductTotals(): Promise<ResApi<InventoryStock>> {
  const supabase = await getSupabase()

  const { data, error } = await supabase.rpc('get_product_totals').select('*')

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
