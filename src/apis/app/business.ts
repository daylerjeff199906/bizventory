
'use server'

import { createClient } from '@/utils/supabase/server'
import { BusinessForm, businessSchema, generateSlug } from '@/schemas/business/register.busines'
import { revalidatePath } from 'next/cache'

async function getSupabase() {
    return createClient()
}

async function generateUniqueSlug(baseSlug: string, businessId: string): Promise<string> {
    if (!baseSlug) {
        return ''
    }

    const supabase = await getSupabase()
    let slug = baseSlug
    let counter = 1
    let isUnique = false

    while (!isUnique) {
        const { data: existing } = await supabase
            .from('business')
            .select('id, slug')
            .eq('slug', slug)
            .neq('id', businessId)
            .maybeSingle()

        if (!existing) {
            isUnique = true
        } else {
            slug = `${baseSlug}-${counter}`
            counter++
        }
    }

    return slug
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

    // Generate unique slug if provided or if business_name changed
    let slug = data.slug
    if (data.business_name && (!slug || slug === '')) {
        slug = generateSlug(data.business_name)
    }
    
    if (slug && slug !== '') {
        slug = await generateUniqueSlug(slug, id)
    }

    // Validate data partially
    const validatedData = businessSchema.partial().parse({
        ...data,
        slug
    })

    const { data: updatedBusiness, error } = await supabase
        .from('business')
        .update({
            ...validatedData,
            slug,
            updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(`Error updating business: ${error.message}`)
    }

    revalidatePath(`/dashboard/${id}/settings`)
    revalidatePath(`/dashboard/${id}`, 'layout')
    if (slug) {
        revalidatePath(`/store/${slug}`)
    }

    return updatedBusiness
}

export async function getCategoriesByBusiness(businessId: string) {
    const supabase = await getSupabase()
    
    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return categories || []
}
