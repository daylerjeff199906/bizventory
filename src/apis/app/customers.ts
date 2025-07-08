// suppliers.ts
// Servicio de funciones CRUD para la tabla 'suppliers' usando Supabase en Server Components
'use server'
import { createClient } from '@/utils/supabase/server'
// import { CreateSupplierData, UpdateSupplierData } from '@/modules/suppliers'
import { CustomerList } from '@/types'
// import { revalidatePath } from 'next/cache'
// import { APP_URLS } from '@/config/app-urls'

/**
 * Instancia de Supabase en contexto de servidor
 */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

/**
 * Lista proveedores con filtros opcionales
 * @param filters - campos y valores a filtrar
 * @returns Promise<Supplier[]>
 */
export async function getCustomers({
  page = 1,
  pageSize = 10,
  filters,
  sortBy = 'created_at',
  sortDirection = 'desc'
}: {
  page?: number
  pageSize?: number
  filters?: Record<string, string | number | string[] | undefined>
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}): Promise<{
  data: CustomerList[]
  page: number
  page_size: number
  total: number
  total_pages: number
}> {
  const supabase = await getSupabase()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Columnas válidas para ordenar
  const validSortColumns = ['created_at', 'updated_at', 'person_id']

  if (sortBy && !validSortColumns.includes(sortBy)) {
    throw new Error(`No se puede ordenar por la columna ${sortBy}`)
  }
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'

  // Si no hay filtros, retornar la lista normal
  if (!filters || Object.keys(filters).length === 0) {
    const { data, error, count } = await supabase
      .from('customers')
      .select('*, person:person_id(*)', { count: 'exact' })
      .order(sortColumn, { ascending: sortDirection === 'asc' })
      .range(from, to)

    if (error) {
      return {
        data: [],
        page,
        page_size: pageSize,
        total: 0,
        total_pages: 0
      }
    }

    const total = count || 0
    const total_pages = Math.ceil(total / pageSize)

    return {
      data: data || [],
      page,
      page_size: pageSize,
      total,
      total_pages
    }
  }

  // Filtros sobre la tabla person
  let personQuery = supabase.from('person').select('id')
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        if (Array.isArray(value)) {
          personQuery = personQuery.in(key, value)
        } else if (typeof value === 'string') {
          personQuery = personQuery.ilike(key, `%${value}%`)
        } else {
          personQuery = personQuery.eq(key, value)
        }
      }
    })
  }
  const { data: personIds, error: personError } = await personQuery
  if (personError) {
    return {
      data: [],
      page,
      page_size: pageSize,
      total: 0,
      total_pages: 0
    }
  }
  type PersonId = { id: string }
  const ids = Array.isArray(personIds)
    ? personIds.map((p: PersonId) => p.id)
    : []
  let customerQuery = supabase
    .from('customers')
    .select('*, person:person_id(*)', { count: 'exact' })
    .order(sortColumn, { ascending: sortDirection === 'asc' })
    .range(from, to)

  if (ids.length > 0) {
    customerQuery = customerQuery.in('person_id', ids)
  } else if (filters) {
    // Si hay filtros pero no hay coincidencias en person, retornar vacío
    return {
      data: [],
      page,
      page_size: pageSize,
      total: 0,
      total_pages: 0
    }
  }

  const { data, error, count } = await customerQuery

  if (error) {
    return {
      data: [],
      page,
      page_size: pageSize,
      total: 0,
      total_pages: 0
    }
  }

  const total = count || 0
  const total_pages = Math.ceil(total / pageSize)

  return {
    data: data || [],
    page,
    page_size: pageSize,
    total,
    total_pages
  }
}
