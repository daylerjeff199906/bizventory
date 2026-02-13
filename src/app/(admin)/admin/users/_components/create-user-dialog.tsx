'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Copy, Check } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { userSchema, UserForm } from '../user-schema'
import { createUserAction } from '../../_actions'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

export function CreateUserDialog() {
    const [open, setOpen] = useState(false)
    const [createdPassword, setCreatedPassword] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const router = useRouter()

    const form = useForm<UserForm>({
        resolver: zodResolver(userSchema) as any,
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            isSuperAdmin: false,
            isActive: true,
        },
    })

    async function onSubmit(values: UserForm) {
        try {
            const result = await createUserAction(values)
            if (result.success && result.password) {
                toast.success('Usuario creado con éxito')
                setCreatedPassword(result.password)
                form.reset()
                router.refresh()
            } else {
                toast.error(result.error || 'Error al crear el usuario')
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado')
        }
    }

    const handleCopyPassword = () => {
        if (createdPassword) {
            navigator.clipboard.writeText(createdPassword)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.info('Contraseña copiada al portapapeles')
        }
    }

    const handleClose = () => {
        setOpen(false)
        setCreatedPassword(null)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-2" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Nuevo Usuario
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold">
                        {createdPassword ? 'Usuario Creado Exitosamente' : 'Crear Nuevo Usuario'}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {createdPassword
                            ? 'El usuario ha sido creado. Por favor, copia la contraseña temporal y compártela con el usuario.'
                            : 'Ingresa los detalles para registrar un nuevo usuario en la plataforma.'}
                    </DialogDescription>
                </DialogHeader>

                {createdPassword ? (
                    <div className="py-6 space-y-4">
                        <div className="p-4 bg-muted rounded-md border text-center space-y-2">
                            <p className="text-sm text-muted-foreground mb-1">Contraseña Temporal</p>
                            <div className="flex items-center justify-center gap-2">
                                <code className="text-xl font-mono font-bold tracking-wider bg-background px-3 py-1 rounded border">
                                    {createdPassword}
                                </code>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCopyPassword}>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Esta contraseña no se volverá a mostrar.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">
                                Entendido
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Nombre</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" className="text-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Apellido</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" className="text-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="john.doe@example.com" type="email" className="text-sm" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <FormField
                                    control={form.control}
                                    name="isSuperAdmin"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-xs font-semibold">Super Admin</FormLabel>
                                                <FormDescription className="text-[10px]">
                                                    Acceso total
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-xs font-semibold">Activo</FormLabel>
                                                <FormDescription className="text-[10px]">
                                                    Puede acceder
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="submit" disabled={form.formState.isSubmitting} className="text-sm w-full sm:w-auto">
                                    {form.formState.isSubmitting ? 'Creando...' : 'Crear Usuario'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
