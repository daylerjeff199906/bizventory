'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { businessSchema, businessTypes, BusinessForm } from '@/schemas/business/register.busines'
import { createBusinessAction } from '../../_actions'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

export function CreateBusinessDialog() {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const form = useForm<BusinessForm>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            business_name: '',
            business_type: '',
            business_email: '',
            status: 'ACTIVE' as any
        },
    })

    async function onSubmit(values: BusinessForm) {
        try {
            const result = await createBusinessAction(values)
            if (result.success) {
                toast.success('Negocio creado con éxito')
                setOpen(false)
                form.reset()
                router.refresh()
            } else {
                toast.error(result.error || 'Error al crear el negocio')
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Negocio
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-base">Crear Nuevo Negocio</DialogTitle>
                    <DialogDescription className="text-sm">
                        Ingresa los detalles para registrar un nuevo negocio en la plataforma.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="business_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm">Nombre del Negocio</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Mi Empresa S.A." className="text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="business_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm">Tipo de Negocio</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="text-sm">
                                                <SelectValue placeholder="Selecciona un tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {businessTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value} className="text-sm">
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="business_email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm">Email de Contacto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="contacto@empresa.com" className="text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={form.formState.isSubmitting} className="text-sm">
                                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Negocio'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
