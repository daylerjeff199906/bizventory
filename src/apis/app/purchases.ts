// purchases.ts
'use server'
import { createClient } from '@/utils/supabase/server'
import { Purchase, PurchaseList, ResApi, Supplier } from '@/types'
import { revalidatePath } from 'next/cache'
import { APP_URLS } from '@/config/app-urls'
import { z } from 'zod'
import { PurchaseSchema } from '@/modules/purchases'
import {
  CombinedResult,
  CombinedResultExtended,
  VariantAttribute
} from './productc.variants.list'

/**
 * Instancia de Supabase en contexto de servidor
 */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

/**
 * Lista compras con filtros opcionales
 * @param filters - campos y valores a filtrar
 * @returns Promise<Purchase[]>
 */
export async function getPurchases({
  bussinessId,
  filters,
  sortBy = 'date',
  sortDirection = 'asc',
  page,
  pageSize,
  fromDate,
  toDate,
  code
}: {
  bussinessId: string
  page?: number
  pageSize?: number
  filters?: Partial<Purchase>
  sortBy: string
  sortDirection: 'asc' | 'desc'
  fromDate?: string | null
  toDate?: string | null
  code?: string | null
}): Promise<ResApi<PurchaseList>> {
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
    'updated_at',
    'code',
    'total_amount'
  ]
  if (sortBy && !validSortColumns.includes(sortBy)) {
    throw new Error(`No se puede ordenar por la columna ${sortBy}`)
  }
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'

  let query = supabase
    .from('purchases')
    .select(`
  *,
  supplier:suppliers!inner(*),
  purchase_items(quantity)
  `, { count: 'exact' })
    .eq('suppliers.business_id', bussinessId)
    .range(from, to)
    .order(sortColumn, { ascending: sortDirection === 'asc' })

  if (fromDate) {
    query = query.gte('date', fromDate)
  }

  if (toDate) {
    query = query.lte('date', toDate)
  }

  if (code) {
    query = query.ilike('code', `%${code}%`)
  }

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
  if (error) throw error

  const mData = data.map((item: any) => ({
    ...item,
    total_items: item.purchase_items?.reduce(
      (sum: number, i: any) => sum + (i.quantity || 0),
      0
    ) || 0,
    purchase_items: undefined // Clean up
  }))

  return {
    data: mData || [],
    page: currentPage,
    page_size: currentPageSize,
    total: count || 0,
    total_pages: Math.ceil((count || 0) / currentPageSize)
  }
}

/**
 * Obtiene una compra por su ID con items y proveedor
 * @param id - UUID de la compra
 * @returns Promise<Purchase & { items: PurchaseItem[], supplier: Supplier }>
 */
export async function getPurchaseById(
  id: string
): Promise<
  (Purchase & { items: CombinedResultExtended[]; supplier: Supplier }) | null
