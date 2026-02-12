'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { updateBusinessAction } from '../../_actions'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

interface EditBusinessDialogProps {
    business: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditBusinessDialog({ business, open, onOpenChange }: EditBusinessDialogProps) {
    const router = useRouter()

    const form = useForm<BusinessForm>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            business_name: business?.business_name || '',
            business_type: business?.business_type || '',
            business_email: business?.business_email || '',
            status: business?.status || 'ACTIVE'
        },
    })

    useEffect(() => {
        if (business) {
            form.reset({
                business_name: business.business_name,
                business_type: business.business_type,
                business_email: business.business_email,
                status: business.status
            })
        }
    }, [business, form])

    async function onSubmit(values: BusinessForm) {
        try {
            const result = await updateBusinessAction(business.id, values)
            if (result.success) {
                toast.success('Negocio actualizado con éxito')
                onOpenChange(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Error al actualizar el negocio')
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-base">Editar Negocio</DialogTitle>
                    <DialogDescription className="text-sm">
                        Modifica los detalles del negocio.
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
                                        value={field.value}
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
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm">Estado</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="text-sm">
                                                <SelectValue placeholder="Selecciona estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE" className="text-sm">Activo</SelectItem>
                                            <SelectItem value="INACTIVE" className="text-sm">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={form.formState.isSubmitting} className="text-sm">
                                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
