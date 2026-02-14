'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ToastCustom } from '@/components/app/toast-custom'
import { ForgotPasswordSendLink } from './forgot-password-send-link'
import { AuthLayout } from '@/components/miscellaneous/auth-layout'
import { ForgotPasswordWithToken } from './forgot-password-with-token'
import { ForgotPasswordWithOTP } from './ForgotPasswordWithOTP'
import { toast } from 'react-toastify'
import { APP_URL } from '@/data/config-app-url'

type StepType = 'with-otp' | 'recovery'

interface ForgotPasswordProps {
    token?: string | null
    error?: string | null
    type?: StepType | null
}

export const ForgotPassword = ({ token, error, type }: ForgotPasswordProps) => {
    const [currentStep, setCurrentStep] = useState<'send-link' | 'send-success'>(
        'send-link'
    )
    const [email, setEmail] = useState('')

    const router = useRouter()
    const searchParams = useSearchParams()

    const handleLinkSent = (userEmail: string) => {
        setEmail(userEmail)
        setCurrentStep('send-success')
    }

    const handlePasswordChanged = () => {
        // Redirigir después de cambiar la contraseña
        setTimeout(() => router.push(APP_URL.AUTH.LOGIN), 500)
    }

    const getStepTitle = () => {
        if (!token) {
            return currentStep === 'send-link' ? 'Recuperar contraseña' : '¡Enlace enviado!'
        }
        switch (type) {
            case 'with-otp':
                return 'Verificar código'
            case 'recovery':
                return 'Cambiar contraseña'
            default:
                return 'Recuperar contraseña'
        }
    }

    const getStepSubtitle = () => {
        if (!token) {
            return currentStep === 'send-link'
                ? 'Te enviaremos un enlace a tu correo electrónico para restablecer tu contraseña.'
                : `Revisa tu correo electrónico (${email}) para obtener el enlace de recuperación.`
        }
        switch (type) {
            case 'with-otp':
                return 'Ingresa el código que recibiste por correo y tu nueva contraseña.'
            case 'recovery':
                return 'Tu enlace de recuperación es válido. Ingresa tu nueva contraseña.'
            default:
                return 'Recupera el acceso a tu cuenta.'
        }
    }

    useEffect(() => {
        if (error) {
            toast.error(
                <ToastCustom
                    title="Error"
                    description={error || 'Ha ocurrido un error.'}
                />
            )
        }
    }, [error])

    return (
        <AuthLayout
            hiddenName
            logoSize={120}
            title={getStepTitle()}
            subTitle={getStepSubtitle()}
        >
            {!token && (
                <>
                    {currentStep === 'send-link' && (
                        <ForgotPasswordSendLink onLinkSent={handleLinkSent} />
                    )}
                    {currentStep === 'send-success' && (
                        // Content handled by AuthLayout title/subtitle, keeping empty fragment or custom success view if needed beyond title
                        <div className="space-y-6 max-w-sm mx-auto">
                            {/* Success message is now in the subtitle */}
                        </div>
                    )}
                </>
            )}
            {token && type === 'recovery' && (
                <ForgotPasswordWithToken onPasswordChanged={handlePasswordChanged} />
            )}

            {token && type === 'with-otp' && (
                <ForgotPasswordWithOTP
                    email={searchParams.get('email') || ''}
                    onPasswordChanged={handlePasswordChanged}
                    onBack={() => router.push('/forgot-password')}
                />
            )}
        </AuthLayout>
    )
}
