'use client'
import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
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
  Plus,
  Trash2,
  Calculator,
  Package,
  Pencil,
  Shield
} from 'lucide-react'
import { saleFormSchema, SaleFormValues, SaleItemValues } from '../schemas'
import { Currency } from '@/types'
import ProductSelectionModal from './product-selection-modal'
import { SelectedProductItem } from './types'
import { SaleValues, ItemValues } from '../schemas'
import { createSale } from '@/apis/app/sales'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import { useRouter } from 'next/navigation'
import ConfirmationDialog from './confirmation-dialog'
import EditProductModal from './edit-product-modal'

import { getCustomers } from '@/apis/app/customers'
import { CustomerList } from '@/types'

export default function CreateSaleForm() {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false)
  const [customers, setCustomers] = useState<CustomerList[]>([])
  const [searchCustomer, setSearchCustomer] = useState('')
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<{
    item: SaleItemValues | null
    index: number | null
  }>({ item: null, index: null })
  const [applyTax, setApplyTax] = useState(false)
  const router = useRouter()
  const params = useParams()
  const businessId = params.uuid as string

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      currency: 'PEN',
      payment_method: 'efectivo',
      shipping_address: '',
      tax_rate: 0,
      date: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
      items: [],
      customer_id: ''
    }
  })

  // Update form tax_rate when checkbox changes
  useEffect(() => {
    const rate = applyTax ? 0.18 : 0
    form.setValue('tax_rate', rate)
  }, [applyTax, form])

  const { watch, setValue, getValues } = form

  // Watch para cambios en tiempo real
  // const watchedItems: SelectedProductItem[] = watch('items')
  const watchedItems = getValues('items') as SaleItemValues[] | undefined

  const watchedCurrency = watch('currency') as Currency
  const watchedTaxRate = watch('tax_rate')

  const currencySymbol = watchedCurrency === 'PEN' ? 'S/' : '$'
  const currencyName = watchedCurrency === 'PEN' ? 'Soles' : 'Dólares'

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true)
      try {
        const { data } = await getCustomers({ pageSize: 100 }) // Fetch enough customers for simple selection
        setCustomers(data)
      } catch (error) {
        console.error('Error fetching customers:', error)
      } finally {
        setIsLoadingCustomers(false)
      }
    }
    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(customer =>
    customer.person?.name.toLowerCase().includes(searchCustomer.toLowerCase())
  )

  // Calcular totales
  const { subtotal, totalDiscount, taxAmount, total } = useMemo(() => {
    const subtotal =
      watchedItems?.reduce(
        (sum, item) => sum + (item?.price_unit ?? 0) * (item?.quantity ?? 0),
        0
      ) ?? 0
    const totalDiscount =
      watchedItems?.reduce((sum, item) => sum + (item?.discount ?? 0), 0) ?? 0
    // taxAmount depends only on watchedTaxRate, which is controlled by applyTax
    const taxAmount = (subtotal - totalDiscount) * watchedTaxRate
    const total = subtotal - totalDiscount + taxAmount

    return { subtotal, totalDiscount, taxAmount, total }
  }, [watchedItems, watchedTaxRate])

  const addedProductIds: string[] =
    watchedItems?.map((item) => item._temp_id || '') || []

  const removeItem = (tempId: string) => {
    const currentItems = getValues('items')
    setValue(
      'items',
      currentItems?.filter((item) => item._temp_id !== tempId),
      { shouldValidate: true }
    )
  }

  const handleSubmitForm = async () => {
    setIsConfirmationDialogOpen(true)
  }

  const confirmSale = async () => {
    const data = getValues()
    const saleData: SaleValues = {
      business_id: businessId,
      customer_id: data.customer_id || null,
      date: data.date,
      payment_method: data.payment_method,
      shipping_address: data.shipping_address || '',
      discount_amount: totalDiscount,
      tax_amount: taxAmount,
      total_items: watchedItems?.length || 0,
      total_amount: total,
      salesperson_id: null,
      status: 'completed'
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

    try {
      const response = await createSale({
        items: items,
        saleData: saleData
      })

      if (response) {
        toast.success(
          <ToastCustom
            title="Venta creada exitosamente"
            message={`La venta ha sido creada exitosamente. COD. ${response.reference_number}`}
          />
        )
        router.push(`/dashboard/${businessId}/sales/${response.id}/edit`) // Redirect to edit/view
      }
    } catch {
      toast.error(
        <ToastCustom
          title="Error al crear la venta"
          message="Hubo un problema al crear la venta. Por favor, inténtalo de nuevo."
        />
      )
    } finally {
      setIsConfirmationDialogOpen(false)
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

  const handleUpdateProduct = (updatedItem: SaleItemValues) => {
    if (editingProduct.index !== null) {
      const currentItems = getValues('items')
      const newItems = currentItems?.map((item, i) =>
        i === editingProduct.index ? updatedItem : item
      )
      setValue('items', newItems, { shouldValidate: true })
    }
    setIsEditModalOpen(false)
    setEditingProduct({ item: null, index: null })
  }

  return (
    <div className="container mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmitForm)}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información de la venta */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-4 border rounded-md">
                <p className="text-sm mb-4">
                  Detalles generales de la venta
                </p>
                <hr className="my-4" />
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <FormField
                      control={form.control}
                      name="customer_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar cliente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <div className="p-2 sticky top-0 z-10 border-b">
                                <Input
                                  placeholder="Buscar cliente..."
                                  value={searchCustomer}
                                  onChange={(e) => setSearchCustomer(e.target.value)}
                                  className="h-8"
                                  autoFocus
                                />
                              </div>
                              <SelectItem value="null_value">Cliente Varios</SelectItem>
                              {filteredCustomers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.person?.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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

                  {/* Sección de IGV */}
                  <div className="border-t pt-4">
                    <div className="flex flex-row items-center space-x-3 mb-4">
                      <Checkbox
                        id="apply-tax-sale"
                        checked={applyTax}
                        onCheckedChange={(checked) => setApplyTax(!!checked)}
                      />
                      <div className="space-y-1 leading-none">
                        <label
                          htmlFor="apply-tax-sale"
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <Shield className="h-4 w-4" />
                          Aplicar IGV (18%)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Productos */}
              <div className="p-4 border rounded-md grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-2">
                      Productos: {` `}
                      {watchedItems && watchedItems?.length > 0
                        ? `${watchedItems?.length} producto${watchedItems?.length !== 1 ? 's' : ''
                        } agregado${watchedItems?.length !== 1 ? 's' : ''}`
                        : 'No hay productos agregados'}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setIsProductModalOpen(true)}
                    className="flex items-center gap-2"
                    size="sm"
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
                              <th className="text-left py-3 px-2 text-sm font-medium">
                                #
                              </th>
                              <th className="text-left py-3 px-2 text-sm font-medium">
                                Producto
                              </th>
                              <th className="text-center py-3 px-2 text-sm font-medium">
                                Cant.
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-medium">
                                P.Unit.
                              </th>

                              <th className="text-right py-3 px-2 text-sm font-medium">
                                Subtotal
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-medium">
                                Desc.
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-medium">
                                Total
                              </th>
                              <th className="text-center py-3 px-2 text-sm font-medium">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {watchedItems.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b"
                              >
                                <td className="py-3 px-2 text-xs">
                                  {index + 1}
                                </td>
                                <td className="py-3 px-2">
                                  <div className="text-xs font-medium ">
                                    {item.brand?.name}{' '}
                                    {item.product_description && item?.product_description.substring(0, 50)}
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
                                  <span className="text-xs font-medium">
                                    {item.quantity}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-right text-xs">
                                  {currencySymbol}
                                  {item?.price_unit?.toFixed(2)}
                                </td>
                                <td className="py-3 px-2 text-right text-xs font-semibold">
                                  {currencySymbol}
                                  {(
                                    (item?.price_unit ?? 0) *
                                    (item?.quantity ?? 0)
                                  ).toFixed(2)}
                                </td>
                                <td className="py-3 px-2 text-right">
                                  {item?.discount && item?.discount > 0 ? (
                                    <div>
                                      <div className="text-xs text-red-600 truncate">
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
                                    <span className="text-gray-300 text-xs">
                                      -
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-2 text-right text-xs font-semibold">
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
                                      onClick={() => {
                                        setEditingProduct({
                                          item: item,
                                          index: index
                                        })
                                        setIsEditModalOpen(true)
                                      }}
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
                    <div className="text-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                      <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-medium mb-2">
                          No hay productos agregados
                        </p>
                        <p className="text-xs mb-4">
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
                    <div className="flex justify-between text-sm">
                      <span>
                        IGV ({`${(watchedTaxRate * 100).toFixed(0)}%`}):
                      </span>
                      <span>
                        {currencySymbol}
                        {taxAmount.toFixed(2)}
                      </span>
                    </div>
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
                    <div className="text-sm">
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
        onAddProduct={handleAddProduct}
        addedProductIds={addedProductIds || []}
        currency={watchedCurrency}
        businessId={businessId}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingProduct({ item: null, index: null })
        }}
        currency={watchedCurrency}
        onUpdateProduct={handleUpdateProduct}
        product={editingProduct.item}
      />

      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={() => setIsConfirmationDialogOpen(false)}
        currency={watchedCurrency}
        onConfirm={confirmSale}
        saleData={getValues() as SaleFormValues}
        totals={{ subtotal, totalDiscount, taxAmount, total }}
        isSubmitting={form.formState.isSubmitting}
      />
    </div >
  )
}
