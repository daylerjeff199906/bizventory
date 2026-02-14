'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { sendPasswordResetEmail } from '@/services/email'

export async function forgotPasswordAction(email: string) {
    try {
        const supabase = createAdminClient()

        // Generate the password reset link
        // Redirect to /auth/callback which exchanges code for session, then to /reset-password
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent('/forgot-password?type=recovery&code=valid')}`
            }
        })

        if (error) {
            console.error('Error generating reset link:', error)
            return { success: false, error: error.message }
        }

        if (!data || !data.properties?.action_link) {
            return { success: false, error: 'No se pudo generar el enlace de acción' }
        }

        // Send the email using Resend
        const emailResult = await sendPasswordResetEmail({
            email,
            resetLink: data.properties.action_link
        })

        if (!emailResult.success) {
            return { success: false, error: 'Error al enviar el correo' }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Unexpected error in forgotPasswordAction:', error)
        return { success: false, error: error.message || 'Error desconocido' }
    }
}
