'use client'

import { useState } from 'react'
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Save, RefreshCw, Plus, Trash2, X, Calculator, History } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
  SelectValue
} from '@/components/ui/select'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import {
  productVariantsSchema,
  type ProductVariantsData,
  ATTRIBUTE_TYPES,
  type AttributeType
} from '@/modules/products'
import { APP_URLS } from '@/config/app-urls'
import { createProductVariants } from '@/apis/app/products.variants'
import { ToastCustom } from '@/components/app/toast-custom'
import { toast } from 'react-toastify'
import { ProductWithVariants } from '@/types'
import { VariantsPreview } from './VariantsPreview'
import { handleProductVariantsUpdate } from '@/apis/app/product-variant-update'
import { ProductVariant as ProductVariantType } from '@/apis/app/product-variant-update'
import { getLastPurchasePrice } from '@/apis/app/purchases'
import { useEffect } from 'react'
import { ImageUpload } from '@/components/ui/image-upload'

interface CreateVariantFormProps {
  productId: string
  productName: string
  productCode: string
  productWithVariants?: ProductWithVariants
  businessId?: string
  productPrice?: number
}

const createVariantsFormSchema = z.object({
  variants: productVariantsSchema // Reutiliza tu schema existente
})

type CreateVariantsFormValues = z.infer<typeof createVariantsFormSchema>

