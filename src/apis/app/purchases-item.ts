// purchase-items.ts
'use server'
import { createClient } from '@/utils/supabase/server'
import { Product, PurchaseItem } from '@/types'
import { revalidatePath } from 'next/cache'
import { APP_URLS } from '@/config/app-urls'
import { z } from 'zod'
import { PurchaseItemSchema } from '@/modules/purchases'

/**
 * Instancia de Supabase en contexto de servidor
 */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

/**
 * Lista items de compra con filtros opcionales
 * @param filters - campos y valores a filtrar
 * @returns Promise<PurchaseItem[]>
 */
export async function getPurchaseItems(
  filters?: Partial<PurchaseItem>
): Promise<PurchaseItem[]> {
  const supabase = await getSupabase()
  let query = supabase.from('purchase_items').select('*, product:products(*)')

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          query = query.eq(key, value)
        } else if (typeof value === 'number') {
          query = query.eq(key, value)
        }
      }
    })
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

/**
 * Obtiene un item de compra por su ID
 * @param id - UUID del item
 * @returns Promise<PurchaseItem & { product: Product }>
 */
export async function getPurchaseItemById(
  id: string
): Promise<PurchaseItem & { product: Product }> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('purchase_items')
    .select('*, product:products(*)')
    .eq('id', id)
    .single()

  if (error || !data) throw error || new Error('Purchase item not found')
  return data
}

/**
 * Crea un nuevo item de compra
 * @param itemData - datos para creación validados con PurchaseItemSchema
 * @returns Promise<PurchaseItem>
 */
export async function createPurchaseItem({
  itemData
}: {
  itemData: z.infer<typeof PurchaseItemSchema>
}): Promise<PurchaseItem> {
  const supabase = await getSupabase()
  const validatedData = PurchaseItemSchema.parse(itemData)

  const { data, error } = await supabase
    .from('purchase_items')
    .insert({
      purchase_id: validatedData.purchase_id,
      product_id: validatedData.product_id,
      quantity: validatedData.quantity,
      price: validatedData.price,
      subtotal: validatedData.quantity * validatedData.price
    })
    .select()
    .single()

  if (error || !data) throw error || new Error('Purchase item creation failed')

  // Actualizar el subtotal de la compra relacionada
  await updatePurchaseTotal(String(validatedData?.purchase_id))

  revalidatePath(`${APP_URLS.PURCHASES.EDIT}/${validatedData.purchase_id}`)
  return data
}

/**
 * Actualiza un item de compra
 * @param id - UUID del item
 * @param updated - campos a actualizar validados con PurchaseItemSchema
 * @returns Promise<PurchaseItem>
 */
export async function updatePurchaseItem({
  id,
  updated
}: {
  id: string
  updated: z.infer<typeof PurchaseItemSchema>
}): Promise<PurchaseItem> {
  const supabase = await getSupabase()
  const validatedData = PurchaseItemSchema.parse(updated)

  const { data, error } = await supabase
    .from('purchase_items')
    .update({
      product_id: validatedData.product_id,
      quantity: validatedData.quantity,
      price: validatedData.price,
      subtotal: validatedData.quantity * validatedData.price,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw error || new Error('Purchase item update failed')

  // Actualizar el subtotal de la compra relacionada
  await updatePurchaseTotal(data.purchase_id)

  revalidatePath(`${APP_URLS.PURCHASES.EDIT}/${data.purchase_id}`)
  return data
}

/**
 * Actualiza un solo campo de un item de compra
 * @param id - UUID del item
 * @param field - nombre del campo
 * @param value - nuevo valor
 * @returns Promise<PurchaseItem>
 */
// export async function patchPurchaseItemField(
//   id: string,
//   field: keyof PurchaseItem,
//   value: PurchaseItem[keyof PurchaseItem]
// ): Promise<PurchaseItem> {
//   const supabase = await getSupabase()
//   const { data, error } = await supabase
//     .from('purchase_items')
//     .update({
//       [field]: value,
//       updated_at: new Date().toISOString(),
//       ...(field === 'quantity' || field === 'price'
//         ? {
//             subtotal:
//               field === 'quantity'
//                 ? value * (data?.price || 0)
//                 : (data?.quantity || 0) * value
//           }
//         : {})
//     })
//     .eq('id', id)
//     .select()
//     .single()

//   if (error || !data) throw error || new Error('Purchase item patch failed')

//   // Actualizar el subtotal de la compra relacionada
//   await updatePurchaseTotal(data.purchase_id)

//   revalidatePath(`${APP_URLS.PURCHASES.EDIT}/${data.purchase_id}`)
//   return data
// }

/**
 * Elimina un item de compra por ID
 * @param id - UUID del item
 * @returns Promise<void>
 */
export async function deletePurchaseItem(id: string): Promise<void> {
  const supabase = await getSupabase()

  // Obtener el purchase_id antes de eliminar
  const { data: item, error: getError } = await supabase
    .from('purchase_items')
    .select('purchase_id')
    .eq('id', id)
    .single()

  if (getError) throw getError

  const { error } = await supabase.from('purchase_items').delete().eq('id', id)

  if (error) throw error

  // Actualizar el subtotal de la compra relacionada
  if (item?.purchase_id) {
    await updatePurchaseTotal(item.purchase_id)
    revalidatePath(`${APP_URLS.PURCHASES.EDIT}/${item.purchase_id}`)
  }
}

/**
 * Función auxiliar para actualizar el total de una compra
 * @param purchaseId - UUID de la compra
 */
async function updatePurchaseTotal(purchaseId: string): Promise<void> {
  const supabase = await getSupabase()

  // Calcular nuevo subtotal sumando todos los items
  const { data: items, error: itemsError } = await supabase
    .from('purchase_items')
    .select('subtotal')
    .eq('purchase_id', purchaseId)

  if (itemsError) throw itemsError

  const subtotal =
    items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0

  // Obtener la compra para calcular impuestos
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select('tax_rate, discount')
    .eq('id', purchaseId)
    .single()

  if (purchaseError) throw purchaseError

  const taxRate = purchase?.tax_rate || 0
  const discount = purchase?.discount || 0
  const taxAmount = subtotal * (taxRate / 100)
  const totalAmount = subtotal + taxAmount - discount

  // Actualizar la compra con los nuevos valores
  const { error: updateError } = await supabase
    .from('purchases')
    .update({
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      updated_at: new Date().toISOString()
    })
    .eq('id', purchaseId)

  if (updateError) throw updateError
}
