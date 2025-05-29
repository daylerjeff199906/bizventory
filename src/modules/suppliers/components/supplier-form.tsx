'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
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

import {
  supplierSchema,
  type CreateSupplierData,
  type UpdateSupplierData
} from '../schemas'
import { Supplier } from '@/types'
import { createSupplier, updateSupplier } from '@/apis/app'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'

interface SupplierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier
  onSuccess?: (supplier: Supplier) => void
}

export default function SupplierForm({
  open,
  onOpenChange,
  supplier,
  onSuccess
}: SupplierFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!supplier

  const form = useForm<CreateSupplierData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier
      ? {
          name: supplier.name,
          contact: supplier.contact,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          currency: supplier.currency,
          status: supplier.status,
          notes: supplier.notes || '',
          company_type: supplier.company_type,
          document_type: supplier.document_type,
          document_number: supplier.document_number
        }
      : {
          currency: 'EUR',
          status: 'activo',
          company_type: 'S.L.',
          document_type: 'CIF',
          notes: ''
        }
  })

  const onSubmit = async (data: CreateSupplierData) => {
    setIsLoading(true)
    try {
      let result: Supplier

      if (isEditing && supplier) {
        const updateData: Omit<UpdateSupplierData, 'id'> = {
          ...data,
          updated_at: new Date().toISOString()
        }

        result = await updateSupplier({
          id: supplier.id,
          updated: updateData
        })
        toast(
          <ToastCustom
            title="Proveedor actualizado"
            message={`Los datos del proveedor ${result.name} se han actualizado correctamente.`}
          />
        )
      } else {
        result = await createSupplier({ newSupplier: data })
        toast(
          <ToastCustom
            title="Proveedor creado"
            message={`El proveedor ${result.name} se ha creado correctamente.`}
          />
        )
      }

      onSuccess?.(result)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error al guardar el proveedor:', error)
      toast.error(
        `Error al ${
          isEditing ? 'actualizar' : 'crear'
        } el proveedor. Por favor, inténtalo de nuevo.`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    form.reset()
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="w-full max-w-6xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto w-full">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la empresa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Distribuidora Central S.A."
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Persona de contacto</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: María González"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Información de contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contacto@empresa.com"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+34 912 345 678"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dirección */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle Mayor 123, Madrid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Información empresarial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de empresa</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="S.A.">S.A.</SelectItem>
                          <SelectItem value="S.L.">S.L.</SelectItem>
                          <SelectItem value="S.C.">S.C.</SelectItem>
                          <SelectItem value="Autónomo">Autónomo</SelectItem>
                          <SelectItem value="Cooperativa">
                            Cooperativa
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="document_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de documento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CIF">CIF</SelectItem>
                          <SelectItem value="NIF">NIF</SelectItem>
                          <SelectItem value="NIE">NIE</SelectItem>
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
                      <FormLabel>Número de documento</FormLabel>
                      <FormControl>
                        <Input placeholder="A12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Configuración */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="USD">USD - Dólar</SelectItem>
                          <SelectItem value="GBP">GBP - Libra</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={
                          field.onChange as (value: string) => void
                        }
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notas */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información adicional sobre el proveedor..."
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Información adicional que pueda ser relevante sobre este
                      proveedor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              {/* Botones */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Actualizar' : 'Crear'} Proveedor
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  )
}