export const CreateVariantForm = ({
  productId,
  productName,
  productCode,
  productWithVariants,
  businessId,
  productPrice
}: CreateVariantFormProps) => {
  const emptyVariant = productWithVariants
    ? productWithVariants.variants.length === 0
    : true

  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [commonAttributes, setCommonAttributes] = useState<string[]>([])
  const [enableManualCode, setEnableManualCode] = useState(false)
  const [variantCreated, setVariantCreated] = useState(emptyVariant)
  const [lastPurchasePrice, setLastPurchasePrice] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchLastPrice = async () => {
      if (productId) {
        const price = await getLastPurchasePrice(productId)
        setLastPurchasePrice(price)
      }
    }
    fetchLastPrice()
  }, [productId])

  const form = useForm<CreateVariantsFormValues>({
    resolver: zodResolver(createVariantsFormSchema),
    defaultValues: {
      variants: [
        {
          name: '',
          price: productPrice ?? 0,
          attributes: [],
          images: []
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants'
  })

  // Crear atributos comunes para una nueva variante
  const createCommonAttributesForVariant = () => {
    console.log('Creating common attributes for variant:', commonAttributes)
    return commonAttributes.map((attrType) => ({
      attribute_type: attrType,
      attribute_value: ''
    }))
  }

  const addVariant = () => {
    append({
      name: '',
      price: productPrice || 0,
      attributes: createCommonAttributesForVariant(),
      images: []
    })
  }

  // Actualizar todas las variantes cuando cambien los atributos comunes
  const updateVariantsWithCommonAttributes = (
    newCommonAttributes: string[]
  ) => {
    const currentVariants = form.getValues().variants

    const updatedVariants = currentVariants.map((variant) => {
      // Mantener atributos existentes que no sean comunes
      const nonCommonAttributes = variant.attributes.filter(
        (attr) => !commonAttributes.includes(attr.attribute_type)
      )

      // Agregar nuevos atributos comunes
      const newCommonAttrs = newCommonAttributes.map((attrType) => {
        // Si ya existe este atributo, mantener su valor
        const existingAttr = variant.attributes.find(
          (attr) => attr.attribute_type === attrType
        )
        return (
          existingAttr || {
            attribute_type: attrType,
            attribute_value: ''
          }
        )
      })

      return {
        ...variant,
        attributes: [...newCommonAttrs, ...nonCommonAttributes]
      }
    })

    form.setValue('variants', updatedVariants)
  }

  const handleCommonAttributeChange = (
    attributeType: string,
    checked: boolean
  ) => {
    const newCommonAttributes = checked
      ? [...commonAttributes, attributeType]
      : commonAttributes.filter((attr) => attr !== attributeType)

    setCommonAttributes(newCommonAttributes)
    updateVariantsWithCommonAttributes(newCommonAttributes)
  }

  const handleSubmit = () => {
    setShowConfirmation(true)
  }

  // Confirmar creación de variantes
  const confirmCreate = async () => {
    setIsLoading(true)
    setShowConfirmation(false)

    try {
      const variantsData = form.getValues().variants

      const response = await createProductVariants({
        businessId: businessId || '',
        productId,
        variants: variantsData
      })

      if (response?.error) {
        toast.error(
          <ToastCustom
            title="Error al crear variantes"
            message={`${response.error || 'Ocurrió un error al crear las variantes.'
              }`}
          />
        )
        return
      } else {
        toast.success(
          <ToastCustom
            title="Variantes creadas"
            message="Las variantes del producto se han creado correctamente."
          />
        )
        form.reset({
          variants: [
            {
              name: '',
              price: productPrice || 0,
              attributes: createCommonAttributesForVariant(),
              images: []
            }
          ]
        })
        setVariantCreated(false)
        window.location.reload()
        router.push(
          APP_URLS.ORGANIZATION.PRODUCTS.CREATE_VARIANT(
            String(businessId),
            productId
          )
        )
      }
    } catch (error) {
      console.error('Error al crear las variantes:', error)
      toast.error(
        <ToastCustom
          title="Error al crear variantes"
          message="Ocurrió un error al intentar crear las variantes. Por favor, inténtalo de nuevo."
        />
      )
    } finally {
      setIsLoading(false)
    }
  }

  const updateProductVariants = async ({
    productId,
    variantsData
  }: {
    productId: string
    variantsData: ProductVariantType[]
  }) => {
    setIsLoading(true)
    try {
      // Call the imported API function with a single object parameter to match its signature
      const response = await handleProductVariantsUpdate({
        businessUnitId: businessId || '',
        productId,
        variantsData
      })
      if (response?.error) {
        toast.error(
          <ToastCustom
            title="Error al actualizar variantes"
            message={`${response.error || 'Ocurrió un error al actualizar las variantes.'
              }`}
          />
        )
        return
      } else {
        toast.success(
          <ToastCustom
            title="Variantes actualizadas"
            message="Las variantes del producto se han actualizado correctamente."
          />
        )
        window.location.reload()
      }
    } catch (error) {
      console.error('Error al actualizar las variantes:', error)
      toast.error(
        <ToastCustom
          title="Error al actualizar variantes"
          message="Ocurrió un error al intentar actualizar las variantes. Por favor, inténtalo de nuevo."
        />
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-5xl p-6">
        {/* Encabezado de la página */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                Crear variantes
              </h1>
              <p className="uppercase">
                Producto: {productName} ({productCode})
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-4"
            onClick={() => {
              if (variantCreated) {
                setVariantCreated(false)
                form.reset({
                  variants: [
                    {
                      name: '',
                      price: productPrice || 0,
                      attributes: createCommonAttributesForVariant(),
                      images: []
                    }
                  ]
                })
              } else {
                setVariantCreated(true)
                // Resetear el formulario para una nueva variante
                form.reset({
                  variants: [
                    {
                      name: '',
                      price: productPrice || 0,
                      attributes: createCommonAttributesForVariant(),
                      images: []
                    }
                  ]
                })
              }
            }}
          >
            {!variantCreated && <Plus className="h-3 w-3 mr-1" />}
            {!variantCreated ? 'Agregar variante' : 'Cancelar creación'}
          </Button>
        </div>

        {/* Previsualización de variantes */}
        {!variantCreated &&
          productWithVariants &&
          productWithVariants.variants.length > 0 && (
            <VariantsPreview
              variants={(productWithVariants?.variants || []).map((v) => ({
                ...v,
                images: v.images || []
              }))}
              productName={productName}
              productCode={productCode}
              isLoading={isLoading}
              onVariantsUpdate={(updatedVariants) => {
                updateProductVariants({
                  productId,
                  variantsData: updatedVariants as ProductVariantType[]
                })
              }}
            />
          )}

        {variantCreated && (
          <>
            {/* Configuración inicial */}
            {/* Configuración inicial */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Configuración inicial</CardTitle>
                <CardDescription>Define los atributos base para las nuevas variantes</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Atributos comunes */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-3 block text-foreground">
                    Atributos comunes para todas las variantes:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(ATTRIBUTE_TYPES).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id={key}
                          checked={commonAttributes.includes(key)}
                          onCheckedChange={(checked) =>
                            handleCommonAttributeChange(key, checked as boolean)
                          }
                        />
                        <label htmlFor={key} className="text-sm cursor-pointer select-none flex-1">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Configuración de código */}
                <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/40 w-fit">
                  <Checkbox
                    id="manual-code"
                    checked={enableManualCode}
                    onCheckedChange={(checked) => {
                      setEnableManualCode(checked as boolean)
                      if (checked) {
                        const newVariants = form.getValues().variants.map((v) => ({ ...v }))
                        form.setValue('variants', newVariants)
                      } else {
                        const newVariants = form.getValues().variants.map((v) => ({ ...v }))
                        form.setValue('variants', newVariants)
                      }
                    }}
                  />
                  <label htmlFor="manual-code" className="text-sm cursor-pointer font-medium">
                    Permitir edición manual de códigos
                  </label>
                </div>
              </CardContent>
            </Card>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="w-full space-y-4"
              >
                {fields.length > 0 && (
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold mb-2">
                      Variantes del producto ({fields.length})
                    </h3>
                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <VariantCard
                          key={field.id}
                          index={index}
                          form={form}
                          onRemove={() => remove(index)}
                          canRemove={fields.length > 1}
                          commonAttributes={commonAttributes}
                          lastPurchasePrice={lastPurchasePrice}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVariant}
                    className="h-8 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar otra variante
                  </Button>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVariantCreated(false)
                      form.reset({
                        variants: [
                          {
                            name: '',
                            price: productPrice || 0,
                            attributes: createCommonAttributesForVariant(),
                            images: []
                          }
                        ]
                      })
                    }}
                  >
                    Cancelar creación
                  </Button>
                  <Button type="submit" disabled={isLoading} size="sm">
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3 mr-1" />
                        Guardar variantes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </div>

      {/* Diálogo de confirmación */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Confirmar creación de variantes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de crear {fields.length} variante(s) para el
              producto {productName}. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmCreate()}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              Confirmar creación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Componente separado para cada card de variante
interface VariantCardProps {
  index: number
  form: UseFormReturn<CreateVariantsFormValues>
  onRemove: () => void
  canRemove: boolean
  commonAttributes: string[]
  lastPurchasePrice: number | null
}

const VariantCard = ({
  index,
  form,
  onRemove,
  canRemove,
  commonAttributes,
  lastPurchasePrice
}: VariantCardProps) => {
  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute
  } = useFieldArray({
    control: form.control,
    name: `variants.${index}.attributes`
  })

  const [profitMargin, setProfitMargin] = useState<number>(30)

  const calculatePrice = () => {
    if (lastPurchasePrice) {
      const price = lastPurchasePrice * (1 + profitMargin / 100)
      form.setValue(`variants.${index}.price`, Number(price.toFixed(2)))
    }
  }

  const addAttribute = () => {
    appendAttribute({
      attribute_type: '',
      attribute_value: ''
    })
  }

  // Separar atributos comunes de los adicionales
  const commonAttrs = attributeFields.filter((attr, attrIndex) => {
    const attrType = form.watch(
      `variants.${index}.attributes.${attrIndex}.attribute_type`
    )
    return commonAttributes.includes(attrType)
  })

  const additionalAttrs = attributeFields.filter((attr, attrIndex) => {
    const attrType = form.watch(
      `variants.${index}.attributes.${attrIndex}.attribute_type`
    )
    return !commonAttributes.includes(attrType)
  })

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary/60 py-0">
      <div className="px-4 py-3 border-b flex justify-between items-center bg-muted/40">
        <span className="font-semibold text-sm">Variante #{index + 1}</span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <CardContent className="p-4 space-y-4">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`variants.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la variante" {...field} className="bg-background" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`variants.${index}.price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Precio (S/)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    className="bg-background"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>


        {/* Images Field */}
        <div className="mb-4">
          <FormLabel className="text-sm font-medium mb-2 block">Imágenes (Máximo 3)</FormLabel>
          <FormField
            control={form.control}
            name={`variants.${index}.images`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUpload
                    value={field.value || []}
                    onChange={(url) => field.onChange(url)}
                    onRemove={(url) =>
                      field.onChange((field.value || []).filter((c) => c !== url))
                    }
                    maxFiles={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing Analysis Widget */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md border border-blue-100 dark:border-blue-900 space-y-3">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <Calculator className="h-4 w-4" />
            <h4 className="font-semibold text-sm">Análisis de Precios</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <History className="h-3 w-3" /> Última Compra
              </span>
              <span className="font-medium text-foreground">
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
                  className="h-8 w-20 bg-background"
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
                Calculado: {lastPurchasePrice !== null ? `S/ ${(lastPurchasePrice * (1 + profitMargin / 100)).toFixed(2)}` : '-'}
              </Button>
            </div>
          </div>
        </div>

        {/* Atributos comunes */}
        {commonAttrs.length > 0 && (
          <div className="space-y-2">
            <FormLabel className="text-xs font-medium text-primary uppercase tracking-wider">
              Atributos comunes
            </FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border border-dashed">
              {commonAttrs.map((attrField) => {
                const actualIndex = attributeFields.findIndex(
                  (f) => f.id === attrField.id
                )
                return (
                  <div key={attrField.id} className="flex gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.attributes.${actualIndex}.attribute_type`}
                      render={({ field }) => (
                        <FormItem className="w-1/3">
                          <FormControl>
                            <Input
                              placeholder="Tipo"
                              className="bg-muted text-muted-foreground border-transparent"
                              {...field}
                              readOnly
                              value={
                                ATTRIBUTE_TYPES[field.value as AttributeType] ||
                                field.value
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.attributes.${actualIndex}.attribute_value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Valor"
                              {...field}
                              className="bg-background"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Atributos adicionales */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <FormLabel className="text-sm font-medium">
              Atributos adicionales
            </FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAttribute}
              className="h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar atributo
            </Button>
          </div>

          {additionalAttrs.length > 0 ? (
            <div className="space-y-3">
              {additionalAttrs.map((attrField) => {
                const actualIndex = attributeFields.findIndex(
                  (f) => f.id === attrField.id
                )
                return (
                  <div key={attrField.id} className="flex gap-2 items-center">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.attributes.${actualIndex}.attribute_type`}
                      render={({ field }) => (
                        <FormItem className="w-1/3">
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ATTRIBUTE_TYPES).map(
                                  ([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`variants.${index}.attributes.${actualIndex}.attribute_value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Valor"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttribute(actualIndex)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-4 bg-muted/20 rounded-lg border border-dashed text-muted-foreground">
              <span className="text-xs">No hay atributos adicionales configurados</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
