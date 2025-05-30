/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useSuppliers } from '@/hooks/use-suppliers'
import {
  PurchaseSchema,
  type CreatePurchaseData,
  PurchaseItem
} from '../schemas'
import { generatePurchaseCode } from './generate-code'
import { Product } from '@/types'
import { ProductSelectorModal } from './product-selector-modal'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import { APP_URLS } from '@/config/app-urls'
import { createPurchaseWithItems } from '@/apis/app'

export const NewPurchasePage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [searchSupplier, setSearchSupplier] = useState<string>('')
  const router = useRouter()

  const { suppliers } = useSuppliers()

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchSupplier.toLowerCase())
  )

  const form = useForm<CreatePurchaseData>({
    resolver: zodResolver(PurchaseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      supplier_id: '',
      guide_number: '',
      code: '',
      subtotal: 0,
      discount: 0,
      tax_rate: 18, // IGV por defecto 18%
      tax_amount: 0,
      total_amount: 0,
      items: []
    }
  })

  useEffect(() => {
    generateCode()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [purchaseItems, form.watch('discount'), form.watch('tax_rate')])

  const generateCode = () => {
    const newCode = generatePurchaseCode()
    form.setValue('code', newCode)
  }

  const calculateTotals = () => {
    const subtotal = purchaseItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    )
    const discount = form.getValues('discount') || 0
    const taxRate = form.getValues('tax_rate') || 0

    const subtotalAfterDiscount = subtotal - discount
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100
    const total = subtotalAfterDiscount + taxAmount

    form.setValue('subtotal', subtotal)
    form.setValue('tax_amount', taxAmount)
    form.setValue('total_amount', total)
    form.setValue('items', purchaseItems)
  }

  const handleAddProduct = (product: Product) => {
    const existingItem = purchaseItems.find(
      (item) => item.product_id === product.id
    )

    if (existingItem) {
      toast.error(
        <ToastCustom
          title="Producto ya agregado"
          message="Este producto ya está en la lista de compra."
        />
      )
      return
    }

    const newItem: PurchaseItem = {
      product_id: product.id,
      quantity: 1,
      price: 0,
      purchase_id: null,
      product: {
        id: product.id,
        name: product.name,
        unit: product.unit,
        brand: product.brand,
        code: product.code
      }
    }

    setPurchaseItems([...purchaseItems, newItem])
  }

  const handleUpdateItem = (
    index: number,
    field: 'quantity' | 'price',
    value: number
  ) => {
    const updatedItems = [...purchaseItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setPurchaseItems(updatedItems)
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = purchaseItems.filter((_, i) => i !== index)
    setPurchaseItems(updatedItems)
  }

  const onSubmit = async (data: CreatePurchaseData) => {
    if (purchaseItems.length === 0) {
      toast.error(
        <ToastCustom
          title="No hay productos"
          message="Debe agregar al menos un producto a la compra."
        />
      )
      return
    }

    setIsLoading(true)
    try {
      const response = await createPurchaseWithItems({
        itemsData: purchaseItems,
        purchaseData: {
          ...data,
          date: new Date(data.date).toISOString(),
          code: data.code || generatePurchaseCode(),
          subtotal: form.getValues('subtotal'),
          discount: form.getValues('discount') || 0,
          total_amount: form.getValues('total_amount') || 0
        }
      })

      if (response.status === 'error') {
        toast.error(
          <ToastCustom
            title="Error al registrar la compra"
            message={
              response.error || 'Ocurrió un error al procesar la compra.'
            }
          />
        )
      } else {
        toast.success(
          <ToastCustom
            title="Compra registrada"
            message="La compra se ha registrado exitosamente."
          />
        )
        if (response.data) {
          router.push(APP_URLS.PURCHASES.VIEW(response.data.id))
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al registrar la compra'
      toast.error(
        <ToastCustom
          title="Error al registrar la compra"
          message={errorMessage}
        />
      )
    } finally {
      setIsLoading(false)
    }
  }

  const selectedProductIds = purchaseItems.map((item) => item.product_id)

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-6xl mx-auto p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-12"
          >
            {/* Información básica */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Información básica
                </h2>
                <p className="text-gray-600 mt-1">
                  Datos principales de la compra
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Código de compra
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input {...field} readOnly className="bg-gray-50" />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateCode}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Fecha de compra *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          //   value={field.value.toISOString().split('T')[0]}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Proveedor
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder="Seleccionar proveedor"
                              className="w-full"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="p-2">
                            <Input
                              placeholder="Buscar proveedor..."
                              value={searchSupplier}
                              onChange={(e) =>
                                setSearchSupplier(e.target.value)
                              }
                              className="mb-2"
                              autoFocus
                            />
                          </div>
                          {filteredSuppliers.length > 0 ? (
                            filteredSuppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">
                              No se encontraron proveedores
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guide_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Número de guía
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 001-001-000123" {...field} />
                      </FormControl>
                      <FormDescription>
                        Número de guía de remisión (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Productos */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Productos
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Agrega los productos de esta compra
                  </p>
                </div>
                <Button type="button" onClick={() => setProductModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>

              {purchaseItems.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Producto</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio Unitario</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.product?.name}
                          </TableCell>
                          <TableCell>{item.product?.code}</TableCell>
                          <TableCell>
                            {item.product?.brand || 'Sin marca'}
                          </TableCell>
                          <TableCell>{item.product?.unit}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  'quantity',
                                  Number(e.target.value)
                                )
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  'price',
                                  Number(e.target.value)
                                )
                              }
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            S/ {(item.quantity * item.price).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">
                    No hay productos agregados
                  </p>
                  <Button
                    type="button"
                    onClick={() => setProductModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar primer producto
                  </Button>
                </div>
              )}
            </section>

            {/* Totales */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Totales</h2>
                <p className="text-gray-600 mt-1">
                  Cálculo de descuentos e impuestos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Descuento
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Descuento en soles (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          IGV (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Porcentaje de IGV (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      S/ {form.watch('subtotal').toFixed(2)}
                    </span>
                  </div>
                  {(form.watch('discount') ?? 0) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Descuento:</span>
                      <span>
                        -S/ {(form.watch('discount') ?? 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {(form.watch('tax_amount') ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>IGV ({form.watch('tax_rate') ?? 0}%):</span>
                      <span>
                        S/ {(form.watch('tax_amount') ?? 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>S/ {form.watch('total_amount').toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <Link href="/purchases">
                <Button type="button" variant="outline" size="lg">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading || purchaseItems.length === 0}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Registrando compra...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Registrar Compra
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Modal de selección de productos */}
        <ProductSelectorModal
          open={productModalOpen}
          onOpenChange={setProductModalOpen}
          onSelectProduct={handleAddProduct}
          selectedProductIds={selectedProductIds}
        />
      </div>
    </div>
  )
}
