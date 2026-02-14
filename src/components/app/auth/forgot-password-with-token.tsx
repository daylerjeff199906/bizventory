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

interface ForgotPasswordWithTokenProps {
    onPasswordChanged: () => void
}

export const ForgotPasswordWithToken = ({
    onPasswordChanged
}: ForgotPasswordWithTokenProps) => {
    const { control, handleSubmit, watch, formState } =
        useForm<ForgotPasswordForm>({
            defaultValues: {
                newPassword: '',
                confirmPassword: ''
            }
        })
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const { errors: formErrors } = formState

    const handleChangePassword = async (data: ForgotPasswordForm) => {
        const { newPassword, confirmPassword } = data

        if (newPassword !== confirmPassword) {
            toast.error(
                <ToastCustom
                    title="Error"
                    description="Las contraseñas no coinciden."
                />
            )
            return
        }

        if (!newPassword) {
            toast.error(
                <ToastCustom
                    title="Error"
                    description="La nueva contraseña es requerida."
                />
            )
            return
        }

        setIsLoading(true)

        try {
            // Actualizar la contraseña directamente con el token válido
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            toast.success(
                <ToastCustom
                    title="¡Éxito!"
                    description="Contraseña cambiada correctamente."
                />
            )

            onPasswordChanged()
        } catch (error) {
            const errorObj = error as { message: string }
            toast.error(
                <ToastCustom
                    title="Error"
                    description={errorObj.message || 'No se pudo cambiar la contraseña.'}
                />
            )
        }

        setIsLoading(false)
    }

    return (
        <div className="space-y-6 max-w-sm mx-auto">
            <h2 className="text-2xl font-bold">Cambiar contraseña</h2>
            <p className="text-sm text-gray-600">Ingresa tu nueva contraseña.</p>

            <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
                <Controller
                    name="newPassword"
                    control={control}
                    rules={{
                        required: 'La nueva contraseña es requerida',
                        minLength: {
                            value: 6,
                            message: 'La contraseña debe tener al menos 6 caracteres'
                        }
                    }}
                    render={({ field }) => (
                        <Input {...field} type="password" placeholder="Nueva contraseña" />
                    )}
                />
                {formErrors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">
                        {formErrors.newPassword.message}
                    </p>
                )}

                <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{
                        required: 'Debes confirmar tu contraseña',
                        validate: (value) =>
                            value === watch('newPassword') || 'Las contraseñas no coinciden'
                    }}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="password"
                            placeholder="Confirmar contraseña"
                        />
                    )}
                />
                {formErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                        {formErrors.confirmPassword.message}
                    </p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <LoaderIcon className="animate-spin mr-2" />}
                    Cambiar contraseña
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
