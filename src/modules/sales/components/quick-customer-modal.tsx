'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
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
    SelectValue,
} from "@/components/ui/select"
import { UserPlus } from 'lucide-react'
import { personSchema, PersonType } from '../../customers/schema'
import { createPerson, createCustomer } from '@/apis/app/customers'
import { CustomerList, Person } from '@/types'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'

interface QuickCustomerModalProps {
    businessId: string
    onSuccess: (customer: CustomerList) => void
    children?: React.ReactNode
}

export default function QuickCustomerModal({
    businessId,
    onSuccess,
    children
}: QuickCustomerModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<PersonType>({
        resolver: zodResolver(personSchema),
        defaultValues: {
            name: '',
            document_type: 'DNI',
            document_number: '',
            whatsapp: '',
            secondary_phone: '',
            email: '',
            address: '',
            country: 'Perú'
        }
    })

    const handleSubmit = async (data: PersonType) => {
        setIsLoading(true)
        try {
            // 1. Crear persona
            const personResponse = await createPerson(data)

            if (personResponse.error || !personResponse.data) {
                throw personResponse.error || new Error('Error al crear persona')
            }

            // 2. Crear cliente vinculado a esa persona y al negocio
            const customerResponse = await createCustomer({
                person_id: personResponse.data.id,
                business_id: businessId
            })

            if (!customerResponse) {
                throw new Error('Error al crear cliente')
            }

            toast.success(
                <ToastCustom
                    title="Cliente creado"
                    message={`El cliente ${data.name} ha sido registrado correctamente.`}
                />
            )

            // 3. Notificar éxito y cerrar
            onSuccess(customerResponse as CustomerList)
            setIsOpen(false)
            form.reset()
        } catch (error: any) {
            console.error('Error in QuickCustomerModal:', error)
            toast.error(
                <ToastCustom
                    title="Error"
                    message={error.message || 'No se pudo crear el cliente.'}
                />
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="icon" type="button" className="shrink-0">
                        <UserPlus className="w-4 h-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                    <DialogDescription>
                        Registra rápidamente los datos del nuevo cliente para el negocio.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                        }}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo / Razón Social *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Juan Pérez o Empresa SAC" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="document_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Doc. *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DNI">DNI</SelectItem>
                                                <SelectItem value="RUC">RUC</SelectItem>
                                                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                                                <SelectItem value="Carnet Extranjería">C.E.</SelectItem>
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
                                        <FormLabel>N° de Doc. *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="12345678" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="whatsapp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono / WhatsApp *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="987654321" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="juan@ejemplo.com"
                                                {...field}
                                            />
                                        </FormControl>
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
                                    <FormLabel>Dirección *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Av. Siempre Viva 123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                disabled={isLoading}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    form.handleSubmit(handleSubmit)()
                                }}
                            >
                                {isLoading ? 'Guardando...' : 'Crear y Seleccionar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
