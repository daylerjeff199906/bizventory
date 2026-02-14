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

interface ForgotPasswordWithOTPProps {
    email: string
    onPasswordChanged: () => void
    onBack: () => void
}

export const ForgotPasswordWithOTP = ({
    email,
    onPasswordChanged,
    onBack
}: ForgotPasswordWithOTPProps) => {
    const { control, handleSubmit, watch, formState } =
        useForm<ForgotPasswordForm>({
            defaultValues: {
                email: email,
                code: '',
                newPassword: '',
                confirmPassword: ''
            }
        })
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const { errors: formErrors } = formState

    const handleChangePassword = async (data: ForgotPasswordForm) => {
        const { code, newPassword, confirmPassword } = data

        if (newPassword !== confirmPassword) {
            toast.error(
                <ToastCustom
                    title="Error"
                    description="Las contraseñas no coinciden."
                />
            )
            return
        }

        if (!code) {
            toast.error(
                <ToastCustom
                    title="Error"
                    description="El código de verificación es requerido."
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
            // Verificar el OTP
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'recovery'
            })

            if (verifyError) throw verifyError

            // Actualizar la contraseña después de verificar el OTP
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) throw updateError

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
            <p className="text-sm text-gray-600">
                Ingresa el código que recibiste por correo y tu nueva contraseña.
            </p>

            <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">
                        Correo electrónico
                    </label>
                    <p className="text-sm text-gray-600 mt-1">{email}</p>
                </div>

                <Controller
                    name="code"
                    control={control}
                    rules={{
                        required: 'El código de verificación es requerido'
                    }}
                    render={({ field }) => (
                        <Input {...field} placeholder="Código de verificación" />
                    )}
                />
                {formErrors.code && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.code.message}</p>
                )}

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

                <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={onBack}
                        variant="outline"
                        className="flex-1"
                    >
                        Volver atrás
                    </Button>
                    <Button
                        type="button"
                        onClick={() => router.push(APP_URL.AUTH.LOGIN)}
                        variant="link"
                        className="flex-1"
                    >
                        Iniciar sesión
                    </Button>
                </div>
            </form>
        </div>
    )
}
