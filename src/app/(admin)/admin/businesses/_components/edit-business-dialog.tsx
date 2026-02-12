'use client'

import { useEffect } from 'react'
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
import { Business } from '@/types'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'

interface EditBusinessDialogProps {
    business: Business
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
            description: business?.description || '',
            document_number: business?.document_number || '',
            brand: business?.brand || '',
            acronym: business?.acronym || '',
            contact_phone: business?.contact_phone || '',
            address: business?.address || '',
            status: business?.status || 'ACTIVE'
        },
    })

    useEffect(() => {
        if (business) {
            form.reset({
                business_name: business.business_name || '',
                business_type: business.business_type || '',
                business_email: business.business_email || '',
                description: business.description || '',
                document_number: business.document_number || '',
                brand: business.brand || '',
                acronym: business.acronym || '',
                contact_phone: business.contact_phone || '',
                address: business.address || '',
                status: business.status || 'ACTIVE'
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold">Editar Negocio</DialogTitle>
                    <DialogDescription className="text-sm">
                        Modifica los detalles del negocio.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh] px-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="business_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Nombre del Negocio</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Mi Empresa S.A." className="text-sm" {...field} value={field.value || ''} />
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
                                            <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Tipo de Negocio</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value || ''}
                                                value={field.value || ''}
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="business_email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Email de Contacto</FormLabel>
                                            <FormControl>
                                                <Input placeholder="contacto@empresa.com" className="text-sm" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contact_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Teléfono</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+51 987 654 321" className="text-sm" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="document_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">RUC / Documento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="10XXXXXXXXX" className="text-sm" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="acronym"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Siglas / Acrónimo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ABC" className="text-sm" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Dirección</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Av. Principal 123, Ciudad" className="text-sm" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Descripción</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe el negocio..."
                                                className="text-sm resize-none"
                                                {...field}
                                                value={field.value || ''}
                                            />
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
                                        <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Estado</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value || ''}
                                            value={field.value || ''}
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
                                <Button type="submit" disabled={form.formState.isSubmitting} className="text-sm w-full sm:w-auto">
                                    {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

