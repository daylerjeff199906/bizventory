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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { CreateBrandSchema, CreateBrand } from '../../schemas'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import { Brand, StatusItems } from '@/types'

interface BrandModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateBrand) => Promise<void>
  brand?: Brand | null
}

export function BrandModal({
  isOpen,
  onClose,
  onSave,
  brand
}: BrandModalProps) {
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!brand

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CreateBrand>({
    resolver: zodResolver(CreateBrandSchema),
    defaultValues: {
      name: '',
      logo_url: '',
      status: StatusItems.ACTIVE
    }
  })

  const watchedLogoUrl = watch('logo_url')

  useEffect(() => {
    if (brand) {
      reset({
        name: brand.name || '',
        logo_url: brand.logo_url || '',
        status: brand.status || StatusItems.ACTIVE
      })
      setLogoPreview(brand.logo_url || '')
    } else {
      reset({
        name: '',
        logo_url: '',
        status: StatusItems.ACTIVE
      })
      setLogoPreview('')
    }
  }, [brand, reset])

  useEffect(() => {
    setLogoPreview(watchedLogoUrl || '')
  }, [watchedLogoUrl])

  const onSubmit = async (data: CreateBrand) => {
    setIsLoading(true)
    try {
      await onSave(data)
      toast(
        <ToastCustom
          title={`Marca ${isEditing ? 'actualizada' : 'creada'}`}
          message={`La marca ${data.name} se ha ${
            isEditing ? 'actualizado' : 'creado'
          } correctamente.`}
        />
      )
      handleClose()
    } catch (error) {
      console.error('Error al guardar la marca:', error)
      toast.error(
        `Error al ${
          isEditing ? 'actualizar' : 'crear'
        } la marca. Por favor, inténtalo de nuevo.`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre de la Marca <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ingrese el nombre de la marca"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">URL del Logo</Label>
              <Input
                id="logo_url"
                type="url"
                placeholder="https://ejemplo.com/logo.png"
                {...register('logo_url')}
                className={errors.logo_url ? 'border-red-500' : ''}
              />
              {errors.logo_url && (
                <p className="text-sm text-red-500">
                  {errors.logo_url.message}
                </p>
              )}

              {logoPreview && (
                <div className="mt-2">
                  <Label className="text-sm text-gray-600">Vista previa:</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={watch('status')}
                onValueChange={(value: 'ACTIVO' | 'INACTIVO') =>
                  setValue(
                    'status',
                    value === 'ACTIVO'
                      ? StatusItems.ACTIVE
                      : StatusItems.INACTIVE
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
      </DialogContent>
    </Dialog>
  )
}
