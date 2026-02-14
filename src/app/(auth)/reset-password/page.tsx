'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Effect to handle hash fragment if present (fallback for some auth flows)
    useEffect(() => {
        const handleHashSession = async () => {
            const hash = window.location.hash
            if (hash && hash.includes('access_token')) {
                const supabase = createClient()
                const { data, error } = await supabase.auth.getSession()

                if (!data.session) {
                    // Try to recover session from hash manually if getSession didn't pick it up
                    // usually supabase client picks it up automatically, but sometimes timing is off
                    const params = new URLSearchParams(hash.substring(1))
                    const accessToken = params.get('access_token')
                    const refreshToken = params.get('refresh_token')

                    if (accessToken && refreshToken) {
                        await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        })
                    }
                }
            }
        }

        handleHashSession()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            toast.error(<ToastCustom title="Error" message={error.message} />)
        } else {
            toast.success(<ToastCustom title="Contraseña actualizada" message="Tu contraseña ha sido restablecida." />)
            router.replace('/dashboard')
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Crear nueva contraseña</CardTitle>
                        <CardDescription>
                            Ingresa tu nueva contraseña para acceder a tu cuenta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Nueva Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
