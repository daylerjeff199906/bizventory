'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { updateMyProfileAction } from './actions'
import { ToastCustom } from '@/components/app/toast-custom'

const profileSchema = z.object({
    first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
})

interface ProfileFormProps {
    initialData: {
        first_name: string
        last_name: string
        email: string
    }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: initialData.first_name,
            last_name: initialData.last_name,
        },
    })

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        setLoading(true)
        const result = await updateMyProfileAction(values)
        setLoading(false)

        if (result.success) {
            toast.success(<ToastCustom title="Perfil actualizado" message="Tu información ha sido actualizada correctamente." />)
        } else {
            toast.error(<ToastCustom title="Error" message={result.error || 'Ocurrió un error al actualizar el perfil.'} />)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu información personal básica.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Tu nombre" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Tu apellido" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <FormLabel>Correo Electrónico</FormLabel>
                            <Input value={initialData.email} disabled className="bg-muted" />
                            <p className="text-[0.8rem] text-muted-foreground">El correo electrónico no se puede cambiar.</p>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
