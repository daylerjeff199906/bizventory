// products.ts
// Servicio de funciones CRUD para la tabla 'products' usando Supabase en Server Components
'use server'
import { createClient } from '@/utils/supabase/server'
import { Product } from '@/types'
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
export async function getProducts(
  page: number = 1,
  pageSize: number = 10,
  filters?: Partial<Product>
): Promise<ResApi<Product>> {
  const supabase = await getSupabase()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(from, to)

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
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

  if (error) throw error

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
export async function getProductById(id: string): Promise<Product> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) throw error || new Error('Product not found')
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
): Promise<Product> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('products')
    .update(updated)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw error || new Error('Update failed')
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
