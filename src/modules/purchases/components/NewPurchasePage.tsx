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
  Clock
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
import { transformProductsToCombinedSelection } from '@/modules/sales/components/product-selection-modal'
import { ProductItem } from '@/modules/sales/components/product-selection-modal'
import { ProductCombinedSelection } from '@/modules/sales/components/types'

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
    const existingIndex = currentItems.findIndex(item =>
      item.product_id === product.product_id && item.product_variant_id === product.variant_id
    )

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

  const updateQuantity = (index: number, delta: number) => {
    const currentItems = [...form.getValues('items')]
    const newQuantity = (currentItems[index].quantity || 0) + delta

    if (newQuantity <= 0) {
      const newItems = currentItems.filter((_, i) => i !== index)
      form.setValue('items', newItems, { shouldValidate: true })
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
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 p-4 -m-4 bg-muted/10 overflow-hidden relative">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="contents">

          {/* COLUMNA IZQUIERDA: Selección de Productos o Revisión */}
          <div className="flex-1 flex flex-col bg-background rounded-xl border shadow-sm overflow-hidden min-w-0">
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

                {/* Lista de productos */}
                <div className="flex-1 relative min-h-0">
                  <ScrollArea className="absolute inset-0 p-4">
                    {productsLoading ? (
                      <div className="flex items-center justify-center py-20 h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : listGeneralProducts.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                        {listGeneralProducts.map((product) => {
                          const isSelected = watchedItems?.some(i => i._temp_id === product._temp_id)
                          const addedItem = watchedItems?.find(i => i._temp_id === product._temp_id)

                          return (
                            <div key={product._temp_id} className="relative group">
                              <ProductItem
                                product={product}
                                onSelect={handleProductSelect}
                                isSelected={isSelected}
                                isConfiguring={false}
                                currency="PEN"
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
                      <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-70">
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

                <div className="flex-1 relative min-h-0">
                  <ScrollArea className="absolute inset-0">
                    <div className="p-6 space-y-4">
                      {watchedItems.map((item, index) => (
                        <Card key={item._temp_id} className="p-4 shadow-none border-muted-foreground/10 hover:border-primary/30 transition-all">
                          <div className="flex gap-4">
                            <div className="h-16 w-16 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border">
                              {item.images && item.images[0] ? (
                                <img src={item.images[0]} alt={item.name || ''} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground/30" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-bold text-sm line-clamp-1 uppercase">{item.name}</h3>
                                  <p className="text-[10px] text-muted-foreground font-medium uppercase">{item.brand?.name} · {item.unit}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded hover:bg-background"
                                    onClick={() => updateQuantity(index, -1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded hover:bg-background"
                                    onClick={() => updateQuantity(index, 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 items-end pt-3 border-t border-dashed">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-muted-foreground">Costo Unit.</label>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">S/</span>
                                    <Input
                                      type="number"
                                      value={item.price}
                                      onChange={(e) => updateItemField(index, 'price', Number(e.target.value))}
                                      className="h-8 pl-6 text-xs font-bold"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-muted-foreground text-destructive">Dscto Total</label>
                                  <Input
                                    type="number"
                                    value={item.discount || 0}
                                    onChange={(e) => updateItemField(index, 'discount', Number(e.target.value))}
                                    className="h-8 text-xs font-bold text-destructive bg-destructive/5"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-muted-foreground">Cod. Barras</label>
                                  <Input
                                    value={item.bar_code || ''}
                                    onChange={(e) => updateItemField(index, 'bar_code', e.target.value)}
                                    className="h-8 text-xs"
                                    placeholder="Opcional"
                                  />
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] font-black uppercase text-muted-foreground">Total Item</p>
                                  <p className="text-sm font-black text-primary">
                                    {formatCurrencySoles(item.price * item.quantity - (item.discount || 0))}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground/30 hover:text-destructive self-start h-8 w-8"
                              onClick={() => {
                                const newItems = watchedItems.filter((_, i) => i !== index)
                                form.setValue('items', newItems)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}

                      {/* Resumen de costos visual */}
                      <div className="bg-primary/5 rounded-xl border border-primary/10 p-5 mt-4">
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
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Datos del Proveedor y Resumen */}
          <div className="w-full lg:w-96 flex flex-col gap-4">
            <Card className="shadow-lg border-primary/20 overflow-hidden flex flex-col">
              <div className="bg-primary p-4 text-primary-foreground">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Resumen de Compra
                </h2>
              </div>

              <div className="p-5 space-y-4">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> Proveedor *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 bg-muted/30 border-muted-foreground/10 rounded-lg text-sm">
                            <SelectValue placeholder="Seleccionar proveedor" />
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
                        <FormLabel className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Fecha
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="h-10 text-xs bg-muted/30" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guide_number"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" /> N° Documento
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="F001-..." {...field} className="h-10 text-xs bg-muted/30 uppercase" />
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
                        <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs bg-muted/30">
                              <SelectValue />
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
                        <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Pago</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 text-xs bg-muted/30">
                              <SelectValue />
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

                <Separator className="my-2" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrencySoles(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-destructive whitespace-nowrap">Dcto. Global</span>
                    <Input
                      type="number"
                      value={watchedDiscount}
                      onChange={(e) => form.setValue('discount', Number(e.target.value))}
                      className="h-8 py-0 text-right font-bold text-destructive w-20 bg-destructive/5 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="tax-toggle"
                        checked={watchedTaxRate > 0}
                        onCheckedChange={(checked) => form.setValue('tax_rate', checked ? 18 : 0)}
                      />
                      <label htmlFor="tax-toggle" className="text-[11px] font-medium cursor-pointer">IGV 18%</label>
                    </div>
                    {watchedTaxRate > 0 && <span className="text-xs font-bold">{formatCurrencySoles(taxAmount)}</span>}
                  </div>

                  <div className="pt-4 mt-2 border-t flex justify-between items-center">
                    <span className="text-sm font-bold uppercase">Total</span>
                    <span className="text-2xl font-black text-primary">{formatCurrencySoles(total)}</span>
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
    </div>
  )
}
