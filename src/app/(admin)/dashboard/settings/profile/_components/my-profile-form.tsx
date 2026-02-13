'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { updateMyProfileAction } from '../../../_actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const profileSchema = z.object({
    firstName: z.string().min(2, {
        message: 'El nombre debe tener al menos 2 caracteres.',
    }),
    lastName: z.string().min(2, {
        message: 'El apellido debe tener al menos 2 caracteres.',
    }),
    email: z.string().email().optional(), // Read-only usually
    avatarUrl: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface MyProfileFormProps {
    initialData: {
        firstName: string
        lastName: string
        email: string
        avatarUrl?: string | null
    }
}

export function MyProfileForm({ initialData }: MyProfileFormProps) {
    const router = useRouter()
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: initialData.firstName,
            lastName: initialData.lastName,
            email: initialData.email,
            avatarUrl: initialData.avatarUrl || '',
        },
        mode: 'onChange',
    })

    async function onSubmit(data: ProfileFormValues) {
        try {
            const result = await updateMyProfileAction({
                firstName: data.firstName,
                lastName: data.lastName,
                avatarUrl: data.avatarUrl || undefined,
            })

            if (result.success) {
                toast.success('Perfil actualizado correctamente')
                router.refresh()
            } else {
                toast.error(result.error || 'Error al actualizar el perfil')
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tu Perfil</CardTitle>
                <CardDescription>
                    Administra tu información personal y cómo te ven los demás en la plataforma.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="firstName"
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
                                name="lastName"
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

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled />
                                    </FormControl>
                                    <FormDescription>
                                        El correo electrónico no se puede cambiar directamente. Contacta al soporte si necesitas ayuda.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
