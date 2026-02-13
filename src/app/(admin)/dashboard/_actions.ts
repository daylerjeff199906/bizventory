'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const profileSchema = z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
    avatarUrl: z.string().optional(),
})

export type ProfileForm = z.infer<typeof profileSchema>

export async function updateMyProfileAction(values: ProfileForm) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            throw new Error('No autorizado')
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                first_name: values.firstName,
                last_name: values.lastName,
                avatar_url: values.avatarUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (profileError) {
            throw profileError
        }

        // Update auth metadata as well for consistency
        await supabase.auth.updateUser({
            data: {
                first_name: values.firstName,
                last_name: values.lastName,
                avatar_url: values.avatarUrl // if supported in metadata
            }
        })

        revalidatePath('/dashboard/settings/profile')
        revalidatePath('/dashboard') // Update header avatar/name if present

        return { success: true }
    } catch (error: any) {
        console.error('Error in updateMyProfileAction:', error)
        return { success: false, error: error.message }
    }
}