> {
  const supabase = await getSupabase()

  // Obtener la compra con el proveedor
  const { data: purchaseData, error: purchaseError } = await supabase
    .from('purchases')
    .select('*, supplier:suppliers(*)')
    .eq('id', id)
    .single()

  if (purchaseError || !purchaseData) {
    throw purchaseError || new Error('Purchase not found')
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from('purchase_items')
    .select(
      `
      *,
      product:products(*, brand:brands(*)),
      variant:product_variants(
        id,
        name,
        description,
        code,
        product_variant_attributes:product_variant_attributes(*)
      )
    `
    )
    .eq('purchase_id', id)

  if (itemsError) {
    console.error(itemsError)
    return null
  }

  // Mapear los datos a la estructura CombinedResult
  const items =
    itemsData?.map((item) => {
      const baseProduct = item.product
        ? {
          ...item.product,
          brand: item.product.brand || null,
          images: item.product.images || null
        }
        : null


      let variantData: any = {}

      if (item.variant) {
        const sortedAttributes = (
          item.variant.product_variant_attributes || []
        ).sort((a: any, b: any) =>
          a.attribute_type.localeCompare(b.attribute_type)
        )

        variantData = {
          variant_id: item.variant.id,
          variant_name: item.variant.name,
          variant_description: item.variant.description,
          variant_code: item.variant.code,
          attributes: sortedAttributes,
          variant_attributes: sortedAttributes
        }
      }

      return {
        ...baseProduct,
        ...variantData,
        // Campos específicos del purchase_item
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        bar_code: item.bar_code,
        original_variant_name: item.original_variant_name,
        original_product_name: item.original_product_name,
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        variant: item.variant ? {
          id: item.variant.id,
          name: item.variant.name,
          attributes: item.variant.product_variant_attributes || []
        } : undefined
      }
    }) || []

  return { ...purchaseData, items, supplier: purchaseData.supplier || null }
}

/**
 * Crea una nueva compra con sus items
 * @param purchaseData - datos para creación validados con PurchaseSchema
 * @returns Promise<Purchase>
 */
export async function createPurchase({
  purchaseData
}: {
  purchaseData: z.infer<typeof PurchaseSchema>
}): Promise<Purchase> {
  const supabase = await getSupabase()

  // Validar los datos con el schema
  const validatedData = PurchaseSchema.parse(purchaseData)

  // Iniciar transacción
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      code: validatedData.code,
      date: validatedData.date,
      supplier_id: validatedData.supplier_id,
      guide_number: validatedData.guide_number,
      subtotal: validatedData.subtotal,
      discount: validatedData.discount,
      tax_rate: validatedData.tax_rate,
      tax_amount: validatedData.tax_amount,
      total_amount: validatedData.total_amount
    })
    .select()
    .single()

  if (purchaseError || !purchase) {
    throw purchaseError || new Error('Purchase creation failed')
  }

  // Insertar items de la compra
  const { error: itemsError } = await supabase.from('purchase_items').insert(
    validatedData.items.map((item) => ({
      purchase_id: purchase.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
      //   subtotal: item.subtotal
    }))
  )

  if (itemsError) {
    // Si falla la inserción de items, eliminar la compra creada
    await supabase.from('purchases').delete().eq('id', purchase.id)
    throw itemsError
  }

  // Si la compra se crea como completada, actualizar stock inmediatamente
  if (validatedData.status === 'completed') {
    const { error: stockError } = await supabase.rpc(
      'update_product_stock_after_purchase',
      {
        p_movement_type: 'entry',
        p_purchase_id: purchase.id
      }
    )

    if (stockError) {
      // Revertir el estado de la compra si falla la actualización de stock
      // O eliminarla si se prefiere atomicidad total, pero cambiar a pendiente es más seguro para no perder datos
      await supabase
        .from('purchases')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', purchase.id)

      console.error('Error updating stock for new purchase:', stockError)
      // No lanzamos error para no romper la creación, pero idealmente se debería notificar
      // O lanzar error para que el UI lo maneje.

      // Lanzamos error para que el usuario sepa que algo falló con el stock
      throw new Error(`Compra creada pero falló la actualización de stock: ${stockError.message}`)
    }
  }

  revalidatePath(APP_URLS.PURCHASES.LIST)
  return purchase
}

/**
 * Actualiza una compra completa
 * @param id - UUID de la compra
 * @param updated - campos a actualizar validados con PurchaseSchema
 * @returns Promise<Purchase>
 */
