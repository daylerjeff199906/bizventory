/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  Trash2,
  Search,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  Package,
  ShoppingCart,
  User,
  Calendar,
  FileText,
  BadgeInfo,
  Clock,
  Pencil
} from 'lucide-react'

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useSuppliers } from '@/hooks/use-suppliers'
import { useProductsPrices } from '@/hooks/use-products-price'
import {
  PurchaseFormSchema,
  type PurchaseFormData,
  type CreatePurchaseData,
  type PurchaseItem
} from '@/modules/purchases/schemas'
import { createPurchaseWithItems } from '@/apis/app'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import { APP_URLS } from '@/config/app-urls'
import { formatCurrencySoles } from '@/utils'
import { useDebouncedCallback } from 'use-debounce'
import {
  transformProductsToCombinedSelection,
  ProductItem
} from '@/modules/sales/components/product-selection-modal'
import { ProductCombinedSelection } from '@/modules/sales/components/types'
import EditPurchaseItemModal from './EditPurchaseItemModal'

interface NewPurchasePageProps {
  businessId?: string
}

export const NewPurchasePage = (props: NewPurchasePageProps) => {
  const { businessId } = props
  const [isReviewing, setIsReviewing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchSupplier, setSearchSupplier] = useState('')
  const [editingItem, setEditingItem] = useState<{ item: PurchaseItem | null, index: number | null }>({ item: null, index: null })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const router = useRouter()
  const { suppliers } = useSuppliers({ businessId })

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setProductSearchTerm(value)
  }, 300)

  const { items: productsResponse, loading: productsLoading, fetchItems } = useProductsPrices()

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
      tax_rate: 0,
      tax_amount: 0,
      total_amount: 0,
      status: 'completed',
      payment_status: 'pending',
      notes: '',
      inventory_updated: false,
      items: []
    }
  })

  // Fetch products
  useEffect(() => {
    if (businessId) {
      fetchItems({ searchQuery: productSearchTerm, page: 1, pageSize: 40, businessId })
    }
  }, [productSearchTerm, businessId])

  const listGeneralProducts = transformProductsToCombinedSelection(
    productsResponse?.data || []
  )

  const watchedItems = form.watch('items') as PurchaseItem[]
  const watchedDiscount = form.watch('discount') || 0
  const watchedTaxRate = form.watch('tax_rate') || 0

  // Totals calculations
  const { subtotal, taxAmount, total } = useMemo(() => {
    const subtotal = watchedItems?.reduce((sum, item) => {
      return sum + (item.price * item.quantity) - (item.discount || 0)
    }, 0) || 0

    const subtotalAfterDiscount = subtotal - watchedDiscount
    const taxAmount = (subtotalAfterDiscount * watchedTaxRate) / 100
    const total = subtotalAfterDiscount + taxAmount

    return { subtotal, taxAmount, total }
  }, [watchedItems, watchedDiscount, watchedTaxRate])

  useEffect(() => {
    form.setValue('subtotal', subtotal)
    form.setValue('tax_amount', taxAmount)
    form.setValue('total_amount', total)
  }, [subtotal, taxAmount, total])

  const handleProductSelect = (product: ProductCombinedSelection) => {
    const currentItems = [...(form.getValues('items') || [])]
    const existingIndex = currentItems.findIndex(item => item._temp_id === product._temp_id)

    if (existingIndex >= 0) {
      // Toggle: Remove if already selected
      const newItems = currentItems.filter((_, i) => i !== existingIndex)
      form.setValue('items', newItems, { shouldValidate: true })
    } else {
      // Add new item
      const newItem: PurchaseItem = {
        product_id: product.product_id,
        product_variant_id: product.variant_id || null,
        quantity: 1,
        price: product.price_unit || 0,
        discount: 0,
        _temp_id: product._temp_id,
        original_product_name: product.product_name,
        original_variant_name: product.variant_name,
        // UI Helpers
        name: product.product_name,
        brand: product.brand,
        unit: product.unit,
        description: product.product_description,
        attributes: product.attributes,
        images: product.image_url ? [product.image_url] : []
      }
      form.setValue('items', [...currentItems, newItem], { shouldValidate: true })
    }
  }

  const updateQuantity = (tempId: string, delta: number) => {
    const currentItems = [...form.getValues('items')]
    const index = currentItems.findIndex(item => item._temp_id === tempId)
    if (index === -1) return

    const newQuantity = (currentItems[index].quantity || 0) + delta

    if (newQuantity <= 0) {
      removeItem(tempId)
    } else {
      currentItems[index].quantity = newQuantity
      form.setValue('items', currentItems, { shouldValidate: true })
    }
  }

  const updateItemField = (index: number, field: keyof PurchaseItem, value: any) => {
    const currentItems = [...form.getValues('items')]
    currentItems[index] = { ...currentItems[index], [field]: value }
    form.setValue('items', currentItems, { shouldValidate: true })
  }

  const handleEditItem = (index: number) => {
    setEditingItem({ item: watchedItems[index], index })
    setIsEditModalOpen(true)
  }

  const handleUpdateItem = (updatedItem: PurchaseItem) => {
    if (editingItem.index !== null) {
      updateItemField(editingItem.index, 'price', updatedItem.price)
      updateItemField(editingItem.index, 'quantity', updatedItem.quantity)
      updateItemField(editingItem.index, 'discount', updatedItem.discount)
      updateItemField(editingItem.index, 'bar_code', updatedItem.bar_code)
    }
  }

  const removeItem = (tempId: string) => {
    const newItems = (form.getValues('items') || []).filter((item) => item._temp_id !== tempId)
    form.setValue('items', newItems, { shouldValidate: true })
  }

  const onSubmitReview = async () => {
    const isValid = await form.trigger(['supplier_id', 'date', 'items'])
    if (!isValid) {
      toast.error('Por favor completa los campos obligatorios.')
      return
    }
    if (watchedItems.length === 0) {
      toast.error('Agrega al menos un producto a la compra.')
      return
    }
    setIsReviewing(true)
  }

  const confirmPurchase = async () => {
    setIsLoading(true)
    try {
      const data = form.getValues()
      const purchaseData: CreatePurchaseData = {
        ...data,
        items: watchedItems,
        business_id: String(businessId),
        date: new Date(data.date).toISOString(),
      }

      const response = await createPurchaseWithItems({
        itemsData: watchedItems,
        purchaseData
      })

      if (response.status === 'success' && response.data) {
        toast.success(
          <ToastCustom
            title="Compra registrada"
            message="La compra se ha procesado correctamente."
          />
        )
        router.push(APP_URLS.ORGANIZATION.PURCHASES.VIEW(businessId || '', response.data.id))
      } else {
        throw new Error(response.error || 'Error al guardar la compra')
      }
    } catch (error) {
      toast.error(
        <ToastCustom
          title="Error"
          message={error instanceof Error ? error.message : 'No se pudo completar la compra'}
        />
      )
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchSupplier.toLowerCase())
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-muted/10 lg:h-[calc(100vh-80px)] lg:overflow-hidden relative">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="contents">

          {/* COLUMNA IZQUIERDA: Selección de Productos o Revisión */}
          <div className="flex-1 flex flex-col bg-background rounded-xl border shadow-sm lg:overflow-hidden min-w-0">
            {!isReviewing ? (
              <>
                {/* Cabecera de búsqueda */}
                <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/20">
                  <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, código o marca..."
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value)
                        debouncedSearch(e.target.value)
                      }}
                      className="pl-9 w-full bg-background border-muted-foreground/20 focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /> {listGeneralProducts.length} productos
                  </div>
                </div>

                <div className="flex-1 relative min-h-0">
                  <ScrollArea className="lg:h-[calc(100vh-250px)]" type="always">
                    {productsLoading ? (
                      <div className="flex items-center justify-center py-20 h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : listGeneralProducts.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12 mr-4">
                        {listGeneralProducts.map((product, index) => {
                          const isSelected = watchedItems?.some(i => i._temp_id === product._temp_id)
                          const addedItem = watchedItems?.find(i => i._temp_id === product._temp_id)

                          return (
                            <div key={`${product._temp_id}-${index}`} className="relative group">
                              <ProductItem
                                product={product}
                                onSelect={handleProductSelect}
                                isSelected={isSelected}
                                isConfiguring={false}
                                currency="PEN"
                                allowSelectionWhenOutOfStock={true}
                              />
                              {isSelected && addedItem && (
                                <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-md">
                                  {addedItem.quantity} en lista
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-70 py-6">
                        <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">No se encontraron productos</h3>
                        <p className="text-muted-foreground text-sm">Prueba ajustando tu búsqueda</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </>
            ) : (
              /* MODO REVISIÓN */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Revisión de Compra
                    </h2>
                    <p className="text-xs text-muted-foreground">Ajusta los precios y cantidades finales.</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReviewing(false)}
                    className="gap-2 hover:bg-background h-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Regresar a editar
                  </Button>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <ScrollArea className="lg:h-[calc(100vh-250px)]">
                    <div className="p-6 space-y-4 text-left">
                      {watchedItems.map((item, index) => (
                        <Card key={`${item._temp_id}-${index}`} className="p-4 shadow-none border-muted-foreground/10 hover:border-primary/30 transition-all group text-left">
                          <div className="flex gap-6 items-start">
                            <div className="h-20 w-20 bg-muted rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border shadow-sm">
                              {item.images && item.images[0] ? (
                                <img src={item.images[0]} alt={item.name || ''} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="h-8 w-8 text-muted-foreground/20" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-lg leading-tight uppercase truncate">{item.name}</h3>
                                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.brand?.name} · {item.unit}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-black text-primary">
                                    {formatCurrencySoles(item.price * item.quantity - (item.discount || 0))}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Item</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-3 bg-muted/40 p-1 rounded-full border px-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-background shadow-sm"
                                      onClick={() => updateQuantity(item._temp_id || '', -1)}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-background shadow-sm"
                                      onClick={() => updateQuantity(item._temp_id || '', 1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground">Costo</span>
                                    <span className="text-sm font-bold">{formatCurrencySoles(item.price)}</span>
                                  </div>

                                  {item?.discount && item?.discount?.toString() !== "0" && (
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black uppercase text-destructive">Descuento</span>
                                      <span className="text-sm font-bold text-destructive">-{formatCurrencySoles(item.discount)}</span>
                                    </div>
                                  )}

                                  {item.bar_code && (
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black uppercase text-muted-foreground">EAN/UPC</span>
                                      <span className="text-sm font-mono">{item.bar_code}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-2 rounded-lg border-muted-foreground/20 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                                    onClick={() => handleEditItem(index)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span>Editar detalles</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-full"
                                    onClick={() => removeItem(item._temp_id || '')}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                    </div>
                  </ScrollArea>

                  {/* Resumen de costos visual (FUERA del ScrollArea para que sea fijo) */}
                  <div className="bg-primary/5 border-t border-primary/10 p-5 shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-background rounded-lg border shadow-sm">
                        <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Subtotal</span>
                        <span className="text-base font-bold">{formatCurrencySoles(subtotal)}</span>
                      </div>
                      <div className="p-3 bg-background rounded-lg border shadow-sm">
                        <span className="text-[10px] font-black uppercase text-destructive block mb-1">Dcto. Global</span>
                        <span className="text-base font-bold text-destructive">-{formatCurrencySoles(watchedDiscount)}</span>
                      </div>
                      <div className="p-3 bg-primary text-primary-foreground rounded-lg border shadow-sm flex flex-col justify-center">
                        <span className="text-[10px] font-black uppercase opacity-80 block mb-1">Total Compra</span>
                        <span className="text-xl font-black">{formatCurrencySoles(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Datos del Proveedor y Resumen */}
          <div className="w-full lg:w-96 flex flex-col gap-4 lg:h-full">
            <Card className="shadow-lg border-primary/20 flex flex-col py-0 rounded-xl">
              <div className="bg-primary p-4 text-primary-foreground rounded-t-xl">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Resumen de Compra
                </h2>
              </div>

              <div className="px-5 py-5 space-y-4 flex-1 flex flex-col min-h-0">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 bg-muted/30 border-muted-foreground/10 rounded-lg text-sm w-full">
                            <SelectValue placeholder="Seleccionar un proveedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="p-2">
                            <Input
                              placeholder="Buscar..."
                              value={searchSupplier}
                              onChange={(e) => setSearchSupplier(e.target.value)}
                              className="h-8 text-xs mb-2"
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                            <Separator className="my-1" />
                          </div>
                          {filteredSuppliers.map(s => (
                            <SelectItem key={s.id} value={s.id} className="text-xs">
                              {s.name} ({s.document_number})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <Input type="date"
                            placeholder='Fecha'
                            {...field} className="h-10 text-xs bg-muted/30" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guide_number"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <Input placeholder="N° Guía" {...field} className="h-10 text-xs bg-muted/30 uppercase" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs bg-muted/30 w-full">
                              <SelectValue placeholder='Estado' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="completed" className="text-xs">Completada</SelectItem>
                            <SelectItem value="pending" className="text-xs">Pendiente</SelectItem>
                            <SelectItem value="draft" className="text-xs">Borrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="payment_status"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs bg-muted/30 w-full">
                              <SelectValue placeholder='Pago' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending" className="text-xs">Pendiente</SelectItem>
                            <SelectItem value="paid" className="text-xs">Pagado</SelectItem>
                            <SelectItem value="partial" className="text-xs">Parcial</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex-1 flex flex-col min-h-0 min-w-0">
                  <Separator className="my-2 shrink-0" />

                  {/* LISTA DE ITEMS (CART) - SOLO EN MODO SELECCION */}
                  {!isReviewing && (
                    <div className="flex-1 flex flex-col min-h-[150px] bg-muted/5 rounded-xl border border-dashed border-primary/20 overflow-hidden">
                      <div className="p-2.5 border-b bg-background/50 backdrop-blur-sm flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 flex-1 justify-start">
                          <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-black uppercase text-muted-foreground">Carrito</span>
                        </div>
                        <Badge variant="secondary" className="text-[9px] font-bold px-1.5 h-4 bg-primary/10 text-primary border-none">{watchedItems.length} ítems</Badge>
                      </div>

                      <ScrollArea className="h-[300px]" type="always">
                        {watchedItems.length > 0 ? (
                          <div className="divide-y divide-muted/10">
                            {watchedItems.map((item, index) => (
                              <div key={`${item._temp_id}-${index}`} className="p-3 bg-background/30 hover:bg-muted/10 transition-colors mr-4">
                                <div className="flex gap-3">
                                  {/* Product Image */}
                                  <div className="h-10 w-10 rounded-lg border bg-background flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                                    {item.images && item.images[0] ? (
                                      <img src={item.images[0]} alt="img" className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="h-5 w-5 text-muted-foreground/20" />
                                    )}
                                  </div>
                                  {/* Details */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold line-clamp-2 whitespace-normal break-words uppercase mb-0.5" title={item.name}>
                                      {item.name}
                                    </p>
                                    <div className="flex justify-between items-center">
                                      <p className="text-[9px] text-muted-foreground uppercase font-medium">
                                        {item.quantity} {item.unit} · {formatCurrencySoles(item.price)}
                                      </p>
                                      <span className="text-[11px] font-black text-primary">
                                        {formatCurrencySoles(item.price * item.quantity - (item.discount || 0))}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions Row */}
                                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-dashed border-muted/20">
                                  <div className="flex items-center bg-background rounded-md border h-7 shadow-sm">
                                    <button
                                      type="button"
                                      className="w-7 h-full flex items-center justify-center hover:bg-muted/50 text-muted-foreground transition-colors"
                                      onClick={() => updateQuantity(item._temp_id || '', -1)}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="text-[11px] font-bold w-6 text-center border-x h-full flex items-center justify-center">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      className="w-7 h-full flex items-center justify-center hover:bg-muted/50 text-muted-foreground transition-colors"
                                      onClick={() => updateQuantity(item._temp_id || '', 1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                                      onClick={() => handleEditItem(index)}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
                                      onClick={() => removeItem(item._temp_id || '')}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[180px] text-center text-muted-foreground/40 p-6">
                            <ShoppingCart className="h-10 w-10 mb-2 opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Carrito vacío</p>
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </div>

                <div className="space-y-2 shrink-0 border-t pt-4">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-muted-foreground uppercase text-[9px] font-black">Subtotal Base</span>
                    <span className="font-bold">{formatCurrencySoles(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <span className="text-[9px] font-black uppercase text-destructive whitespace-nowrap">Dcto. Global</span>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-destructive/50">S/</span>
                      <Input
                        type="number"
                        value={watchedDiscount}
                        onChange={(e) => form.setValue('discount', Number(e.target.value))}
                        className="h-7 py-0 text-right font-bold text-destructive w-20 bg-destructive/5 text-xs pl-5 border-destructive/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="tax-toggle"
                        checked={watchedTaxRate > 0}
                        onCheckedChange={(checked) => form.setValue('tax_rate', checked ? 18 : 0)}
                        className="h-3.5 w-3.5"
                      />
                      <label htmlFor="tax-toggle" className="text-[10px] font-black uppercase text-muted-foreground cursor-pointer">IGV 18%</label>
                    </div>
                    {watchedTaxRate > 0 && <span className="text-xs font-bold text-primary">{formatCurrencySoles(taxAmount)}</span>}
                  </div>

                  <div className="pt-3 mt-1 border-t border-primary/10 flex justify-between items-center">
                    <span className="text-xs font-black uppercase">Total Neto</span>
                    <span className="text-2xl font-black text-primary tracking-tighter">{formatCurrencySoles(total)}</span>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <Button
                    key={isReviewing ? "confirm" : "review"}
                    type="button"
                    onClick={isReviewing ? confirmPurchase : onSubmitReview}
                    disabled={isLoading || watchedItems.length === 0}
                    className={`w-full h-14 text-base font-black shadow-xl rounded-xl transition-all active:scale-[0.98] ${isReviewing
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-primary hover:bg-primary/90'
                      }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </div>
                    ) : isReviewing ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Confirmar Compra
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Revisar Detalle
                        <ArrowLeft className="h-5 w-5 rotate-180" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <div className="bg-primary/5 rounded-xl border border-primary/10 p-4">
              <h3 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-1">
                <BadgeInfo className="h-3 w-3" /> Info
              </h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Las compras en estado <b>Completada</b> aumentarán automáticamente el stock de los productos. Asegúrate de que los costos sean correctos.
              </p>
            </div>
          </div>
        </form>
      </Form>

      <EditPurchaseItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={editingItem.item}
        onUpdate={handleUpdateItem}
      />
    </div>
  )
}
