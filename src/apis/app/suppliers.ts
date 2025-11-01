// suppliers.ts
// Servicio de funciones CRUD para la tabla 'suppliers' usando Supabase en Server Components
'use server'
import { createClient } from '@/utils/supabase/server'
import { CreateSupplierData, UpdateSupplierData } from '@/modules/suppliers'
import { Supplier } from '@/types'
import { revalidatePath } from 'next/cache'
import { APP_URLS } from '@/config/app-urls'

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
export async function getSuppliers({
  filters,
  businessId
}: {
  filters?: { [key: string]: string }
  businessId: string
}): Promise<Supplier[]> {
  const supabase = await getSupabase()
  let query = supabase
    .from('suppliers')
    .select('*')
    .eq('business_id', businessId)

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.ilike(key, `%${value}%`)
    })
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

/**
 * Obtiene un proveedor por su ID
 * @param id - UUID del proveedor
 * @returns Promise<Supplier>
 */
export async function getSupplierById(id: string): Promise<Supplier> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) throw error || new Error('Supplier not found')
  return data
}

/**
 * Crea un nuevo proveedor
 * @param newSupplier - datos para creación
 * @returns Promise<Supplier>
 */
export async function createSupplier({
  newSupplier
}: {
  newSupplier: CreateSupplierData
}): Promise<Supplier> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('suppliers')
    .insert(newSupplier)
    .select()
    .single()

  if (error || !data) throw error || new Error('Creation failed')
  revalidatePath(APP_URLS.SUPPLIERS.LIST)
  return data
}

/**
 * Actualiza un proveedor completo
 * @param id - UUID del proveedor
 * @param updated - campos a actualizar
 * @returns Promise<Supplier>
 */
export async function updateSupplier({
  id,
  updated
}: {
  id: string
  updated: UpdateSupplierData
}): Promise<Supplier> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('suppliers')
    .update(updated)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw error || new Error('Update failed')
  revalidatePath(APP_URLS.SUPPLIERS.LIST)
  return data
}

/**
 * Actualiza un solo campo de un proveedor
 * @param id - UUID del proveedor
 * @param field - nombre del campo
 * @param value - nuevo valor
 * @returns Promise<Supplier>
 */
export async function patchSupplierField(
  id: string,
  field: keyof Supplier,
  value: Supplier[keyof Supplier]
): Promise<Supplier | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('suppliers')
    .update({ [field]: value })
    .eq('id', id)
    .select()
    .single()

  revalidatePath(APP_URLS.SUPPLIERS.LIST)

  if (error || !data) return null
  return data
}

/**
 * Elimina un proveedor por ID
 * @param id - UUID del proveedor
 * @returns Promise<void>
 */
export async function deleteSupplier(id: string): Promise<void> {
  const supabase = await getSupabase()
  const { error } = await supabase.from('suppliers').delete().eq('id', id)

  if (error) throw error
}
