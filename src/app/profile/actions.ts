'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
    first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
})

const passwordSchema = z.object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'La confirmación debe tener al menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
})

export async function updateMyProfileAction(values: z.infer<typeof profileSchema>) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('Usuario no autenticado')

        const validation = profileSchema.safeParse(values)
        if (!validation.success) {
            return { success: false, error: validation.error.message }
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: values.first_name,
                last_name: values.last_name,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        if (error) throw error

        revalidatePath('/profile')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating profile:', error)
        return { success: false, error: error.message }
    }
}

export async function updateMyPasswordAction(values: z.infer<typeof passwordSchema>) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('Usuario no autenticado')

        const validation = passwordSchema.safeParse(values)
        if (!validation.success) {
            return { success: false, error: validation.error.message }
        }

        const { error } = await supabase.auth.updateUser({
            password: values.password
        })

        if (error) throw error

        return { success: true }
    } catch (error: any) {
        console.error('Error updating password:', error)
        return { success: false, error: error.message }
    }
}
