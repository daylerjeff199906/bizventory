'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { CreateBrandSchema, type CreateBrand } from '../../schemas'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import { type Brand, StatusItems } from '@/types'
import { updateBrand, createBrand } from '@/apis/app'
import { Label } from '@/components/ui/label'

interface BrandModalProps {
  isOpen: boolean
  onClose: () => void
  brand?: Brand | null
  onSuccess?: (brand: Brand) => void
}

export function BrandModal({
  isOpen,
  onClose,
  brand,
  onSuccess
}: BrandModalProps) {
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!brand

  const form = useForm<CreateBrand>({
    resolver: zodResolver(CreateBrandSchema),
    defaultValues: {
      name: '',
      logo_url: '',
      status: StatusItems.ACTIVE
    }
  })

  const watchedLogoUrl = form.watch('logo_url')

  useEffect(() => {
    if (brand) {
      form.reset({
        name: brand.name || '',
        logo_url: brand.logo_url || '',
        status: brand.status || StatusItems.ACTIVE
      })
      setLogoPreview(brand.logo_url || '')
    } else {
      form.reset({
        name: '',
        logo_url: '',
        status: StatusItems.ACTIVE
      })
      setLogoPreview('')
    }
  }, [brand, form])

  useEffect(() => {
    setLogoPreview(watchedLogoUrl || '')
  }, [watchedLogoUrl])

  const handleSubmitForm = async (data: CreateBrand) => {
    setIsLoading(true)

    try {
      if (isEditing && brand) {
        // Lógica para actualizar marca
        const updatedBrand = await updateBrand({
          id: brand.id,
          name: data.name,
          logo_url: data.logo_url,
          status: data.status,
          updated_at: new Date().toISOString()
        })

        if (!updatedBrand) {
          throw new Error('No se recibió respuesta al actualizar la marca')
        }

        toast.success(
          <ToastCustom
            title="Marca actualizada"
            message={`La marca ${updatedBrand.name} se ha actualizado correctamente.`}
          />
        )

        onSuccess?.(updatedBrand)
      } else {
        // Lógica para crear nueva marca
        const newBrand = await createBrand({
          name: data.name,
          logo_url: data.logo_url,
          status: data.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

        if (!newBrand) {
          throw new Error('No se recibió respuesta al crear la marca')
        }

        toast.success(
          <ToastCustom
            title="Marca creada"
            message={`La marca ${newBrand.name} se ha creado correctamente.`}
          />
        )

        onSuccess?.(newBrand)
      }

      handleClose()
    } catch (error) {
      console.error('Error al guardar la marca:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Ocurrió un error desconocido'

      toast.error(
        <ToastCustom
          title={`Error al ${isEditing ? 'actualizar' : 'crear'} la marca`}
          message={`${errorMessage}. Por favor, inténtalo de nuevo.`}
        />
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setLogoPreview('')
    onClose()
  }

  const handleImageError = () => {
    setLogoPreview('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEditing ? 'Editar Marca' : 'Agregar Nueva Marca'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitForm)}
            className="space-y-6"
          >
            <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nombre de la Marca <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingrese el nombre de la marca"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Logo</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://ejemplo.com/logo.png"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />

                    {logoPreview && (
                      <div className="mt-2">
                        <Label className="text-sm text-gray-600">
                          Vista previa:
                        </Label>
                        <div className="mt-1 p-2 border rounded-md bg-gray-50">
                          <img
                            src={logoPreview || '/placeholder.svg'}
                            alt="Vista previa del logo"
                            className="h-16 w-16 object-contain rounded"
                            onError={handleImageError}
                          />
                        </div>
                      </div>
                    )}
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
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione el estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={StatusItems.ACTIVE}>
                          Activo
                        </SelectItem>
                        <SelectItem value={StatusItems.INACTIVE}>
                          Inactivo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      {isEditing ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : isEditing ? (
                    'Actualizar Marca'
                  ) : (
                    'Crear Marca'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
