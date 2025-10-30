'use client'

import { useState } from 'react'
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Save, RefreshCw, Plus, Trash2, X } from 'lucide-react'
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

interface CreateVariantFormProps {
  productId: string
  productName: string
  productCode: string
  productWithVariants?: ProductWithVariants
  businessId?: string
}

const createVariantsFormSchema = z.object({
  variants: productVariantsSchema // Reutiliza tu schema existente
})

type CreateVariantsFormValues = {
  variants: ProductVariantsData // Reutiliza tu tipo existente
}

export const CreateVariantForm = ({
  productId,
  productName,
  productCode,
  productWithVariants,
  businessId
}: CreateVariantFormProps) => {
  const emptyVariant = productWithVariants
    ? productWithVariants.variants.length === 0
    : true

  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [commonAttributes, setCommonAttributes] = useState<string[]>([])
  const [enableManualCode, setEnableManualCode] = useState(false)
  const [variantCreated, setVariantCreated] = useState(emptyVariant)
  const router = useRouter()

  const form = useForm<CreateVariantsFormValues>({
    resolver: zodResolver(createVariantsFormSchema),
    defaultValues: {
      variants: [
        {
          name: '',
          attributes: []
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
      attributes: createCommonAttributesForVariant()
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
            message={`${
              response.error || 'Ocurrió un error al crear las variantes.'
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
              attributes: createCommonAttributesForVariant()
            }
          ]
        })
        setVariantCreated(false)

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
            message={`${
              response.error || 'Ocurrió un error al actualizar las variantes.'
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
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-5xl p-6">
        {/* Encabezado de la página */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Crear variantes
              </h1>
              <p className="text-gray-600">
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
                      attributes: createCommonAttributesForVariant()
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
                      attributes: createCommonAttributesForVariant()
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
              variants={productWithVariants?.variants || []}
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
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold mb-3">
                Configuración inicial
              </h3>

              {/* Atributos comunes */}
              <div className="mb-3">
                <label className="text-xs font-medium mb-2 block">
                  Atributos comunes para todas las variantes:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {Object.entries(ATTRIBUTE_TYPES).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-1">
                      <Checkbox
                        id={key}
                        checked={commonAttributes.includes(key)}
                        onCheckedChange={(checked) =>
                          handleCommonAttributeChange(key, checked as boolean)
                        }
                        className="h-3 w-3"
                      />
                      <label htmlFor={key} className="text-xs cursor-pointer">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración de código */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manual-code"
                  checked={enableManualCode}
                  // onCheckedChange={setEnableManualCode}
                  onCheckedChange={(checked) => {
                    setEnableManualCode(checked as boolean)
                    if (checked) {
                      // Si se habilita la edición manual, generar un nuevo código
                      const newVariants = form
                        .getValues()
                        .variants.map((v) => ({
                          ...v
                        }))
                      form.setValue('variants', newVariants)
                    } else {
                      // Si se deshabilita, regenerar códigos automáticos
                      const newVariants = form
                        .getValues()
                        .variants.map((v) => ({
                          ...v
                        }))
                      form.setValue('variants', newVariants)
                    }
                  }}
                  className="h-3 w-3"
                />
                <label htmlFor="manual-code" className="text-xs cursor-pointer">
                  Permitir edición manual de códigos
                </label>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="w-full space-y-4"
              >
                {fields.length > 0 && (
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
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
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
                            attributes: createCommonAttributesForVariant()
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
  form: UseFormReturn<{ variants: ProductVariantsData }>
  onRemove: () => void
  canRemove: boolean
  commonAttributes: string[]
}

const VariantCard = ({
  index,
  form,
  onRemove,
  canRemove,
  commonAttributes
}: VariantCardProps) => {
  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute
  } = useFieldArray({
    control: form.control,
    name: `variants.${index}.attributes`
  })

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
    <div className="border rounded overflow-hidden bg-white">
      <div className="bg-gray-50 px-2 py-1 border-b flex justify-between items-center">
        <span className="font-medium text-xs">Variante #{index + 1}</span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 h-5 w-5 p-0"
          >
            <Trash2 className="h-2 w-2" />
          </Button>
        )}
      </div>
      <div className="p-2 space-y-2">
        {/* Información básica */}
        <FormField
          control={form.control}
          name={`variants.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la variante" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Atributos comunes */}
        {commonAttrs.length > 0 && (
          <div className="space-y-1">
            <FormLabel className="text-xs font-medium text-blue-700">
              Atributos comunes:
            </FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {commonAttrs.map((attrField) => {
                const actualIndex = attributeFields.findIndex(
                  (f) => f.id === attrField.id
                )
                return (
                  <div key={attrField.id} className="flex gap-1 items-center">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.attributes.${actualIndex}.attribute_type`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Tipo"
                              className="bg-blue-50"
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
                              // className="text-xs h-5"
                              {...field}
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
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <FormLabel className="text-xs font-medium">
              Atributos adicionales:
            </FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAttribute}
            >
              <Plus className="h-2 w-2 mr-0.5" />
              Agregar
            </Button>
          </div>

          {additionalAttrs.length > 0 && (
            <div className="space-y-1">
              {additionalAttrs.map((attrField) => {
                const actualIndex = attributeFields.findIndex(
                  (f) => f.id === attrField.id
                )
                return (
                  <div key={attrField.id} className="flex gap-1 items-center">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.attributes.${actualIndex}.attribute_type`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="h-5 text-xs w-full">
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
                              // className="text-xs"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttribute(actualIndex)}
                      className="text-red-500 hover:text-red-700 h-5 w-5 p-0"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {additionalAttrs.length === 0 && (
            <p className="text-xs text-gray-500 italic">
              Sin atributos adicionales
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
