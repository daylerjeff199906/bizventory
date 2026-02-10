
'use server'

import { createClient } from '@/utils/supabase/server'
import { BusinessForm, businessSchema } from '@/schemas/business/register.busines'
import { revalidatePath } from 'next/cache'

async function getSupabase() {
    return createClient()
}

export async function getBusinessById(id: string): Promise<BusinessForm | null> {
    const supabase = await getSupabase()
    const { data, error } = await supabase
        .from('business')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching business:', error)
        return null
    }

    return data
}

export async function updateBusiness(id: string, data: Partial<BusinessForm>) {
    const supabase = await getSupabase()

    // Validate data partially
    const validatedData = businessSchema.partial().parse(data)

    const { data: updatedBusiness, error } = await supabase
        .from('business')
        .update({
            ...validatedData,
            updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(`Error updating business: ${error.message}`)
    }

    revalidatePath(`/dashboard/${id}/settings`)
    // Also revalidate layout where business info might be shown
    revalidatePath(`/dashboard/${id}`, 'layout')

    return updatedBusiness
}
