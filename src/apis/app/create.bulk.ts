// purchase-items.ts
'use server'
import { createClient } from '@/utils/supabase/server'
import { PurchaseItem } from '@/types'
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
 * Crea múltiples items de compra en una sola operación
 * @param itemsData - Array de datos para creación validados con PurchaseItemSchema
 * @returns Promise<PurchaseItem[]>
 */
export async function bulkCreatePurchaseItems({
  itemsData
}: {
  itemsData: z.infer<typeof PurchaseItemSchema>[]
}): Promise<PurchaseItem[]> {
  const supabase = await getSupabase()

  // Validar todos los items con el schema
  const validatedItems = itemsData.map((item) => PurchaseItemSchema.parse(item))

  // Verificar que todos los items pertenezcan a la misma compra
  const uniquePurchaseIds = [
    ...new Set(validatedItems.map((item) => item.purchase_id))
  ]
  if (uniquePurchaseIds.length > 1) {
    throw new Error('All items must belong to the same purchase')
  }
  const purchaseId = uniquePurchaseIds[0]

  // Insertar todos los items en una sola operación
  const { data, error } = await supabase
    .from('purchase_items')
    .insert(
      validatedItems.map((item) => ({
        purchase_id: item.purchase_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      }))
    )
    .select('*, product:products(*)')

  if (error || !data) {
    throw error || new Error('Bulk purchase items creation failed')
  }

  // Actualizar el total de la compra relacionada
  //   await updatePurchaseTotal(purchaseId)

  revalidatePath(`${APP_URLS.PURCHASES.EDIT}/${purchaseId}`)
  return data
}
