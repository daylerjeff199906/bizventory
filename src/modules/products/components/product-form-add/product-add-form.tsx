/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Save, X, RefreshCw, Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { BrandModal } from '../brands/brand-modal'

import { productSchema, type CreateProductData } from '@/modules/products'
import { APP_URLS } from '@/config/app-urls'
import { createProduct } from '@/apis/app'
import { ToastCustom } from '@/components/app/toast-custom'
import { toast } from 'react-toastify'
import { SearchSelectPopover } from '@/components/app/SearchSelectPopover'
import { useBrands } from '@/hooks/use-brands'
import { useParams } from 'next/navigation'

export const NewProductForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const router = useRouter()
  const [searchBrand, setSearchBrand] = useState<string>('')
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)

  const { brands, fetchBrands, loading: loadingBrands } = useBrands()
  const params = useParams()

  const uuidBusiness = params?.uuid as string

  const form = useForm<CreateProductData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      description: '',

      brand_id: '',
      tags: [],
      price: 0,
      discount_active: false,
      discount_value: 0
      //   images: []
    }
  })

  const isDirty = form.formState.isDirty

  const addTag = () => {
    if (tagInput.trim() && !form.getValues('tags')?.includes(tagInput.trim())) {
      const currentTags = form.getValues('tags') || []
      const newTags = [...currentTags, tagInput.trim()]
      form.setValue('tags', newTags)
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || []
    const newTags = currentTags.filter((tag) => tag !== tagToRemove)
    form.setValue('tags', newTags)
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSubmit = () => {
    // Mostrar diálogo de confirmación en lugar de enviar directamente
    setShowConfirmation(true)
  }

  const confirmCreate = async () => {
    setIsLoading(true)
    setShowConfirmation(false)

    try {
      const productData = {
        ...form.getValues()
      }

      const response = await createProduct({ newProduct: productData })
      if (!response) {
        toast.error(
          <ToastCustom
            title="Error al crear producto"
            message="No se pudo crear el producto. Por favor, inténtalo de nuevo."
          />
        )
        return
      } else {
        toast.success(
          <ToastCustom
            title="Producto creado"
            message="El producto se ha creado correctamente."
          />
        )
        router.push(
          APP_URLS.ORGANIZATION.PRODUCTS.CREATE_VARIANT(
            uuidBusiness,
            response.id
          )
        )
      }
    } catch (error) {
      console.error('Error al crear el producto:', error)
      toast.error(
        <ToastCustom
          title="Error al crear producto"
          message="Ocurrió un error al intentar crear el producto. Por favor, inténtalo de nuevo."
        />
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands({
      query: searchBrand,
      idBusiness: uuidBusiness
    })
  }, [searchBrand])

  const optionsBrands = brands.map((brand) => ({
    id: brand.id,
    name: brand.name
  }))

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-4xl mx-auto p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full space-y-12"
          >
            {/* Información básica */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold">
                  Información básica
                </h2>
                <p className="uppercase mt-1">
                  Datos principales del producto
                </p>
              </div>
              <div className="flex gap-4 items-end">
                <FormField<CreateProductData, 'brand_id'>
                  control={form.control}
                  name="brand_id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <SearchSelectPopover
                        options={
                          optionsBrands as {
                            id: string
                            name: string
                            [key: string]: unknown
                          }[]
                        }
                        isLoading={loadingBrands}
                        placeholder="Selecciona una marca"
                        defaultValue={null}
                        emptyText="No se encontraron marcas"
                        label="Marca del producto"
                        required
                        loadingText="Cargando marcas..."
                        searchPlaceholder="Buscar marca por nombre..."
                        onSearch={(value) => {
                          setSearchBrand(value)
                        }}
                        onChange={(value) => {
                          console.log('Selected brand:', value)
                          field.onChange(value)
                        }}
                      />
                      <FormDescription>
                        Selecciona la marca a la que pertenece este producto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mb-8"
                  onClick={() => setIsBrandModalOpen(true)}
                  title="Crear nueva marca"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <FormField<CreateProductData, 'name'>
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Nombre del producto *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Pulsera de ojos turcos color azul"
                          className="text-base"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField<CreateProductData, 'description'>
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Descripción *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe las características principales del producto..."
                          rows={4}
                          className="text-base"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Una buena descripción ayuda a los clientes a entender
                        mejor el producto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>



            {/* Precios y Descuentos */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold">
                  Precios y Descuentos
                </h2>
                <p className="text-muted-foreground mt-1">
                  Define los precios y reglas de descuento
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField<CreateProductData, 'price'>
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Precio Base (S/)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.10"
                          placeholder="0.00"
                          className="text-base"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField<CreateProductData, 'discount_active'>
                  control={form.control}
                  name="discount_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Activar Descuento
                        </FormLabel>
                        <FormDescription>
                          Habilitar un descuento para este producto
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('discount_active') && (
                  <FormField<CreateProductData, 'discount_value'>
                    control={form.control}
                    name="discount_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Valor del Descuento
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.10"
                            placeholder="0.00"
                            className="text-base"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Monto o porcentaje a descontar
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </section>

            {/* Información adicional */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold">
                  Información adicional
                </h2>
                <p className="text-muted-foreground mt-1">
                  Datos opcionales para mejor organización
                </p>
              </div>

              {/* Tags */}
              <FormField<CreateProductData, 'tags'>
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Etiquetas
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar etiqueta..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleTagKeyPress}
                            className="text-base"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addTag}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar
                          </Button>
                        </div>
                        {Array.isArray(field.value) && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {(field.value as string[]).map((tag: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-sm"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-2 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Las etiquetas ayudan a categorizar y buscar productos más
                      fácilmente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </section>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <Link
                href={APP_URLS.ORGANIZATION.PRODUCTS.LIST(
                  params.uuid?.toString() || ''
                )}
              >
                <Button type="button" variant="outline" size="lg">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
                size="lg"
                className="cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creando producto...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear producto
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      {/* Diálogo de confirmación */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Confirmar creación de producto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de crear un nuevo producto. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCreate} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Confirmar creación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        businessId={uuidBusiness}
        onSuccess={(newBrand) => {
          fetchBrands({ idBusiness: uuidBusiness })
          form.setValue('brand_id', newBrand.id)
        }}
      />
    </div >
  )
}
