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
      subtotal: validatedPurchase.subtotal,
      discount: validatedPurchase.discount,
      tax_rate: validatedPurchase.tax_rate,
      tax_amount: validatedPurchase.tax_amount,
      total_amount: validatedPurchase.total_amount
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

    //actualiza el stock de los productos
    const { data: stockUpdateData, error: stockUpdateError } =
      await supabase.rpc('update_product_stock_after_purchase', {
        p_purchase_id: purchase.id
      })

    if (stockUpdateError) {
      // Si falla la actualización del stock, eliminar la compra y los items creados
      await supabase.from('purchases').delete().eq('id', purchase.id)
      await supabase
        .from('purchase_items')
        .delete()
        .eq('purchase_id', purchase.id)
      return {
        status: 'error',
        error: stockUpdateError.message || 'Failed to update product stock',
        message: 'Failed to update product stock'
      }
    }

    console.log('Stock update result:', stockUpdateData)

    // 7. Revalidar las rutas para que Next.js actualice los datos en caché
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
