'use server'

import { getSupabase } from '@/services/core.supabase'
import { revalidatePath } from 'next/cache'

export async function updateProductImages(productId: string, images: string[]) {
    const supabase = await getSupabase()

    try {
        const { error } = await supabase
            .from('products')
            .update({ images })
            .eq('id', productId)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error updating product images:', error)
        return { success: false, error }
    }
}

export async function updateVariantImages(variantId: string, images: string[]) {
    const supabase = await getSupabase()

    try {
        const { error } = await supabase
            .from('product_variants')
            .update({ images })
            .eq('id', variantId)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error updating variant images:', error)
        return { success: false, error }
    }
}
