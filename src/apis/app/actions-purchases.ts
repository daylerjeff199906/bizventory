// /**
//  * Función auxiliar para actualizar los totales de una compra
//  * @param purchaseId - UUID de la compra a actualizar
//  */
// async function updatePurchaseTotal(purchaseId: string): Promise<void> {
//   const supabase = await getSupabase()

//   // 1. Calcular nuevo subtotal sumando todos los items
//   const { data: items, error: itemsError } = await supabase
//     .from('purchase_items')
//     .select('quantity, price')
//     .eq('purchase_id', purchaseId)

//   if (itemsError) throw itemsError

//   // Calcular subtotal (suma de quantity * price)
//   const subtotal = items?.reduce((sum, item) => {
//     return sum + (item.quantity * item.price)
//   }, 0) || 0

//   // 2. Obtener los porcentajes de impuesto y descuento de la compra
//   const { data: purchase, error: purchaseError } = await supabase
//     .from('purchases')
//     .select('tax_rate, discount')
//     .eq('id', purchaseId)
//     .single()

//   if (purchaseError) throw purchaseError

//   const taxRate = purchase?.tax_rate || 0
//   const discount = purchase?.discount || 0

//   // 3. Calcular los nuevos valores
//   const taxAmount = subtotal * (taxRate / 100)
//   const totalAmount = subtotal + taxAmount - discount

//   // 4. Actualizar la compra con los nuevos valores
//   const { error: updateError } = await supabase
//     .from('purchases')
//     .update({
//       subtotal,
//       tax_amount: taxAmount,
//       total_amount: totalAmount,
//       updated_at: new Date().toISOString()
//     })
//     .eq('id', purchaseId)

//   if (updateError) throw updateError
// }

// purchase-items.ts
'use server'
import { createClient } from '@/utils/supabase/server'
import { Purchase, PurchaseItem } from '@/types'
import { revalidatePath } from 'next/cache'
import { APP_URLS } from '@/config/app-urls'
import { PurchaseItemSchema, PurchaseSchema } from '@/modules/purchases'
import { z } from 'zod'

// const supabase = await createClient();

// const { data, error } = await supabase.rpc(
//   'process_complete_purchase_with_validation',
//   {
//     p_supplier_id: 'supplier-uuid',
//     p_purchase_date: new Date().toISOString(),
//     p_items: [
//       { product_id: 'product1-uuid', quantity: 10, price: 15.99 },
//       { product_id: 'invalid-uuid', quantity: 5, price: 22.5 } // Este fallará
//     ]
//   }
// );

// if (error) {
//   console.error('Error processing purchase:', error);
// } else {
//   console.log('Purchase processed:', data);
// }
/**
 * Instancia de Supabase en contexto de servidor
 */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

/**
 * Crea una compra y sus items en dos pasos (primero compra, luego items)
 * @param purchaseData - Datos de la compra sin items
 * @param itemsData - Array de items para crear después
 * @returns Promise<Purchase & { items: PurchaseItem[] }>
 */
export async function createPurchaseWithItems({
  purchaseData,
  itemsData
}: {
  purchaseData: Omit<z.infer<typeof PurchaseSchema>, 'items'>
  itemsData: z.infer<typeof PurchaseItemSchema>[]
}): Promise<{
  status: 'success' | 'error'
  data?: Purchase & { items: PurchaseItem[] }
  error?: string
  message?: string
}> {
  const supabase = await getSupabase()

  // 1. Validar datos de la compra (sin items)
  const validatedPurchase = PurchaseSchema.omit({ items: true }).parse(
    purchaseData
  )

  // 2. Validar items (todos deben tener el mismo purchase_id que tendrá la nueva compra)
  const validatedItems = itemsData.map((item) => {
    const parsed = PurchaseItemSchema.parse(item)
    return {
      ...parsed,
      // Forzamos purchase_id a null ya que aún no existe la compra
      purchase_id: null
    }
  })

  // 3. Crear la compra primero
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      code: validatedPurchase.code,
      date: validatedPurchase.date,
      supplier_id: validatedPurchase.supplier_id,
      guide_number: validatedPurchase.guide_number,
      subtotal: 0, // Se calculará con los items
      discount: validatedPurchase.discount,
      tax_rate: validatedPurchase.tax_rate,
      tax_amount: 0, // Se calculará con los items
      total_amount: 0 // Se calculará con los items
    })
    .select()
    .single()

  if (purchaseError || !purchase) {
    throw purchaseError || new Error('Purchase creation failed')
  }

  try {
    // 4. Crear items masivamente asignándoles el purchase_id recién creado
    const itemsWithPurchaseId = validatedItems.map((item) => ({
      ...item,
      purchase_id: purchase.id
    }))

    const { data: createdItems, error: itemsError } = await supabase
      .from('purchase_items')
      .insert(itemsWithPurchaseId)
      .select('*, product:products(*)')

    if (itemsError || !createdItems) {
      throw itemsError || new Error('Items creation failed')
    }

    // 5. Actualizar totales de la compra con los items creados
    // await updatePurchaseTotal(purchase.id)

    // 6. Obtener la compra actualizada con los totales calculados
    const { data: updatedPurchase, error: fetchError } = await supabase
      .from('purchases')
      .select('*, supplier:suppliers(*)')
      .eq('id', purchase.id)
      .single()

    if (fetchError || !updatedPurchase) {
      return {
        status: 'error',
        error: fetchError?.message || 'Failed to fetch updated purchase',
        message: 'Failed to fetch updated purchase'
      }
    }

    revalidatePath(APP_URLS.PURCHASES.LIST)
    revalidatePath(`${APP_URLS.PURCHASES.EDIT}/${purchase.id}`)

    return {
      status: 'success',
      data: {
        ...updatedPurchase,
        items: createdItems as PurchaseItem[]
      },
      error: undefined,
      message: 'Purchase and items created successfully'
    }
  } catch (error) {
    // Si falla la creación de items, eliminar la compra creada
    await supabase.from('purchases').delete().eq('id', purchase.id)
    return {
      status: 'error',
      error: (error as Error).message || 'Failed to create purchase items',
      message: 'Failed to create purchase items'
    }
  }
}
