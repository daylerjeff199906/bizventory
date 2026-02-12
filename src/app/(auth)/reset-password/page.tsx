'use client'

import { useState } from 'react'
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
