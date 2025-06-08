'use client'
import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
// import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Plus,
  Trash2,
  ShoppingCart,
  Calculator,
  Package,
  DollarSign,
  Pencil
} from 'lucide-react'
import { saleFormSchema, SaleFormValues, SaleItemValues } from '../schemas'
import { Currency } from '@/types'
import ProductSelectionModal from './product-selection-modal'
import { SelectedProductItem } from './types'
import { SaleValues, ItemValues } from '../schemas'
import { createSale } from '@/apis/app/sales'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
// import ProductSelectionModal from './product-selection-modal'
// import EditProductModal from './edit-product-modal'

// Datos de ejemplo para productos

export default function CreateSaleForm() {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  //   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  //   const [editingProduct, setEditingProduct] = useState<
  //     SaleItemValues | undefined
  //   >(undefined)
  //   const [editingIndex, setEditingIndex] = useState<number | undefined>(
  //     undefined
  //   )

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      currency: 'PEN',
      reference_number: '',
      payment_method: 'efectivo',
      shipping_address: '',
      tax_rate: 0,
      date: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
      items: []
    }
  })

  const { watch, setValue, getValues } = form

  // Watch para cambios en tiempo real
  // const watchedItems: SelectedProductItem[] = watch('items')
  const watchedItems = getValues('items') as SaleItemValues[] | undefined
  console.log('Watched Items:', watchedItems)
  const watchedCurrency = watch('currency') as Currency
  //   const watchedTaxExempt = watch('tax_exempt') ?? false
  const watchedTaxExempt = 0
  const watchedTaxRate = watch('tax_rate')

  const currencySymbol = watchedCurrency === 'PEN' ? 'S/' : '$'
  const currencyName = watchedCurrency === 'PEN' ? 'Soles' : 'Dólares'

  // Generar número de referencia automáticamente
  useEffect(() => {
    const generateReference = () => {
      const date = new Date()
      const year = date.getFullYear().toString().slice(-2)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')
      return `VTA-${year}${month}${day}-${random}`
    }
    setValue('reference_number', generateReference())
  }, [setValue])

  // Calcular totales
  const { subtotal, totalDiscount, taxAmount, total } = useMemo(() => {
    const subtotal =
      watchedItems?.reduce(
        (sum, item) => sum + (item?.price_unit ?? 0) * (item?.quantity ?? 0),
        0
      ) ?? 0
    const totalDiscount =
      watchedItems?.reduce((sum, item) => sum + (item?.discount ?? 0), 0) ?? 0
    const taxAmount = watchedTaxExempt
      ? 0
      : (subtotal - totalDiscount) * watchedTaxRate
    const total = subtotal - totalDiscount + taxAmount

    return { subtotal, totalDiscount, taxAmount, total }
  }, [watchedItems, watchedTaxExempt, watchedTaxRate])

  const addedProductIds: string[] =
    watchedItems?.map((item) => item._temp_id || '') || []
  console.log('Added Product IDs:', addedProductIds)

  // Función para convertir CombinedResultPrice a SaleItemInput
  // const convertToSaleItem = (product: SelectedProductItem): SaleItemInput => {
  //   const isVariant = !!product.variant_id

  //   return {
  //     temp_id:
  //       product._temp_id ||
  //       `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  //     product_id: isVariant
  //       ? product.variant_id ?? ''
  //       : product.product_id ?? '',
  //     product_name: [
  //       product.brand?.name,
  //       product.product_description,
  //       isVariant && `${product.variant_name}`,
  //       isVariant && product.attributes && product.attributes.length > 0
  //         ? product.attributes
  //             .map((attr) => `${attr.attribute_value}`)
  //             .join(', ')
  //         : ''
  //     ]
  //       .filter(Boolean)
  //       .join(' '),
  //     quantity: 1,
  //     unit_price: product.price || 0,
  //     discount_amount: product.discount || 0,
  //     total_price: (product.price || 0) - (product.discount || 0)
  //   }
  // }

  //   const handleUpdateProduct = (index: number, updatedItem: SaleItemValues) => {
  //     const currentItems = getValues('items')
  //     const newItems = currentItems.map((item, i) =>
  //       i === index ? updatedItem : item
  //     )
  //     setValue('items', newItems, { shouldValidate: true })
  //     setIsEditModalOpen(false)
  //     setEditingProduct(undefined)
  //     setEditingIndex(undefined)
  //   }

  //   const handleEditProduct = (index: number) => {
  //     const productToEdit = watchedItems[index]
  //     setEditingProduct(productToEdit)
  //     setEditingIndex(index)
  //     setIsEditModalOpen(true)
  //   }

  const removeItem = (tempId: string) => {
    const currentItems = getValues('items')
    setValue(
      'items',
      currentItems?.filter((item) => item._temp_id !== tempId),
      { shouldValidate: true }
    )
  }

  //   const handleCloseEditModal = () => {
  //     setIsEditModalOpen(false)
  //     setEditingProduct(undefined)
  //     setEditingIndex(undefined)
  //   }

  const onSubmit = async (data: SaleFormValues) => {
    console.log('Datos del formulario:', data)
    const saleData: SaleValues = {
      customer_id: null, // Aquí puedes agregar el ID del cliente si es necesario
      reference_number: data.reference_number,
      date: data.date,
      payment_method: data.payment_method,
      shipping_address: data.shipping_address || '',
      discount_amount: totalDiscount,
      tax_amount: taxAmount,
      total_items: watchedItems?.length || 0,
      total_amount: total,
      salesperson_id: null, // Aquí puedes agregar el ID del vendedor si es necesario
      status: 'completed' // O el estado que desees
    }

    const items: ItemValues[] =
      watchedItems?.map((item: SaleItemValues) => ({
        product_id: item.product_id,
        product_variant_id: item.variant_id || null,
        quantity: item.quantity || 1,
        unit_price: item.price_unit || 0,
        discount_amount: item.discount || 0,
        total_price:
          (item.price_unit || 0) * (item.quantity || 1) - (item.discount || 0)
      })) || []

    const response = await createSale({
      items: items,
      saleData: saleData
    })

    if (response) {
      toast.success(
        <ToastCustom
          title="Venta creada exitosamente"
          message={`La venta con número de referencia ${data.reference_number} ha sido creada.`}
        />
      )
      // Aquí puedes manejar la respuesta, como redirigir o mostrar un mensaje de éxito
    } else {
      toast.error(
        <ToastCustom
          title="Error al crear la venta"
          message="Hubo un problema al crear la venta. Por favor, inténtalo de nuevo."
        />
      )
    }
  }

  // Handler principal que recibe SaleItemInput
  const handleAddProduct = (item: SelectedProductItem) => {
    const currentItems = getValues('items')
    setValue('items', [...(currentItems || []), item], {
      shouldValidate: true
    })
    setIsProductModalOpen(false)
  }

  // Adaptador para el modal que convierte CombinedResultPrice a SaleItemInput

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información de la venta */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-4 bg-white dark:bg-gray-800 border rounded-md">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
                    <ShoppingCart className="h-5 w-5" />
                    Información de la Venta
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Detalles generales de la venta
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Venta</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="w-full"
                              {...field}
                              value={field.value ? field.value : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div></div>
                    <div></div>
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
                                <SelectValue placeholder="Seleccionar moneda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PEN">
                                <div className="flex items-center gap-2">
                                  <span>🇵🇪</span>
                                  <span>Soles (S/)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="USD">
                                <div className="flex items-center gap-2">
                                  <span>🇺🇸</span>
                                  <span>Dólares ($)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reference_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Referencia</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="VTA-240101-001"
                              className="w-full"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Método de Pago</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar método" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="efectivo">Efectivo</SelectItem>
                              <SelectItem value="tarjeta_credito">
                                Tarjeta de Crédito
                              </SelectItem>
                              <SelectItem value="tarjeta_debito">
                                Tarjeta de Débito
                              </SelectItem>
                              <SelectItem value="transferencia">
                                Transferencia
                              </SelectItem>
                              <SelectItem value="yape">Yape</SelectItem>
                              <SelectItem value="plin">Plin</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* <FormField
                    control={form.control}
                    name="shipping_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección de Envío</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ingresa la dirección de envío..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  {/* Sección de IGV */}
                  {/* <div className="border-t pt-4">
                    <FormField
                      control={form.control}
                      name="tax_exempt"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Exonerar IGV
                            </FormLabel>
                            {watchedTaxExempt && (
                              <Badge
                                variant="secondary"
                                className="text-xs ml-6"
                              >
                                IGV Exonerado
                              </Badge>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />

                    {!watchedTaxExempt && (
                      <FormField
                        control={form.control}
                        name="tax_rate"
                        render={({ field }) => (
                          <FormItem className="max-w-xs">
                            <FormLabel>Tasa de IGV (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number.parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div> */}
                </div>
              </div>
              {/* Productos */}
              <div className="p-4 bg-white dark:bg-gray-800 border rounded-md grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">
                        Productos de la Venta
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {watchedItems && watchedItems?.length > 0
                        ? `${watchedItems?.length} producto${
                            watchedItems?.length !== 1 ? 's' : ''
                          } agregado${watchedItems?.length !== 1 ? 's' : ''}`
                        : 'No hay productos agregados'}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setIsProductModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Productos
                  </Button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4">
                  {form.formState.errors.items && (
                    <div className="text-sm font-medium text-destructive mb-4">
                      {form.formState.errors.items.message}
                    </div>
                  )}

                  {watchedItems && watchedItems?.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                                #
                              </th>
                              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                                Producto
                              </th>
                              <th className="text-center py-3 px-2 text-sm font-medium text-gray-700">
                                Cant.
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                P.Unit.
                              </th>

                              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                Subtotal
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                Desc.
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                                Total
                              </th>
                              <th className="text-center py-3 px-2 text-sm font-medium text-gray-700">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {watchedItems.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-100 hover:bg-gray-25"
                              >
                                <td className="py-3 px-2 text-sm text-gray-500">
                                  {index + 1}
                                </td>
                                <td className="py-3 px-2">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.brand?.name}{' '}
                                    {item.product_description}
                                    {item.variant_name && (
                                      <>{item.variant_name}</>
                                    )}{' '}
                                    {item.attributes &&
                                      item.attributes.length > 0 && (
                                        <>
                                          {item.attributes
                                            .map(
                                              (attr) =>
                                                `${attr.attribute_value}`
                                            )
                                            .join(', ')}
                                        </>
                                      )}
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <span className="text-sm font-medium">
                                    {item.quantity}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-right text-sm">
                                  {currencySymbol}
                                  {item?.price_unit?.toFixed(2)}
                                </td>
                                <td className="py-3 px-2 text-right text-sm font-semibold">
                                  {currencySymbol}
                                  {(
                                    (item?.price_unit ?? 0) *
                                    (item?.quantity ?? 0)
                                  ).toFixed(2)}
                                </td>
                                <td className="py-3 px-2 text-right">
                                  {item?.discount && item?.discount > 0 ? (
                                    <div>
                                      <div className="text-sm text-red-600 truncate">
                                        -{currencySymbol}
                                        {item?.discount?.toFixed(2)}
                                      </div>
                                      <div className="text-xs text-green-500">
                                        {(
                                          (item.discount /
                                            ((item?.price_unit ?? 0) *
                                              (item?.quantity ?? 0) || 1)) *
                                          100
                                        ).toFixed(1)}
                                        %
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-300 text-sm">
                                      -
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-2 text-right text-sm font-semibold">
                                  {currencySymbol}
                                  {item?.subtotal?.toFixed(2)}
                                </td>
                                <td className="py-3 px-2">
                                  <div className="flex justify-center gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                                      title="Editar"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                                      title="Eliminar"
                                      onClick={() =>
                                        removeItem(item._temp_id || '')
                                      }
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center justify-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-medium mb-2">
                          No hay productos agregados
                        </p>
                        <p className="text-sm mb-4">
                          Comienza agregando productos a tu venta
                        </p>
                        <Button
                          type="button"
                          onClick={() => setIsProductModalOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar Primer Producto
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen de totales */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Resumen de Venta
                  </CardTitle>
                  <CardDescription>Moneda: {currencyName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>
                        {currencySymbol}
                        {subtotal.toFixed(2)}
                      </span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Descuento:</span>
                        <span>
                          -{currencySymbol}
                          {totalDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {watchedTaxRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span
                          className={watchedTaxExempt ? 'text-gray-400' : ''}
                        >
                          IGV (
                          {watchedTaxExempt
                            ? 'Exonerado'
                            : `${(watchedTaxRate * 100).toFixed(0)}%`}
                          ):
                        </span>
                        <span
                          className={watchedTaxExempt ? 'text-gray-400' : ''}
                        >
                          {currencySymbol}
                          {taxAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>
                        {currencySymbol}
                        {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="text-sm text-gray-600">
                      <div>Productos: {watchedItems?.length || 0}</div>
                      <div>
                        Cantidad total:{' '}
                        {watchedItems?.reduce(
                          (sum, item) => sum + (item.quantity ?? 0),
                          0
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      watchedItems?.length === 0 || form.formState?.isSubmitting
                    }
                    size="lg"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {form.formState.isSubmitting ? 'Creando...' : 'Crear Venta'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      {/* Modal para agregar productos */}
      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddProduct={handleAddProduct} // ← Ahora los tipos coinciden
        addedProductIds={addedProductIds || []}
        currency={watchedCurrency}
      />

      {/* Modal para editar productos */}
      {/* <EditProductModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdateProduct={handleUpdateProduct}
        editingProduct={editingProduct}
        editingIndex={editingIndex}
        currency={watchedCurrency}
      /> */}
    </div>
  )
}
