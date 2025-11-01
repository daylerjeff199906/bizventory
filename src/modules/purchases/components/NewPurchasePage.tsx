/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Edit,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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

import { useSuppliers } from '@/hooks/use-suppliers'
import {
  PurchaseFormSchema,
  PurchaseSchema,
  type PurchaseFormData,
  type CreatePurchaseData,
  type PurchaseItem
} from '@/modules/purchases/schemas'
import { generatePurchaseCode } from './generate-code'
import { ProductSelectorModal } from './product-selector-modal'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import { APP_URLS } from '@/config/app-urls'
import { createPurchaseWithItems } from '@/apis/app'
import type { CombinedResult } from '@/apis/app/productc.variants.list'
import { formatCurrencySoles } from '@/utils'

// Función para generar código de producto aleatorio
const generateProductCode = (): string => {
  const prefix = 'PROD'
  const timestamp = Date.now().toString().slice(-4)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `${prefix}-${timestamp}${random}`
}

interface EditItemDialogProps {
  item: PurchaseItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedItem: PurchaseItem) => void
}

const EditItemDialog = ({
  item,
  open,
  onOpenChange,
  onSave
}: EditItemDialogProps) => {
  const [editData, setEditData] = useState<Partial<PurchaseItem>>({})
  const [includeBarCode, setIncludeBarCode] = useState(false)

  useEffect(() => {
    if (item) {
      setEditData({
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        code: item.code || '',
        bar_code: item.bar_code || ''
      })
      setIncludeBarCode(!!item.bar_code)
    }
  }, [item])

  const handleSave = () => {
    if (!item) return

    const updatedItem: PurchaseItem = {
      ...item,
      quantity: editData.quantity || item.quantity,
      price: editData.price || item.price,
      discount: editData.discount || 0,
      code: editData.code,
      bar_code: includeBarCode ? editData.bar_code : undefined
    }

    onSave(updatedItem)
    onOpenChange(false)
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Modifica los detalles del producto en la compra
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Producto</label>
            <p className="text-sm text-gray-600">
              {item.product?.brand} {item.product?.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={editData.quantity || ''}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value)
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Precio Unitario</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editData.price || ''}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    price: Number(e.target.value)
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descuento (S/)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={editData.discount || ''}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  discount: Number(e.target.value) || 0
                }))
              }
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-barcode"
                checked={includeBarCode}
                onCheckedChange={(checked) => setIncludeBarCode(!!checked)}
              />
              <label htmlFor="include-barcode" className="text-sm font-medium">
                Incluir código
              </label>
            </div>

            {includeBarCode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Código de item</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Se generará automáticamente si está vacío"
                    value={editData.bar_code || ''}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        bar_code: e.target.value
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setEditData((prev) => ({
                        ...prev
                      }))
                    }
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {typeof editData.quantity === 'number' &&
            editData.quantity > 0 &&
            typeof editData.price === 'number' && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>
                    {formatCurrencySoles(
                      Number(editData.quantity) * Number(editData.price)
                    )}
                  </span>
                </div>
                {(editData.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Descuento:</span>
                    <span>
                      -{formatCurrencySoles(Number(editData.discount) || 0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span>Total:</span>
                  <span>
                    {formatCurrencySoles(
                      Number(editData.quantity) * Number(editData.price) -
                        (Number(editData.discount) || 0)
                    )}
                  </span>
                </div>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface NewPurchasePageProps {
  businessId?: string
}

export const NewPurchasePage = (props: NewPurchasePageProps) => {
  const { businessId } = props
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PurchaseItem | null>(null)
  const [searchSupplier, setSearchSupplier] = useState<string>('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  )

  const router = useRouter()
  const { suppliers } = useSuppliers({ businessId })

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchSupplier.toLowerCase())
  )

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(PurchaseFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      business_id: businessId || '',
      supplier_id: '',
      guide_number: '',
      reference_number: '',
      subtotal: 0,
      discount: 0,
      tax_rate: 18,
      tax_amount: 0,
      total_amount: 0,
      status: 'draft',
      payment_status: 'pending',
      notes: '',
      inventory_updated: false,
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
    const subtotal = purchaseItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price - (item.discount || 0)
      return sum + itemTotal
    }, 0)
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

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleAddProduct = (product: CombinedResult) => {
    // Si el producto tiene variantes, agregamos el producto como cabecera
    if (
      product.has_variants &&
      product.variants &&
      product.variants.length > 0
    ) {
      // Verificar si el producto ya existe como cabecera
      const existingProductHeader = purchaseItems.find(
        (item) => item.product_id === product.id && item.is_product_header
      )

      if (!existingProductHeader) {
        const tempId = `${product.id}-header-${Date.now()}`

        const productHeader: PurchaseItem = {
          product_id: product.id,
          product_variant_id: null,
          quantity: 0, // La cabecera no tiene cantidad
          price: 0, // La cabecera no tiene precio
          discount: 0,
          purchase_id: null,
          code: '',
          _temp_id: tempId,
          product: {
            id: product.id,
            name: product.name,
            unit: product.unit,
            brand: product.brand?.name || 'Sin marca',
            description: product.description || null
          },
          original_product_name: product.description,
          is_product_header: true, // Marcar como cabecera
          has_variants: true
        }

        setPurchaseItems((prev) => [...prev, productHeader])
        setExpandedProducts((prev) => new Set(prev).add(product.id))
      }
    } else {
      // Producto sin variantes - agregar directamente
      const tempId = `${product.id}-no-variant-${Date.now()}`

      const newItem: PurchaseItem = {
        product_id: product.id,
        product_variant_id: null,
        quantity: 1,
        price: 0,
        discount: 0,
        purchase_id: null,
        code: generateProductCode(),
        _temp_id: tempId,
        product: {
          id: product.id,
          name: product.name,
          unit: product.unit,
          brand: product.brand?.name || 'Sin marca',
          description: product.description || null
        },
        original_product_name: product.description,
        has_variants: false
      }

      setPurchaseItems((prev) => [...prev, newItem])
    }
  }

  // const handleAddVariant = (
  //   product: CombinedResult,
  //   variant: ProductVariantItem
  // ) => {
  //   const tempId = `${variant.id}-variant-${Date.now()}`

  //   const variantItem: PurchaseItem = {
  //     product_id: product.id,
  //     product_variant_id: variant.id,
  //     quantity: 1,
  //     price: 0,
  //     discount: 0,
  //     purchase_id: null,
  //     code: generateProductCode(),
  //     _temp_id: tempId,
  //     product: {
  //       id: product.id,
  //       name: product.name,
  //       unit: product.unit,
  //       brand: product.brand?.name || 'Sin marca',
  //       description: product.description || null
  //     },
  //     variant: {
  //       id: variant.id,
  //       name: variant.name,
  //       attributes: variant.attributes || []
  //     },
  //     original_product_name: product.description,
  //     original_variant_name: variant.name,
  //     variant_attributes: variant.attributes || [],
  //     has_variants: true
  //   }

  //   setPurchaseItems((prev) => [...prev, variantItem])
  // }

  const handleEditItem = (item: PurchaseItem, index: number) => {
    // No permitir editar cabeceras de productos
    if (item.is_product_header) return

    setEditingItem({ ...item, _index: index })
    setEditDialogOpen(true)
  }

  const handleSaveEditedItem = (updatedItem: PurchaseItem) => {
    const updatedItems = purchaseItems.map((item) => {
      return item._temp_id === editingItem?._temp_id ? updatedItem : item
    })
    setPurchaseItems(updatedItems)
  }

  const handleRemoveItem = (itemToRemove: PurchaseItem, index: number) => {
    // Si es una cabecera, eliminar también todas sus variantes
    if (itemToRemove.is_product_header) {
      const updatedItems = purchaseItems.filter(
        (item) =>
          item.product_id !== itemToRemove.product_id || item.is_product_header
      )
      setPurchaseItems(updatedItems)
      // Remover del conjunto de expandidos
      setExpandedProducts((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemToRemove.product_id!)
        return newSet
      })
    } else {
      // Eliminar item individual
      const updatedItems = purchaseItems.filter(
        (item, i) => !(i === index && item._temp_id === itemToRemove._temp_id)
      )
      setPurchaseItems(updatedItems)
    }
  }

  const handleSubmitForm = () => {
    // Filtrar solo los items que no son cabeceras y tienen cantidad > 0
    const validItems = purchaseItems.filter(
      (item) => !item.is_product_header && item.quantity > 0
    )

    if (validItems.length === 0) {
      toast.error(
        <ToastCustom
          title="No hay productos"
          message="Debe agregar al menos un producto a la compra."
        />
      )
      return
    }

    const formData = form.getValues()
    const dataWithItems = { ...formData, items: validItems }

    const validation = PurchaseSchema.safeParse(dataWithItems)
    if (!validation.success) {
      toast.error(
        <ToastCustom
          title="Error de validación"
          message="Por favor revisa los datos del formulario."
        />
      )
      return
    }

    setConfirmOpen(true)
  }

  const confirmPurchase = async () => {
    const data = form.getValues()
    setIsLoading(true)
    setConfirmOpen(false)

    try {
      // Filtrar solo los items que no son cabeceras
      const validItems = purchaseItems.filter((item) => !item.is_product_header)

      const purchaseData: CreatePurchaseData = {
        ...data,
        items: validItems,
        date: new Date(data.date).toISOString(),
        subtotal: form.getValues('subtotal')
      }

      const response = await createPurchaseWithItems({
        itemsData: validItems,
        purchaseData
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

  const selectedProductIds = purchaseItems.map((item) => ({
    productId: typeof item.product_id === 'string' ? item.product_id : null,
    variantId:
      typeof item.product_variant_id === 'string'
        ? item.product_variant_id
        : null
  }))

  // Agrupar variantes por producto
  const productVariantsMap = new Map()
  purchaseItems.forEach((item) => {
    if (!item.is_product_header && item.product_variant_id) {
      if (!productVariantsMap.has(item.product_id)) {
        productVariantsMap.set(item.product_id, [])
      }
      productVariantsMap.get(item.product_id).push(item)
    }
  })

  return (
    <div className="min-h-screen bg-white">
      <div>
        {/* Indicaciones para el registro de compras */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            Indicaciones para registrar una compra
          </h3>
          <ul className="list-disc pl-6 text-blue-900 space-y-1 text-sm">
            <li>
              El <span className="font-medium">número de guía</span> debe
              corresponder al documento de la compra (guía, boleta, factura,
              etc).
            </li>
            <li>
              El <span className="font-medium">estado de la compra</span>{' '}
              controla si afecta el inventario: solo en estado{' '}
              <span className="font-medium text-green-700">completada</span> se
              actualiza el stock.
            </li>
            <li>
              Los <span className="font-medium">productos con variantes</span>{' '}
              aparecen como cabeceras. Haz clic para expandir y agregar
              variantes específicas.
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitForm)}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                {supplier.name} ({supplier.document_type}{' '}
                                {supplier.document_number ||
                                  'Sin # de documento'}
                                )
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">
                              No se encontraron proveedores
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecciona el proveedor de la compra
                      </FormDescription>
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
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                      <FormDescription>
                        Fecha en la que se realizó la compra
                      </FormDescription>
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
                        Número de guía de remisión (O boleta de compras)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Estado de la compra
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="completed">Completada</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Estado actual de la compra
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Estado del pago
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar estado de pago" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="partial">Parcial</SelectItem>
                          <SelectItem value="paid">Pagado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Estado del pago de la compra
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
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead>Descuento</TableHead>
                        <TableHead>Subtotal</TableHead>
                        {purchaseItems.some((item) => item.bar_code) && (
                          <TableHead>Código Barras</TableHead>
                        )}
                        <TableHead className="w-20">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseItems.map((item, index) => {
                        const isHeader = item.is_product_header
                        const isExpanded = expandedProducts.has(
                          item.product_id!
                        )
                        const variants =
                          productVariantsMap.get(item.product_id) || []
                        const selectedVariantsCount = variants.length
                        const totalVariantsCount = item.variants_count || 0

                        if (isHeader) {
                          return (
                            <>
                              <TableRow
                                key={item._temp_id}
                                className="bg-gray-50"
                              >
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      toggleProductExpansion(item.product_id!)
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell
                                  colSpan={isExpanded ? 1 : 6}
                                  className="font-medium"
                                >
                                  <div className="flex items-center">
                                    <span className="ml-2">
                                      {item.product?.brand}{' '}
                                      {item.product?.description}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                                      {selectedVariantsCount} de{' '}
                                      {totalVariantsCount} variantes
                                      seleccionadas
                                    </span>
                                  </div>
                                </TableCell>
                                {!isExpanded && (
                                  <TableCell colSpan={3} className="text-right">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveItem(item, index)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                              {isExpanded &&
                                variants.map((variant: PurchaseItem) => (
                                  <TableRow
                                    key={variant._temp_id}
                                    className="bg-white"
                                  >
                                    <TableCell></TableCell>
                                    <TableCell className="pl-8">
                                      <div className="flex flex-col">
                                        <span className="text-sm">
                                          {variant.variant?.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {variant.variant_attributes
                                            ?.map(
                                              (attr) =>
                                                `${attr.attribute_value}`
                                            )
                                            .join(', ')}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {variant.product?.unit}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      {variant.quantity}
                                    </TableCell>
                                    <TableCell className="font-medium text-right">
                                      {formatCurrencySoles(variant.price)}
                                    </TableCell>
                                    <TableCell className="text-red-600 text-right">
                                      {variant.discount
                                        ? formatCurrencySoles(variant.discount)
                                        : '-'}
                                    </TableCell>
                                    <TableCell className="font-medium text-right">
                                      {formatCurrencySoles(
                                        variant.quantity * variant.price -
                                          (variant.discount || 0)
                                      )}
                                    </TableCell>
                                    {purchaseItems.some(
                                      (item) => item.bar_code
                                    ) && (
                                      <TableCell className="text-xs text-gray-500">
                                        {variant.bar_code ? (
                                          <span className="bg-gray-100 px-2 py-1 rounded">
                                            {variant.bar_code}
                                          </span>
                                        ) : (
                                          '-'
                                        )}
                                      </TableCell>
                                    )}
                                    <TableCell>
                                      <div className="flex gap-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleEditItem(variant, index)
                                          }
                                          className="cursor-pointer"
                                        >
                                          <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleRemoveItem(variant, index)
                                          }
                                          className="cursor-pointer"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </>
                          )
                        }

                        // Productos sin variantes
                        return (
                          <TableRow key={item._temp_id}>
                            <TableCell></TableCell>
                            <TableCell>
                              <p className="text-sm break-words whitespace-normal line-clamp-3 uppercase">
                                {item.product?.brand || ''}{' '}
                                {item.product?.name && (
                                  <> {item.product.name}</>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 break-words whitespace-normal line-clamp-2">
                                {item.product?.description && (
                                  <> {item.product.description}</>
                                )}
                              </p>
                            </TableCell>
                            <TableCell>{item.product?.unit}</TableCell>
                            <TableCell className="font-medium">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="font-medium text-right">
                              {formatCurrencySoles(item.price)}
                            </TableCell>
                            <TableCell className="text-red-600 text-right">
                              {item.discount
                                ? formatCurrencySoles(item.discount)
                                : '-'}
                            </TableCell>
                            <TableCell className="font-medium text-right">
                              {formatCurrencySoles(
                                item.quantity * item.price -
                                  (item.discount || 0)
                              )}
                            </TableCell>
                            {purchaseItems.some((item) => item.bar_code) && (
                              <TableCell className="text-xs text-gray-500">
                                {item.bar_code ? (
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    {item.bar_code}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            )}
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditItem(item, index)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item, index)}
                                  className="cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
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
                          Descuento General
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Descuento general en soles (adicional a descuentos por
                          producto)
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
                            value={field.value || ''}
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
                    <span>Subtotal (con descuentos por producto):</span>
                    <span className="font-medium">
                      {formatCurrencySoles(form.watch('subtotal') || 0)}
                    </span>
                  </div>
                  {(form.watch('discount') || 0) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Descuento general:</span>
                      <span>
                        -{formatCurrencySoles(form.watch('discount') || 0)}
                      </span>
                    </div>
                  )}
                  {(form.watch('tax_amount') || 0) > 0 && (
                    <div className="flex justify-between">
                      <span>IGV ({form.watch('tax_rate') || 0}%):</span>
                      <span>
                        {formatCurrencySoles(form.watch('tax_amount') || 0)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>
                        {formatCurrencySoles(form.watch('total_amount') || 0)}
                      </span>
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
                disabled={
                  isLoading ||
                  purchaseItems.filter(
                    (item) => !item.is_product_header && item.quantity > 0
                  ).length === 0
                }
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

        <ProductSelectorModal
          businessId={businessId || null}
          open={productModalOpen}
          onOpenChange={setProductModalOpen}
          onSelectProduct={handleAddProduct}
          selectedProductIds={selectedProductIds}
        />

        <EditItemDialog
          item={editingItem}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveEditedItem}
        />

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar compra</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro que deseas registrar esta compra por un total de
                S/ {(form.watch('total_amount') || 0).toFixed(2)}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmPurchase}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
