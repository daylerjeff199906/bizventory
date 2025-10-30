'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { updateProduct } from '@/apis/app'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { TagInput } from '@/components/ui/tag-input'
import { editProductSchema, EditProductData } from '../../schemas'
import { ProductDetails } from '@/types'
import { APP_URLS } from '@/config/app-urls'

interface ProductFormProps {
  productDefault: ProductDetails
  businessId?: string
}

export const EditProductPage = (props: ProductFormProps) => {
  const { productDefault, businessId } = props
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues: Partial<EditProductData> = {
    name: productDefault.name,
    code: productDefault.code,
    description: productDefault?.description || '',
    unit: productDefault.unit,
    location: productDefault?.location || '',
    is_active: productDefault.is_active,
    tags: productDefault.tags || []
  }

  const form = useForm<EditProductData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      tags: defaultValues.tags || [],
      description: defaultValues.description?.toString() || '',
      unit: defaultValues.unit?.toString() || 'unidad',
      is_active: defaultValues.is_active,
      location: defaultValues.location?.toString() || '',
      name: defaultValues.name?.toString() || ''
    }
  })

  const isDirty = form.formState.isDirty

  const onSubmit = async (data: EditProductData) => {
    setIsLoading(true)
    try {
      const updatedProduct = await updateProduct(productDefault.id, data)
      if (!updatedProduct) {
        toast.error(
          <ToastCustom
            title="Error al actualizar"
            message="No se pudo actualizar el producto. Por favor, inténtalo de nuevo."
          />
        )
        return
      }
      toast.success(
        <ToastCustom
          title="Producto actualizado"
          message="El producto se ha actualizado correctamente."
        />
      )

      router.push(
        APP_URLS.ORGANIZATION.PRODUCTS.EDIT(businessId || '', productDefault.id)
      )
      router.refresh()
    } catch (error) {
      console.error('Error al guardar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl p-6">
      {/* Header Section */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Producto
            </h1>
            <p className=" uppercase">
              Producto: {productDefault.brand?.name || ''}{' '}
              {productDefault.name || 'Sin nombre'}. Cod. {productDefault.code}
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cuál es el nombre del producto?</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del producto" {...field} />
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
                      placeholder="Descripción detallada del producto"
                      className="min-h-[120px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <FormControl>
                      <Input placeholder="Unidad de medida" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ubicación del producto"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas</FormLabel>
                  <FormControl>
                    <TagInput
                      tags={field.value || []}
                      onChange={field.onChange}
                      placeholder="Agregar etiqueta (ej: electrónica, gadget...)"
                      maxTags={10}
                    />
                  </FormControl>
                  <FormDescription>
                    Palabras clave para categorizar y buscar el producto más
                    fácilmente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Estado del producto
                    </FormLabel>
                    <FormDescription>
                      Determina si el producto está activo y visible en el
                      sistema
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

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || !isDirty}>
                {isLoading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
