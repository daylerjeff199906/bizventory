
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { BusinessForm, businessSchema } from '@/schemas/business/register.busines'
import { updateBusiness } from '@/apis/app/business'
import { toast } from 'react-toastify'
import { businessTypes } from '@/schemas/business/register.busines'

interface SettingsFormProps {
    initialData: BusinessForm
    businessId: string
}

export function SettingsForm({ initialData, businessId }: SettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<BusinessForm>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            ...initialData,
            // Ensure optional fields are handled correctly
            description: initialData.description || '',
            document_number: initialData.document_number || '',
            brand: initialData.brand || '',
            acronym: initialData.acronym || '',
            cover_image_url: initialData.cover_image_url || '',
            map_iframe_url: initialData.map_iframe_url || '',
            contact_phone: initialData.contact_phone || '',
            address: initialData.address || '',
        }
    })

    const onSubmit = async (data: BusinessForm) => {
        setIsLoading(true)
        try {
            await updateBusiness(businessId, data)
            toast.success('Configuración actualizada correctamente')
        } catch (error) {
            console.error(error)
            toast.error('Error al actualizar la configuración')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="business_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Negocio</FormLabel>
                                <FormControl>
                                    <Input placeholder="Mi Empresa S.A.C." {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="business_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Negocio</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {businessTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="document_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>RUC / Documento</FormLabel>
                                <FormControl>
                                    <Input placeholder="20123456789" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="business_email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email de Contacto</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="contacto@empresa.com" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="contact_phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                    <Input placeholder="+51 987 654 321" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="acronym"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Acrónimo / Siglas</FormLabel>
                                <FormControl>
                                    <Input placeholder="EMP" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormDescription>
                                    Usado para generar códigos internos (opcional).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                                <Input placeholder="Av. Principal 123, Lima" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Breve descripción de la empresa..."
                                    className="resize-none"
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
