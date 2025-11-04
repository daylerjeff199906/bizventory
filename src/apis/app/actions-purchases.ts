'use server'
import { createClient } from '@/utils/supabase/server'
import { Purchase, PurchaseItem } from '@/types'
import { revalidatePath } from 'next/cache'
import { APP_URLS } from '@/config/app-urls'
import { PurchaseItemSchema, PurchaseMovementTypeEnum, PurchaseSchema, StatusPurchaseEnum } from '@/modules/purchases'
import { z } from 'zod'


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
  let purchaseId: string | null = null
  try {
    // 1. Validar datos de la compra (sin items)
    const validatedPurchase = PurchaseSchema.omit({ items: true }).parse(
      purchaseData
    )

    // 2. Validar items y preparar para inserción
    const validatedItems = itemsData.map((item) => {
      const parsed = PurchaseItemSchema.parse(item)
      return {
        ...parsed,
        purchase_id: null,
        original_product_name: item.original_product_name || null,
        original_variant_name: item.original_variant_name || null
      }
    })


    // 3. Crear la compra con estado inicial
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        ...validatedPurchase,
        status: validatedPurchase.status || 'pending',
        inventory_updated: false
      })
      .select()
      .single()

    if (purchaseError || !purchase) {
      throw purchaseError || new Error('Failed to create purchase')
    }
    purchaseId = purchase.id

    // 4. Crear items de compra con el purchase_id asignado
    const itemsWithPurchaseId = validatedItems.map((item) => ({
      ...item,
      purchase_id: purchase.id
    }))

    const { data: createdItems, error: itemsError } = await supabase
      .from('purchase_items')
      .insert(itemsWithPurchaseId)
      .select(
        '*, product:products(*), variant:product_variants(*), purchase:purchases(*)'
      )

      console.log('Created items:', createdItems)

    if (itemsData.length === 0) {
      throw new Error('Debe haber al menos un item en la compra.')
    }

    if (itemsError || !createdItems) {
      throw itemsError || new Error('Failed to create purchase items')
    }

    // 5. Si la compra está completada, actualizar inventario
    if (validatedPurchase.status === StatusPurchaseEnum.COMPLETED) {
      const { error: stockError } = await supabase.rpc(
        'update_product_stock_after_purchase',
        {
          p_movement_type: PurchaseMovementTypeEnum.ENTRY,
          p_reference: purchase.id
        }
      )

      if (stockError) {
        console.error('Error updating stock:', stockError)
        throw stockError
      }
    }

    // 6. Obtener la compra completa con relaciones
    const { data: completePurchase, error: fetchError } = await supabase
      .from('purchases')
      .select(
        `
        *,
        supplier:suppliers(*),
        items:purchase_items(
          *,
          product:products(*),
          variant:product_variants(*)
        )
      `
      )
      .eq('id', purchase.id)
      .single()

    if (fetchError || !completePurchase) {
      console.error('Failed to fetch complete purchase:', fetchError)
      return {
        status: 'error',
        error: fetchError?.message || 'Failed to fetch complete purchase',
        message: 'Purchase created but failed to fetch complete data'
      }
    }

    // 7. Revalidar rutas
    revalidatePath(APP_URLS.PURCHASES.LIST)
    revalidatePath(`${APP_URLS.PURCHASES.EDIT}/${purchase.id}`)

    return {
      status: 'success',
      data: completePurchase as Purchase & { items: PurchaseItem[] },
      message: 'Purchase and items created successfully'
    }
  } catch (error) {
    console.error('Error in createPurchaseWithItems:', error)

    // Rollback en caso de error
    if (purchaseId) {
      await supabase
        .from('purchase_items')
        .delete()
        .eq('purchase_id', purchaseId)
        .maybeSingle()
      await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseId)
        .maybeSingle()
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    return {
      status: 'error',
      error: errorMessage,
      message: 'Failed to create purchase'
    }
  }
}
