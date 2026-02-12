'use server'

import { createClient } from '@/utils/supabase/server'
import { BusinessForm } from '@/schemas/business/register.busines'
import { revalidatePath } from 'next/cache'

export async function createBusinessAction(values: BusinessForm) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('business')
            .insert({
                business_name: values.business_name,
                business_type: values.business_type,
                business_email: values.business_email,
                description: values.description,
                document_number: values.document_number,
                brand: values.brand,
                acronym: values.acronym,
                cover_image_url: values.cover_image_url,
                map_iframe_url: values.map_iframe_url,
                contact_phone: values.contact_phone,
                address: values.address,
                status: values.status || 'ACTIVE',
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath('/admin/businesses')
        return { success: true, data }
    } catch (error: any) {
        console.error('Error in createBusinessAction:', error)
        return { success: false, error: error.message }
    }
}

export async function updateBusinessAction(id: string, values: BusinessForm) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('business')
            .update({
                business_name: values.business_name,
                business_type: values.business_type,
                business_email: values.business_email,
                description: values.description,
                document_number: values.document_number,
                brand: values.brand,
                acronym: values.acronym,
                cover_image_url: values.cover_image_url,
                map_iframe_url: values.map_iframe_url,
                contact_phone: values.contact_phone,
                address: values.address,
                status: values.status,
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/admin/businesses')
        return { success: true, data }
    } catch (error: any) {
        console.error('Error in updateBusinessAction:', error)
        return { success: false, error: error.message }
    }
}

export async function deleteBusinessAction(id: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('business')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/admin/businesses')
        return { success: true }
    } catch (error: any) {
        console.error('Error in deleteBusinessAction:', error)
        return { success: false, error: error.message }
    }
}

export async function addMemberToBusinessAction(businessId: string, userId: string, roles: string[]) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('business_members')
            .insert({
                business_id: businessId,
                user_id: userId,
                roles: roles,
                is_active: true
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath('/admin/businesses')
        return { success: true, data }
    } catch (error: any) {
        console.error('Error in addMemberToBusinessAction:', error)
        return { success: false, error: error.message }
    }
}

export async function removeMemberFromBusinessAction(memberId: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('business_members')
            .delete()
            .eq('id', memberId)

        if (error) throw error

        revalidatePath('/admin/businesses')
        return { success: true }
    } catch (error: any) {
        console.error('Error in removeMemberFromBusinessAction:', error)
        return { success: false, error: error.message }
    }
}

export async function searchUsersAction(query: string) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
            .limit(10)

        if (error) throw error

        return { success: true, data }
    } catch (error: any) {
        console.error('Error in searchUsersAction:', error)
        return { success: false, error: error.message }
    }
}

export async function getBusinessMembersAction(businessId: string) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('business_members')
            .select('*, user:profiles(id, first_name, last_name, email)')
            .eq('business_id', businessId)

        if (error) throw error

        return { success: true, data }
    } catch (error: any) {
        console.error('Error in getBusinessMembersAction:', error)
        return { success: false, error: error.message }
    }
}

export async function updateMemberRoleAction(memberId: string, roles: string[]) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('business_members')
            .update({ roles })
            .eq('id', memberId)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/admin/businesses')
        return { success: true, data }
    } catch (error: any) {
        console.error('Error in updateMemberRoleAction:', error)
        return { success: false, error: error.message }
    }
}

export async function resetUserPasswordAction(email: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard/settings/password`,
        })

        if (error) throw error

        return { success: true }
    } catch (error: any) {
        console.error('Error in resetUserPasswordAction:', error)
        return { success: false, error: error.message }
    }
}
