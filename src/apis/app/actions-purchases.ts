'use server'
import { createClient } from '@/utils/supabase/server'
import { Purchase, PurchaseItem } from '@/types'
import { revalidatePath } from 'next/cache'
import { APP_URLS } from '@/config/app-urls'
import {
  PurchaseItemSchema,
  PurchaseMovementTypeEnum,
  PurchaseSchema,
  StatusPurchaseEnum
} from '@/modules/purchases'
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

export async function updatePurchaseWithItems({
  purchaseId,
  purchaseData,
  itemsData
}: {
  purchaseId: string
  purchaseData: Omit<z.infer<typeof PurchaseSchema>, 'items'>
  itemsData: z.infer<typeof PurchaseItemSchema>[]
}): Promise<{
  status: 'success' | 'error'
  data?: Purchase & { items: PurchaseItem[] }
  error?: string
  message?: string
}> {
  const supabase = await getSupabase()

  try {
    // 1. Validar datos de la compra (sin items)
    const validatedPurchase = PurchaseSchema.omit({ items: true }).parse(
      purchaseData
    )

    // 2. Validar items y asegurar que tengan al menos product_id o product_variant_id
    const validatedItems = itemsData.map((item) => {
      const parsed = PurchaseItemSchema.parse(item)
      
      // Validar la constraint de la base de datos
      if (!parsed.product_id && !parsed.product_variant_id) {
        throw new Error('Each item must have either product_id or product_variant_id')
      }

      return {
        ...parsed,
        purchase_id: purchaseId,
        original_product_name: item.original_product_name || null,
        original_variant_name: item.original_variant_name || null
      }
    })

    console.log('Validated items for update:', validatedItems)

    // 3. Actualizar la compra
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .update({
        ...validatedPurchase,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchaseId)
      .select()
      .single()

    if (purchaseError || !purchase) {
      throw purchaseError || new Error('Failed to update purchase')
    }

    // 4. Separar items en existentes (con ID) y nuevos (sin ID)
    const existingItems = validatedItems.filter(item => item.id)
    const newItems = validatedItems.filter(item => !item.id)

    // 5. Actualizar items existentes
    if (existingItems.length > 0) {
      const updatePromises = existingItems.map(item => 
        supabase
          .from('purchase_items')
          .update({
            product_id: item.product_id,
            product_variant_id: item.product_variant_id,
            quantity: item.quantity,
            price: item.price,
            bar_code: item.bar_code,
            discount: item.discount,
            variant_attributes: item.variant_attributes,
            original_product_name: item.original_product_name,
            original_variant_name: item.original_variant_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)
          .eq('purchase_id', purchaseId)
          .select()
          .single()
      )

      const updateResults = await Promise.all(updatePromises)
      
      // Verificar errores en las actualizaciones
      for (const result of updateResults) {
        if (result.error) {
          console.error('Error updating item:', result.error)
          throw result.error
        }
      }
    }

    // 6. Crear nuevos items
    if (newItems.length > 0) {
      const { data: createdItems, error: itemsError } = await supabase
        .from('purchase_items')
        .insert(newItems)
        .select(
          '*, product:products(*), variant:product_variants(*), purchase:purchases(*)'
        )

      if (itemsError || !createdItems) {
        throw itemsError || new Error('Failed to create new purchase items')
      }
    }

    // 7. Eliminar items que ya no están en la lista
    // Primero obtenemos los IDs de todos los items que deberían permanecer
    const allItemIds = validatedItems.map(item => item.id).filter(Boolean)
    
    if (allItemIds.length > 0) {
      const {  } = await supabase
        .from('purchase_items')
        .delete()
        .eq('purchase_id', purchaseId)
        .not('id', 'in', `(${allItemIds.join(',')})`)
    } else {
      // Si no hay items con ID, eliminamos todos los items existentes
      const { error: deleteError } = await supabase
        .from('purchase_items')
        .delete()
        .eq('purchase_id', purchaseId)

      if (deleteError) {
        throw deleteError
      }
    }

    // 8. Si la compra está completada, actualizar inventario
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

    // 9. Obtener la compra completa actualizada
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
      .eq('id', purchaseId)
      .single()

    if (fetchError || !completePurchase) {
      console.error('Failed to fetch complete purchase:', fetchError)
      return {
        status: 'error',
        error: fetchError?.message || 'Failed to fetch complete purchase',
        message: 'Purchase updated but failed to fetch complete data'
      }
    }

    // 10. Revalidar rutas
    revalidatePath(APP_URLS.PURCHASES.LIST)
    revalidatePath(`${APP_URLS.PURCHASES.EDIT}/${purchaseId}`)

    return {
      status: 'success',
      data: completePurchase as Purchase & { items: PurchaseItem[] },
      message: 'Purchase and items updated successfully'
    }
  } catch (error) {
    console.error('Error in updatePurchaseWithItems:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    return {
      status: 'error',
      error: errorMessage,
      message: 'Failed to update purchase'
    }
  }
}