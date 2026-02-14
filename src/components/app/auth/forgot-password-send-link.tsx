'use client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { LoaderIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { APP_URL } from '@/data/config-app-url'
import { ForgotPasswordForm } from '@/types/auth/auth.interfaces'
import { ToastCustom } from '@/components/app/toast-custom'
import { createClient } from '@/utils/supabase/client'

interface ForgotPasswordSendLinkProps {
    onLinkSent: (email: string) => void
}

export const ForgotPasswordSendLink = ({
    onLinkSent
}: ForgotPasswordSendLinkProps) => {
    const { control, handleSubmit, formState } = useForm<ForgotPasswordForm>({
        defaultValues: {
            email: ''
        }
    })
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const router = useRouter()

    const { errors: formErrors } = formState

    const handleSendLink = async (data: ForgotPasswordForm) => {
        setIsLoading(true)

        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
            redirectTo: `${window.location.origin}/forgot-password?type=recovery`
        })

        if (error) {
            toast.error(
                <ToastCustom
                    title="Error"
                    description={
                        error.message || 'No se pudo enviar el enlace de recuperación.'
                    }
                />
            )
            setIsLoading(false)
            return
        }

        toast.success(
            <ToastCustom
                title="¡Enlace enviado!"
                description="Revisa tu correo electrónico para obtener el enlace de recuperación."
            />
        )

        onLinkSent(data.email)
        setIsLoading(false)
    }

    return (
        <div className="space-y-6 max-w-sm mx-auto">
            <form onSubmit={handleSubmit(handleSendLink)} className="space-y-4">
                <Controller
                    name="email"
                    control={control}
                    rules={{
                        required: 'El correo electrónico es requerido',
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: 'El correo electrónico no es válido'
                        }
                    }}
                    render={({ field }) => (
                        <Input {...field} type="email" placeholder="Correo electrónico" />
                    )}
                />
                {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                        {formErrors.email.message}
                    </p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <LoaderIcon className="animate-spin mr-2" />}
                    Enviar enlace de recuperación
                </Button>

                <Button
                    type="button"
                    onClick={() => router.push(APP_URL.AUTH.LOGIN)}
                    variant="link"
                    className="w-full"
                >
                    Regresar al inicio de sesión
                </Button>
            </form>
        </div>
    )
}
