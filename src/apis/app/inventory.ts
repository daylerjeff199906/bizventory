'use server'
import { createClient } from '@/utils/supabase/server'
import { InventoryMovementWithProduct, ResApi } from '@/types'

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

/**
 * Obtiene alertas de stock (productos por debajo del stock mínimo)
 * @param filters - filtros opcionales
 * @returns Promise<StockAlert[]>
 */
// export async function getStockAlerts({
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
//   }
//   sortBy: string
//   sortDirection: 'asc' | 'desc'
// }): Promise<ResApi<StockAlert[]>> {
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
//     'current_stock',
//     'min_stock'
//   ]
//   if (sortBy && !validSortColumns.includes(sortBy)) {
//     throw new Error(`No se puede ordenar por la columna ${sortBy}`)
//   }

//   // Consulta para productos con stock mínimo configurado
//   let query = supabase
//     .from('products')
//     .select(
//       'id as product_id, name as product_name, code as product_code, min_stock, inventory_movements!inner(quantity)',
//       { count: 'exact' }
//     )
//     .not('min_stock', 'is', null)
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

//   // Calcular alertas (stock actual < stock mínimo)
//   const alerts = (data || [])
//     .map((product) => ({
//       product_id: product.product_id,
//       product_name: product.product_name,
//       product_code: product.product_code,
//       current_stock: product.inventory_movements.reduce(
//         (sum, movement) => sum + movement.quantity,
//         0
//       ),
//       min_stock: product.min_stock
//     }))
//     .filter((product) => product.current_stock < product.min_stock)

//   // Ordenar los resultados
//   const sortedAlerts = alerts.sort((a, b) => {
//     const direction = sortDirection === 'asc' ? 1 : -1
//     if (sortBy === 'product_name') {
//       return a.product_name.localeCompare(b.product_name) * direction
//     }
//     if (sortBy === 'product_code') {
//       return a.product_code.localeCompare(b.product_code) * direction
//     }
//     if (sortBy === 'min_stock') {
//       return (a.min_stock - b.min_stock) * direction
//     }
//     return (a.current_stock - b.current_stock) * direction
//   })

//   return {
//     data: sortedAlerts,
//     page: currentPage,
//     page_size: currentPageSize,
//     total: count || 0,
//     total_pages: Math.ceil((count || 0) / currentPageSize)
//   }
// }

// /**
//  * Crea un nuevo movimiento de inventario
//  * @param movementData - datos validados con InventoryMovementSchema
//  * @returns Promise<InventoryMovement>
//  */
// export async function createInventoryMovement({
//   movementData
// }: {
//   movementData: z.infer<typeof InventoryMovementSchema>
// }): Promise<InventoryMovement> {
//   const supabase = await getSupabase()
//   const validatedData = InventoryMovementSchema.parse(movementData)

//   const { data, error } = await supabase
//     .from('inventory_movements')
//     .insert({
//       product_id: validatedData.product_id,
//       date: validatedData.date,
//       quantity: validatedData.quantity,
//       description: validatedData.description
//     })
//     .select()
//     .single()

//   if (error || !data) {
//     throw error || new Error('Movement creation failed')
//   }

//   revalidatePath(APP_URLS.INVENTORY.LIST)
//   return data
// }

// /**
//  * Elimina un movimiento de inventario por ID
//  * @param id - UUID del movimiento
//  * @returns Promise<void>
//  */
// export async function deleteInventoryMovement(id: string): Promise<void> {
//   const supabase = await getSupabase()
//   const { error } = await supabase
//     .from('inventory_movements')
//     .delete()
//     .eq('id', id)

//   if (error) throw error

//   revalidatePath(APP_URLS.INVENTORY.LIST)
// }
