'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Plus, Pencil } from 'lucide-react'
import { personSchema, PersonType } from '../schema'
import { createPerson, updatePerson } from '@/apis/app'
import { createCustomer } from '@/apis/app'
import { Person } from '@/types'
import { toast } from 'react-toastify'

interface PersonCrudProps {
  businessId?: string
  personData?: Person
  isCustomer?: boolean
  mode?: 'create' | 'edit'
  children?: React.ReactNode
}

export default function PersonsCRUD(props: PersonCrudProps) {
  const { businessId: propBusinessId, personData, isCustomer = false, mode = 'create', children } = props
  const params = useParams()
  const businessId = propBusinessId || (params?.uuid as string)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PersonType>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: personData?.name || '',
      whatsapp: personData?.whatsapp || '',
      secondary_phone: personData?.secondary_phone || '',
      email: personData?.email || '',
      address: personData?.address || '',
      country: personData?.country || 'Perú'
    }
  })

  const handleSubmit = async (data: PersonType) => {
    setIsLoading(true)
    try {
      if (mode === 'create') {
        const personResponse = await createPerson(data)

        if (isCustomer && personResponse?.data?.id) {
          await createCustomer({
            person_id: personResponse.data.id,
            business_id: businessId
          })
          toast.success('Cliente creado correctamente')
        } else {
          toast.success('Persona creada correctamente')
        }
      } else if (mode === 'edit' && personData?.id) {
        await updatePerson(personData.id, data)
        toast.success('Datos actualizados correctamente')
      }

      setIsOpen(false)
      form.reset()
      // Recargar la página para ver los cambios
      window.location.reload()
    } catch {
      toast.error('Ocurrió un error al procesar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalClose = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      form.reset()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            {mode === 'create' ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {isCustomer ? 'Agregar Cliente' : 'Agregar Persona'}
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? isCustomer
                ? 'Agregar Nuevo Cliente'
                : 'Agregar Nueva Persona'
              : 'Editar Datos'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? `Completa la información ${isCustomer ? 'del nuevo cliente' : 'de la nueva persona'
              }.`
              : 'Actualiza los datos de la persona.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="+34 612 345 678" {...field} />
                  </FormControl>
                  <FormDescription>
                    Número de WhatsApp con código de país
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondary_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono Secundario</FormLabel>
                  <FormControl>
                    <Input placeholder="+34 912 345 678" {...field} />
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
                      placeholder="ejemplo@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle, número, ciudad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input placeholder="España" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Procesando...'
                  : mode === 'create'
                    ? 'Guardar'
                    : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