export async function updatePurchase({
  id,
  updated
}: {
  id: string
  updated: z.infer<typeof PurchaseSchema>
}): Promise<Purchase> {
  const supabase = await getSupabase()
  const validatedData = PurchaseSchema.parse(updated)

  // Actualizar la compra
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .update({
      code: validatedData.code,
      date: validatedData.date,
      supplier_id: validatedData.supplier_id,
      guide_number: validatedData.guide_number,
      subtotal: validatedData.subtotal,
      discount: validatedData.discount,
      tax_rate: validatedData.tax_rate,
      tax_amount: validatedData.tax_amount,
      total_amount: validatedData.total_amount,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (purchaseError || !purchase) {
    throw purchaseError || new Error('Purchase update failed')
  }

  // Eliminar items antiguos y agregar nuevos
  const { error: deleteError } = await supabase
    .from('purchase_items')
    .delete()
    .eq('purchase_id', id)

  if (deleteError) throw deleteError

  const { error: itemsError } = await supabase.from('purchase_items').insert(
    validatedData.items.map((item) => ({
      purchase_id: id,
      product_id: item.product_id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      bar_code: item.bar_code || null,
      original_product_name: item.original_product_name || null,
      original_variant_name: item.original_variant_name || null
    }))
  )

  if (itemsError) throw itemsError

  revalidatePath(APP_URLS.PURCHASES.LIST)
  revalidatePath(`${APP_URLS.PURCHASES.EDIT}/${id}`)
  return purchase
}

/**
 * Actualiza un solo campo de una compra
 * @param id - UUID de la compra
 * @param field - nombre del campo
 * @param value - nuevo valor
 * @returns Promise<Purchase>
 */
export async function patchPurchaseField(
  id: string,
  field: keyof Purchase,
  value: Purchase[keyof Purchase]
): Promise<Purchase> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('purchases')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw error || new Error('Patch failed')
  revalidatePath(APP_URLS.PURCHASES.LIST)
  revalidatePath(`${APP_URLS.PURCHASES.VIEW(id)}`)
  return data
}

/**
 * Elimina una compra por ID
 * @param id - UUID de la compra
 * @returns Promise<void>
 */
export async function deletePurchase(id: string): Promise<void> {
  const supabase = await getSupabase()

  // 1. Obtener la compra para verificar estado
  const { data: purchase, error: fetchError } = await supabase
    .from('purchases')
    .select('status, business_id')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw new Error('Error finding purchase to delete')
  }

  // 2. Si estaba completada, revertir stock (eliminar movimientos)
  if (purchase.status === 'completed') {
    const { error: stockError } = await supabase.rpc(
      'delete_purchase_inventory_movements',
      {
        p_purchase_id: id
      }
    )

    if (stockError) {
      console.error('Error reverting stock:', stockError)
      throw new Error(
        'No se pudo revertir el stock. La compra no ha sido eliminada.'
      )
    }
  }

  // 3. Eliminar items asociados
  const { error: itemsError } = await supabase
    .from('purchase_items')
    .delete()
    .eq('purchase_id', id)

  if (itemsError) throw itemsError

  // 4. Eliminar la compra
  const { error } = await supabase.from('purchases').delete().eq('id', id)

  if (error) throw error

  if (purchase.business_id) {
    revalidatePath(APP_URLS.ORGANIZATION.PURCHASES.LIST(purchase.business_id))
  } else {
    revalidatePath(APP_URLS.PURCHASES.LIST)
  }
}

/**
 * Actualiza el campo status de una compra y ejecuta lógica adicional si es 'completed'
 * @param id - UUID de la compra
 * @param status - nuevo estado ('pending', 'completed', etc.)
 * @returns Promise<Purchase>
 */
export async function updatePurchaseStatus(
  id: string,
  status: string
): Promise<Purchase> {
  const supabase = await getSupabase()
  // Actualizar el campo status
  const { data: purchase, error } = await supabase
    .from('purchases')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !purchase) throw error || new Error('Status update failed')

  // Si el nuevo status es 'completed', ejecutar la función RPC para actualizar stock
  if (status === 'completed') {
    const { error: stockError } = await supabase.rpc(
      'update_product_stock_after_purchase',
      {
        p_movement_type: 'entry',
        p_purchase_id: purchase.id
      }
    )
    if (stockError) throw stockError
  }

  revalidatePath(APP_URLS.PURCHASES.LIST)
  revalidatePath(`${APP_URLS.PURCHASES.VIEW(id)}`)
  return purchase
}

/**
 * Obtiene el último precio de compra para un producto
 * @param productId - ID del producto
 * @returns Promise<number | null>
 */
export async function getLastPurchasePrice(productId: string): Promise<number | null> {
  const supabase = await getSupabase()

  // Obtenemos el item de compra más reciente para este producto
  // Ordenamos por la fecha de la compra descendente
  const { data, error } = await supabase
    .from('purchase_items')
    .select(`
      price,
      purchase:purchases!inner (
        date,
        created_at
      )
    `)
    .eq('product_id', productId)
    .order('purchase(date)', { ascending: false })
    .order('purchase(created_at)', { ascending: false }) // Desempate por creación
    .limit(1)
    .maybeSingle()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching last purchase price:', error)
    return null
  }

  return data?.price || null
}
