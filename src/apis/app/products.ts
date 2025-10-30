// products.ts
// Servicio de funciones CRUD para la tabla 'products' usando Supabase en Server Components
'use server'
import { createClient } from '@/utils/supabase/server'
import { Product, ProductDetails } from '@/types'
import { revalidatePath } from 'next/cache'
import { APP_URLS } from '@/config/app-urls'
import { CreateProductData } from '@/modules/products'

export interface ResApi<T> {
  data: T[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

/**
 * Instancia de Supabase en contexto de servidor
 */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

/**
 * Lista productos con paginación y filtros opcionales
 * @param page - número de página (base 1)
 * @param pageSize - tamaño de la página
 * @param filters - campos y valores a filtrar
 * @returns Promise<ResApi<Product>>
 */
export async function getProducts({
  page = 1,
  pageSize = 10,
  filters,
  sortBy = 'created_at', // Valor por defecto
  sortDirection = 'desc', // 'asc' | 'desc'

}: {
  page?: number
  pageSize?: number
  filters?: Record<string, string | number | string[] | undefined>
  sortBy?: string
  sortDirection?: 'asc' | 'desc',

}): Promise<ResApi<ProductDetails>> {
  const supabase = await getSupabase()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Columnas válidas para ordenar
  const validSortColumns = ['created_at', 'updated_at', 'name', 'code', 'brand']

  // Antes de hacer la consulta
  if (sortBy && !validSortColumns.includes(sortBy)) {
    throw new Error(`No se puede ordenar por la columna ${sortBy}`)
  }

  // Validar que la columna de ordenación exista
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'

let query = supabase
  .from('products')
  .select(`
    *,
    brand:brands!inner(
      *,
      business:businesses(id, name)
    )
  `, { count: 'exact' })
  .range(from, to)
  .order(sortColumn, { ascending: sortDirection === 'asc' });


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

  const { data, error, count } = await query.order('created_at', {
    ascending: false
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

/**
 * Obtiene un producto por su ID
 * @param id - UUID del producto
 * @returns Promise<Product>
 */
export async function getProductById(
  id: string
): Promise<ProductDetails | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brands(*)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

/**
 * Crea un nuevo producto
 * @param newProduct - datos para creación
 * @returns Promise<Product>
 */
export async function createProduct({
  newProduct
}: {
  newProduct: CreateProductData
}): Promise<Product | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('products')
    .insert(newProduct)
    .select()
    .single()

  console.log('createProduct', { data, error })

  if (error || !data) {
    return null
  }
  revalidatePath(APP_URLS.PRODUCTS.LIST)
  return data
}

/**
 * Actualiza un producto completo
 * @param id - UUID del producto
 * @param updated - campos a actualizar
 * @returns Promise<Product>
 */
export async function updateProduct(
  id: string,
  updated: Partial<Product>
): Promise<Product | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('products')
    .update(updated)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return null
  revalidatePath(APP_URLS.PRODUCTS.LIST)
  return data
}

/**
 * Actualiza un solo campo de un producto
 * @param id - UUID del producto
 * @param field - nombre del campo
 * @param value - nuevo valor
 * @returns Promise<Product>
 */
export async function patchProductField(
  id: string,
  field: keyof Product,
  value: Product[keyof Product]
): Promise<Product> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('products')
    .update({ [field]: value })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw error || new Error('Patch failed')
  revalidatePath(APP_URLS.PRODUCTS.LIST)
  return data
}

/**
 * Elimina un producto por ID
 * @param id - UUID del producto
 * @returns Promise<void>
 */
export async function deleteProduct(id: string): Promise<void> {
  const supabase = await getSupabase()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) throw error
  revalidatePath(APP_URLS.PRODUCTS.LIST)
}


export async function getProductsByBusinessId(
 {
  idBusiness,
  from = 0,
  to = 49,
  sortColumn = 'created_at',
  sortDirection = 'desc',
  searchTerm
 }:{ idBusiness: string,
  from: number ,
  to: number ,
  sortColumn: string,
  sortDirection: 'asc' | 'desc',
  searchTerm?: string
}
):Promise<ResApi<ProductDetails>> {
   const supabase = await getSupabase()
  try {
    // Primero obtenemos las marcas del negocio
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id')
      .eq('business_id', idBusiness);


    if (brandsError) throw brandsError;

    const brandIds = brands?.map(brand => brand.id) || [];

    if (brandIds.length === 0) {
      return {
        data: [],
        page: 1,
        page_size: to - from + 1,
        total: 0,
        total_pages: 0
      };
    }

    // Luego obtenemos los productos de esas marcas
    let query = supabase
      .from('products')
      .select(`
      *,
      brand:brands(
        *,
        business:business_id(*)
      )
      `, { count: 'exact' })
      .in('brand_id', brandIds)

    // Aplicar búsqueda por nombre o código si se proporcionó searchTerm
    if (searchTerm && searchTerm.trim() !== '') {
      const term = `%${searchTerm.trim()}%`
      query = query.or(`name.ilike.${term},code.ilike.${term}`)
    }

    // Paginación y orden
    query = query.range(from, to).order(sortColumn, { ascending: sortDirection === 'asc' })

    const { data: products, error, count } = await query


    if (error) throw error;

    return {
      data: products || [],
      page: Math.floor(from / (to - from + 1)) + 1,
      page_size: to - from + 1,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / (to - from + 1))
    };
  } catch (error) {
    console.error('Error in getProductsByBusinessId:', error);
    return {
      data: [],
      page: 1,
      page_size: 0,
      total: 0,
      total_pages: 0
    };
  }
}