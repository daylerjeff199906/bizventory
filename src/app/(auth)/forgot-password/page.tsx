'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        })

        if (error) {
            toast.error(<ToastCustom title="Error" message={error.message} />)
        } else {
            toast.success(<ToastCustom title="Correo enviado" message="Revisa tu bandeja de entrada para restablecer tu contraseña." />)
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
                        <CardDescription>
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar enlace'}
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            <Link href="/login" className="underline">
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
