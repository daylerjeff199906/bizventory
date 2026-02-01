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
import { TagInput } from '@/components/ui/tag-input'
import { editProductSchema, EditProductData } from '../../schemas'
import { ProductDetails } from '@/types'
import { APP_URLS } from '@/config/app-urls'
import { BrandModal } from '../brands/brand-modal'
import { Plus, Calculator, History } from 'lucide-react'
import { SearchSelectPopover } from '@/components/app/SearchSelectPopover'
import { useBrands } from '@/hooks/use-brands'
import { getLastPurchasePrice } from '@/apis/app/purchases'
import { useEffect } from 'react'

interface ProductFormProps {
  productDefault: ProductDetails
  businessId?: string
}

export const EditProductPage = (props: ProductFormProps) => {
  const { productDefault, businessId } = props
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [searchBrand, setSearchBrand] = useState<string>('')
  const { brands, fetchBrands, loading: loadingBrands } = useBrands()

  // Pricing Intelligence State
  const [lastPurchasePrice, setLastPurchasePrice] = useState<number | null>(null)
  const [profitMargin, setProfitMargin] = useState<number>(30) // Default 30%

  useEffect(() => {
    const fetchLastPrice = async () => {
      if (productDefault.id) {
        const price = await getLastPurchasePrice(productDefault.id)
        setLastPurchasePrice(price)
      }
    }
    fetchLastPrice()
  }, [productDefault.id])

  const calculatePrice = () => {
    if (lastPurchasePrice) {
      const price = lastPurchasePrice * (1 + profitMargin / 100)
      form.setValue('price', Number(price.toFixed(2)))
    }
  }

  const optionsBrands = brands.map((brand) => ({
    id: brand.id || '',
    name: brand.name
  }))

  const defaultValues: Partial<EditProductData> = {
    brand_id: productDefault.brand_id || undefined, // Add brand_id
    name: productDefault.name,
    code: productDefault.code,
    description: productDefault?.description || '',
    unit: productDefault.unit,
    location: productDefault?.location || '',
    is_active: productDefault.is_active,

    tags: productDefault.tags || [],
    price: productDefault.price || 0,
    discount_active: productDefault.discount_active || false,
    discount_value: productDefault.discount_value || 0
  }

  const form = useForm<EditProductData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      tags: defaultValues.tags || [],
      description: defaultValues.description?.toString() || '',
      unit: defaultValues.unit?.toString() || 'unidad',
      is_active: defaultValues.is_active,
      location: defaultValues.location?.toString() || '',

      brand_id: defaultValues.brand_id || '',
      name: defaultValues.name?.toString() || '',
      price: defaultValues.price || 0,
      discount_active: defaultValues.discount_active || false,
      discount_value: defaultValues.discount_value || 0
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
            <h1 className="text-2xl font-bold">
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
            <div className="flex gap-4 items-end">
              <FormField
                control={form.control}
                name="brand_id"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <SearchSelectPopover
                      options={optionsBrands}
                      isLoading={loadingBrands}
                      placeholder="Selecciona una marca"
                      defaultValue={
                        optionsBrands.find((o) => o.id === field.value) ||
                        (productDefault.brand && productDefault.brand.id === field.value
                          ? {
                            id: productDefault.brand.id || '',
                            name: productDefault.brand.name
                          }
                          : null)
                      }
                      emptyText="No se encontraron marcas"
                      label="Marca"
                      loadingText="Cargando marcas..."
                      searchPlaceholder="Buscar marca por nombre..."
                      onSearch={(value) => setSearchBrand(value)}
                      onChange={(value) => field.onChange(value)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="mb-0.5"
                onClick={() => setIsBrandModalOpen(true)}
                title="Crear nueva marca"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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

            {/* Precios y Descuentos */}
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-medium">Precios y Descuentos</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Base (S/)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pricing Analysis Widget */}
              <div className="p-4 rounded-md border border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Calculator className="h-4 w-4" />
                  <h4 className="font-semibold text-sm">Análisis de Precios</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <History className="h-3 w-3" /> Última Compra
                    </span>
                    <span className="font-medium">
                      {lastPurchasePrice !== null ? `S/ ${lastPurchasePrice.toFixed(2)}` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Margen Ganancia (%)</span>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={profitMargin}
                        onChange={(e) => setProfitMargin(Number(e.target.value))}
                        className="h-8 w-20 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={calculatePrice}
                      disabled={lastPurchasePrice === null}
                      className="w-full"
                    >
                      Aplicar Calculado ({lastPurchasePrice !== null ? `S/ ${(lastPurchasePrice * (1 + profitMargin / 100)).toFixed(2)}` : '-'})
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="discount_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Activar Descuento
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('discount_active') && (
                  <FormField
                    control={form.control}
                    name="discount_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor del Descuento</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.10"
                            {...field}
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
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        businessId={businessId}
        onSuccess={(newBrand) => {
          fetchBrands({ idBusiness: businessId })
          form.setValue('brand_id', newBrand.id)
        }}
      />
    </div>
  )
}
