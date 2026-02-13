'use server'

import { createClient } from '@/utils/supabase/server'
import { BusinessForm } from '@/schemas/business/register.busines'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { UserForm } from './users/user-schema'
import { sendWelcomeEmail } from '@/services/email'

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
        // Soft delete: marcar como eliminado sin borrar físicamente
        const { error } = await supabase
            .from('business')
            .update({
                deleted_at: new Date().toISOString(),
                status: 'INACTIVE'
            })
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


export async function createUserAction(values: UserForm) {
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    try {
        // Generar contraseña aleatoria
        const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

        // 1. Crear usuario en Auth
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email: values.email,
            password: password,
            email_confirm: true,
            user_metadata: {
                first_name: values.firstName,
                last_name: values.lastName,
                is_super_admin: values.isSuperAdmin,
            }
        })

        if (authError) throw authError

        if (!authData.user) throw new Error('No se pudo crear el usuario')

        // 2. Actualizar perfil (por si el trigger no cogió todos los datos o queremos asegurar)
        // Usamos adminSupabase porque el trigger puede haber fallado o queremos forzar datos
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                email: values.email,
                first_name: values.firstName,
                last_name: values.lastName,
                is_super_admin: values.isSuperAdmin,
                is_active: values.isActive,
                updated_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('Error updating profile:', profileError)
            // No lanzamos error aquí para no fallar toda la creación si el auth fue bien, pero es crítico
        }

        // 3. Enviar correo de bienvenida (Simulado o real si hay servicio)
        const emailResult = await sendWelcomeEmail({
            firstName: values.firstName,
            email: values.email,
            password: password
        })

        if (!emailResult.success) {
            console.error('Failed to send welcome email:', emailResult.error)
            // No fallamos la creación del usuario si el correo falla, pero lo logueamos
        }

        revalidatePath('/admin/users')
        return { success: true, password } // Retornamos password para mostrarlo al admin una vez
    } catch (error: any) {
        console.error('Error in createUserAction:', error)
        return { success: false, error: error.message }
    }
}

export async function updateUserAction(id: string, values: UserForm) {
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    try {
        // 1. Actualizar Auth User (email, metadata)
        const { error: authError } = await adminSupabase.auth.admin.updateUserById(id, {
            email: values.email,
            user_metadata: {
                first_name: values.firstName,
                last_name: values.lastName,
                is_super_admin: values.isSuperAdmin,
            }
        })

        if (authError) throw authError

        // 2. Actualizar Profile
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .update({
                email: values.email,
                first_name: values.firstName,
                last_name: values.lastName,
                is_super_admin: values.isSuperAdmin,
                is_active: values.isActive,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (profileError) throw profileError

        revalidatePath('/admin/users')
        revalidatePath(`/admin/users/${id}`)
        return { success: true }
    } catch (error: any) {
        console.error('Error in updateUserAction:', error)
        return { success: false, error: error.message }
    }
}
