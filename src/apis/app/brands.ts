// brands.ts
// Servicio de funciones CRUD para la tabla 'brands' usando Supabase en Server Components
'use server'
import { createClient } from '@/utils/supabase/server'
import { Brand, ResApi } from '@/types'
import { revalidatePath } from 'next/cache'
import { APP_URLS } from '@/config/app-urls'

/**
 * Instancia de Supabase en contexto de servidor
 */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

export async function getBrands({
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
}): Promise<ResApi<Brand>> {
  const supabase = await getSupabase()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Columnas válidas para ordenar
  const validSortColumns = ['created_at', 'updated_at', 'name']

  if (sortBy && !validSortColumns.includes(sortBy)) {
    throw new Error(`No se puede ordenar por la columna ${sortBy}`)
  }

  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'

  let query = supabase
    .from('brands')
    .select('*', { count: 'exact' })
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

  const { data, error, count } = await query
  console.log('getBrands', {
    page,
    pageSize,
    filters,
    sortBy,
    sortDirection,
    data,
    error,
    count
  })

  if (error)
    return {
      data: [],
      page,
      page_size: pageSize,
      total: 0,
      total_pages: 0
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

export async function createBrand(brand: Brand): Promise<Brand | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('brands')
    .insert([brand])
    .select()
    .single()

  if (error) {
    console.error('Error al crear la marca:', error)
    return null
  }

  revalidatePath(APP_URLS.BRANDS.LIST)

  return data as Brand
}

export async function updateBrand(brand: Brand): Promise<Brand | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('brands')
    .update(brand)
    .eq('id', brand.id)
    .select()
    .single()

  if (error) {
    console.error('Error al actualizar la marca:', error)
    return null
  }

  revalidatePath(APP_URLS.BRANDS.LIST)

  return data as Brand
}

export async function deleteBrand(id: string): Promise<boolean> {
  const supabase = await getSupabase()
  const { error } = await supabase.from('brands').delete().eq('id', id)

  if (error) {
    console.error('Error al eliminar la marca:', error)
    return false
  }

  revalidatePath(APP_URLS.BRANDS.LIST)

  return true
}
