'use client'
import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { useDebouncedCallback } from 'use-debounce'
import {
  Trash2,
  Pencil,
  Search,
  Package,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { saleFormSchema, SaleFormValues, SaleItemValues } from '../schemas'
import { Currency } from '@/types'
import { SelectedProductItem } from './types'
import { SaleValues, ItemValues } from '../schemas'
import { createSale } from '@/apis/app/sales'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import EditProductModal from './edit-product-modal'
import QuickCustomerModal from './quick-customer-modal'
import { getCustomers } from '@/apis/app/customers'
import { CustomerList } from '@/types'
import { useProductsPrices } from '@/hooks/use-products-price'
import { transformProductsToCombinedSelection, ProductItem } from './product-selection-modal'
import { ProductCombinedSelection } from './types'
import { Separator } from '@/components/ui/separator'

export default function CreateSaleForm() {
  const [customers, setCustomers] = useState<CustomerList[]>([])
  const [searchCustomer, setSearchCustomer] = useState('')
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<{
    item: SaleItemValues | null
    index: number | null
  }>({ item: null, index: null })

  const [applyTax, setApplyTax] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const router = useRouter()
  const params = useParams()
  const businessId = params.uuid as string

  // Product fetching state
  const { items: productsResponse, loading: productsLoading, fetchItems } = useProductsPrices()
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setProductSearchTerm(value)
  }, 300)

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      currency: 'PEN',
      payment_method: 'efectivo',
      shipping_address: '',
      tax_rate: 0,
      date: new Date().toISOString().split('T')[0],
      items: [],
      customer_id: ''
    }
  })

  // Watch tax toggle
  useEffect(() => {
    const rate = applyTax ? 0.18 : 0
    form.setValue('tax_rate', rate)
  }, [applyTax, form])

  const { watch, setValue, getValues } = form
  const watchedItems = watch('items') as SaleItemValues[] | undefined
  const watchedCurrency = watch('currency') as Currency
  const watchedTaxRate = watch('tax_rate')

  const currencySymbol = watchedCurrency === 'PEN' ? 'S/' : '$'
  const currencyName = watchedCurrency === 'PEN' ? 'Soles' : 'Dólares'

  // Fetch customers once
  useEffect(() => {
    const fetchCustomersData = async () => {
      setIsLoadingCustomers(true)
      try {
        const { data } = await getCustomers({
          pageSize: 100,
          businessId: businessId
        })
        setCustomers(data)
      } catch (error) {
        console.error('Error fetching customers:', error)
      } finally {
        setIsLoadingCustomers(false)
      }
    }
    fetchCustomersData()
  }, [businessId])

  const filteredCustomers = customers.filter(customer =>
    customer.person?.name.toLowerCase().includes(searchCustomer.toLowerCase())
  )

  // Fetch products on search change
  useEffect(() => {
    fetchItems({ searchQuery: productSearchTerm, page: 1, pageSize: 40, businessId })
  }, [productSearchTerm, businessId])

  const listGeneralProducts = transformProductsToCombinedSelection(
    productsResponse?.data || []
  )

  // Totals calculations
  const { subtotal, totalDiscount, taxAmount, total } = useMemo(() => {
    const subtotal =
      watchedItems?.reduce(
        (sum, item) => sum + (item?.price_unit ?? 0) * (item?.quantity ?? 0),
        0
      ) ?? 0
    const totalDiscount =
      watchedItems?.reduce((sum, item) => sum + (item?.discount ?? 0), 0) ?? 0
    const taxAmount = (subtotal - totalDiscount) * watchedTaxRate
    const total = subtotal - totalDiscount + taxAmount

    return { subtotal, totalDiscount, taxAmount, total }
  }, [watchedItems, watchedTaxRate])

  const removeItem = (tempId: string) => {
    const currentItems = getValues('items')
    setValue(
      'items',
      currentItems?.filter((item) => item._temp_id !== tempId),
      { shouldValidate: true }
    )
  }

  const updateQuantity = (tempId: string, delta: number) => {
    const currentItems = getValues('items') || []
    const existingIndex = currentItems.findIndex(item => item._temp_id === tempId)

    if (existingIndex >= 0) {
      const existing = currentItems[existingIndex]
      const currentQuantity = existing.quantity || 0
      const newQuantity = currentQuantity + delta

      if (newQuantity <= 0) {
        removeItem(tempId)
        return
      }

      const productInfo = listGeneralProducts.find(p => p._temp_id === tempId)
      if (productInfo && newQuantity > (productInfo.stock || 0)) {
        toast.error(`Stock máximo alcanzado para ${existing.product_name}`)
        return
      }

      const updated = {
        ...existing,
        quantity: newQuantity,
        subtotal: newQuantity * (existing.price_unit || 0) - (existing.discount || 0)
      }
      const newItems = [...currentItems]
      newItems[existingIndex] = updated
      setValue('items', newItems, { shouldValidate: true })
    }
  }

  // Auto-add 1 unit when clicking product
  const handleProductSelect = (product: ProductCombinedSelection) => {
    const currentItems = getValues('items') || []
    const existingIndex = currentItems.findIndex(item => item._temp_id === product._temp_id)

    if (existingIndex >= 0) {
      // Toggle selection: remove it
      const newItems = currentItems.filter(item => item._temp_id !== product._temp_id)
      setValue('items', newItems, { shouldValidate: true })
    } else {
      if ((product.stock || 0) < 1) {
        toast.error('Producto sin stock')
        return
      }
      const newItem: SelectedProductItem = {
        ...product,
        quantity: 1,
        discount: 0,
        subtotal: product.price_unit,
      }
      setValue('items', [...currentItems, newItem], { shouldValidate: true })
    }
  }

  const handleUpdateProduct = (updatedItem: SaleItemValues) => {
    if (editingProduct.index !== null) {
      const currentItems = getValues('items') || []
      const newItems = currentItems.map((item, i) =>
        i === editingProduct.index ? updatedItem : item
      )
      setValue('items', newItems, { shouldValidate: true })
    }
    setIsEditModalOpen(false)
    setEditingProduct({ item: null, index: null })
  }

  const confirmSale = async () => {
    if (!isReviewing) return
    const isValid = await form.trigger()
    if (!isValid) return

    const data = getValues()
    if (!watchedItems || watchedItems.length === 0) {
      toast.error('Agrega al menos un producto a la venta.')
      return
    }

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
            title="Venta registrada"
            message={`La venta #${response.reference_number} se ha creado correctamente.`}
          />
        )
        router.push(`/dashboard/${businessId}/sales/${response.id}`)
      }
    } catch {
      toast.error(
        <ToastCustom
          title="Error al crear la venta"
          message="Hubo un problema al crear la venta. Por favor, inténtalo de nuevo."
        />
      )
    }
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 p-4 -m-4 bg-muted/10 overflow-hidden relative">

      {/* LEFT COLUMN: Main Area */}
      <div className="flex-1 flex flex-col bg-background rounded-xl border shadow-sm overflow-hidden min-w-0">
        {!isReviewing ? (
          <>
            <div className="p-4 border-b flex items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, código o marca..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    debouncedSearch(e.target.value)
                  }}
                  className="pl-9 w-full bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/20"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {listGeneralProducts.length} productos disponibles
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {productsLoading ? (
                <div className="flex items-center justify-center py-20 h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : listGeneralProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
                  {listGeneralProducts.map((product) => {
                    const addedItem = watchedItems?.find(i => i._temp_id === product._temp_id)
                    const isSelected = !!addedItem
                    return (
                      <div key={product._temp_id} className="relative group">
                        <ProductItem
                          product={product}
                          onSelect={handleProductSelect}
                          isSelected={isSelected}
                          isConfiguring={false}
                          currency={watchedCurrency}
                        />
                        {isSelected && addedItem && (
                          <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-md">
                            {addedItem.quantity} en carrito
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                  <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-1">No se encontraron productos</h3>
                  <p className="text-muted-foreground text-sm">Intenta con otro término de búsqueda</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* REVIEW MODE: LEFT AREA - Selected Items List (Matches Left Part of Image) */
          <div className="flex flex-col h-full bg-background">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Revisar Productos</h2>
                <p className="text-muted-foreground text-sm">Confirma los productos seleccionados antes de finalizar</p>
              </div>
              <Button variant="ghost" className="gap-2" onClick={() => setIsReviewing(false)}>
                <ArrowLeft className="h-4 w-4" />
                Seguir seleccionando productos
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-4">
                {watchedItems?.map((item) => (
                  <div key={item._temp_id} className="flex gap-6 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 items-center">
                    <div className="h-24 w-24 rounded-lg bg-white border border-muted flex-shrink-0 overflow-hidden shadow-sm">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-full h-full p-4 text-muted-foreground/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-lg leading-tight truncate">{item.product_name}</h3>
                        <span className="font-bold text-lg">{currencySymbol}{item.subtotal?.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 font-medium">
                        {item.variant_name || item.brand?.name} {item.attributes?.map(a => a.attribute_value).join(' ')}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-background/50 px-3 py-1.5 rounded-full border border-muted-foreground/10">
                          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Cantidad</span>
                          <span className="font-bold text-sm bg-primary text-primary-foreground h-6 w-6 flex items-center justify-center rounded-full">
                            {item.quantity}
                          </span>
                        </div>
                        <p className="text-sm font-medium">
                          Precio Unitario: <span className="text-muted-foreground ml-1">{currencySymbol}{item.price_unit?.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Sale Form / Summary (Aside) */}
      <div className="w-full lg:w-[420px] xl:w-[480px] flex-shrink-0 flex flex-col bg-background rounded-xl border shadow-sm overflow-hidden">

        {/* Sale Form Wrapping the Aside content */}
        <Form {...form}>
          <form
            className="flex-1 flex flex-col overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault();
              if (isReviewing) confirmSale();
            }}
          >

            {!isReviewing ? (
              /* NORMAL MODE: ASIDE - Cart & Payment Config */
              <>
                <div className="p-4 border-b bg-muted/5 flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2">
                    <h2 className="font-semibold text-lg tracking-tight">Detalles de Venta</h2>
                    <div className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {watchedItems?.length || 0} items
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="customer_id"
                      render={({ field }) => (
                        <FormItem className="col-span-2 space-y-1">
                          <div className="flex gap-2 items-center">
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="flex-1 h-9 text-xs">
                                  <SelectValue placeholder="Cliente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <div className="p-2 sticky top-0 z-10 border-b bg-background">
                                  <Input
                                    placeholder="Buscar..."
                                    value={searchCustomer}
                                    onChange={(e) => setSearchCustomer(e.target.value)}
                                    className="h-8 text-xs flex-1"
                                    autoFocus
                                  />
                                </div>
                                {filteredCustomers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id} className="text-xs">
                                    {customer.person?.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <QuickCustomerModal
                              businessId={businessId}
                              onSuccess={(newCustomer) => {
                                setCustomers(prev => [newCustomer, ...prev])
                                form.setValue('customer_id', newCustomer.id)
                              }}
                            />
                          </div>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 text-xs w-full">
                                <SelectValue placeholder="Pago" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="text-xs">
                              <SelectItem value="efectivo">Efectivo</SelectItem>
                              <SelectItem value="tarjeta_credito">T. Crédito</SelectItem>
                              <SelectItem value="tarjeta_debito">T. Débito</SelectItem>
                              <SelectItem value="transferencia">Transf.</SelectItem>
                              <SelectItem value="yape">Yape</SelectItem>
                              <SelectItem value="plin">Plin</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 text-xs w-full">
                                <SelectValue placeholder="Moneda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="text-xs">
                              <SelectItem value="PEN">Soles (S/)</SelectItem>
                              <SelectItem value="USD">Dólares ($)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.formState.errors.items && (
                    <div className="text-xs font-medium text-destructive mt-1">
                      {form.formState.errors.items.message}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto bg-background relative">
                  {watchedItems && watchedItems.length > 0 ? (
                    <div className="flex flex-col">
                      {watchedItems.map((item, index) => (
                        <div key={item._temp_id} className="flex gap-3 p-3 border-b hover:bg-muted/10 transition-colors group">
                          {/* Product Image */}
                          <div className="h-12 w-12 rounded-md border overflow-hidden bg-muted flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt="img" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-full h-full p-2 text-muted-foreground/30" />
                            )}
                          </div>
                          {/* Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-sm font-medium leading-none mb-1 truncate">
                              {item.product_name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate mb-1.5">
                              {item.variant_name || item.brand?.name} {item.attributes?.map(a => a.attribute_value).join(' ')}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-semibold">
                              <span className="text-primary">{item.quantity}x</span>
                              <span className="text-muted-foreground">{currencySymbol}{item.price_unit?.toFixed(2)}</span>
                            </div>
                          </div>
                          {/* Side Actions & Subtotal */}
                          <div className="flex flex-col items-end justify-between ml-2">
                            <span className="font-bold text-sm">
                              {currencySymbol}{item.subtotal?.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity mt-2">
                              <div className="flex items-center bg-muted/50 rounded-full border border-muted/80 h-7 mr-1">
                                <button
                                  type="button"
                                  className="h-full px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-l-full flex items-center justify-center transition-colors"
                                  onClick={() => updateQuantity(item._temp_id || '', -1)}
                                >
                                  -
                                </button>
                                <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="h-full px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-r-full flex items-center justify-center transition-colors"
                                  onClick={() => updateQuantity(item._temp_id || '', 1)}
                                >
                                  +
                                </button>
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-7 w-7 bg-muted text-foreground hover:bg-muted-foreground/10"
                                onClick={() => {
                                  setEditingProduct({ item, index })
                                  setIsEditModalOpen(true)
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7 hover:bg-destructive/90 text-white"
                                onClick={() => removeItem(item._temp_id || '')}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                      <Package className="h-12 w-12 mb-3 opacity-20" />
                      <p className="text-sm font-medium">El carrito está vacío</p>
                      <p className="text-xs">Selecciona productos a la izquierda para empezar.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* REVIEW MODE: ASIDE - Price Details Summary (Matching Design of Image) */
              <div className="flex-1 flex flex-col p-6 space-y-8 bg-muted/5">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold tracking-tight">Información de Venta</h3>
                  <div className="grid gap-3 p-4 bg-background rounded-xl border border-muted-foreground/10 shadow-sm">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Cliente:</span>
                      <span className="font-semibold text-primary">
                        {customers.find(c => c.id === form.getValues('customer_id'))?.person?.name || 'Cliente Varios'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Método de Pago:</span>
                      <span className="font-semibold capitalize">{form.getValues('payment_method')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Moneda:</span>
                      <span className="font-semibold">{currencyName}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Fecha:</span>
                      <span className="font-semibold">{form.getValues('date')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold tracking-tight">Detalles de Costos</h3>
                  <div className="p-5 bg-background rounded-xl border border-muted-foreground/10 shadow-sm space-y-4">
                    <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                      {/* Displays item count like the image */}
                      <span>{watchedItems?.length} items</span>
                    </div>

                    <div className="space-y-3 pt-2 max-h-[150px] overflow-y-auto pr-2">
                      {watchedItems?.map((item) => (
                        <div key={`summary-${item._temp_id}`} className="flex justify-between text-xs items-center">
                          <span className="line-clamp-1 flex-1 h-4">{item.quantity} x {item.product_name}</span>
                          <span className="font-medium text-muted-foreground ml-2">{currencySymbol}{item.subtotal?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="opacity-50" />

                    <div className="space-y-2.5 pt-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                      </div>
                      {totalDiscount > 0 && (
                        <div className="flex justify-between text-sm font-medium text-emerald-600">
                          <span>Descuento de la casa</span>
                          <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-muted-foreground">Impuestos (IGV {`${(watchedTaxRate * 100).toFixed(0)}%`})</span>
                        <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-muted-foreground">Cargos de Envío</span>
                        <span className="text-emerald-600 font-bold uppercase text-[10px]">Gratis</span>
                      </div>
                    </div>

                    <Separator className="h-0.5 bg-primary/20" />

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base font-bold">Monto Total</span>
                      <span className="text-2xl font-black text-primary tracking-tight">
                        {currencySymbol}{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Verifica que los datos del cliente y los productos sean correctos. Una vez confirmada la venta, se actualizará el stock disponible automáticamente.
                  </p>
                </div>
              </div>
            )}

            {/* Footer Summary Container */}
            <div className="p-4 border-t bg-muted/20 flex flex-col gap-4 mt-auto shrink-0 z-10 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
              {!isReviewing && (
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between font-medium text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between font-medium text-red-500">
                      <span>Descuento</span>
                      <span>-{currencySymbol}{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <label htmlFor="igv" className="text-sm font-medium cursor-pointer">IGV ({`${(watchedTaxRate * 100).toFixed(0)}%`})</label>
                      <Checkbox id="igv" checked={applyTax} onCheckedChange={(checked) => setApplyTax(!!checked)} className="h-4 w-4 rounded-sm border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    </div>
                    <span className="font-medium">{currencySymbol}{taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator className="my-1.5" />
                  <div className="flex justify-between font-bold text-lg md:text-xl text-foreground items-center">
                    <span>Total</span>
                    <span>{currencySymbol}{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {
                !isReviewing ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (!watchedItems || watchedItems.length === 0) {
                        toast.error('Agrega al menos un producto.')
                        return
                      }
                      setIsReviewing(true)
                    }}
                    className={`w-full h-12 text-sm md:text-base font-bold shadow-md rounded-xl transition-all ${isReviewing ? 'bg-primary hover:bg-primary/90 scale-100' : 'bg-foreground hover:bg-foreground/90'}`}
                    disabled={(!watchedItems || watchedItems.length === 0) || form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? 'Procesando...'
                      : 'Revisar Detalle'}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className={`w-full h-12 text-sm md:text-base font-bold shadow-md rounded-xl transition-all ${isReviewing ? 'bg-primary hover:bg-primary/90 scale-100' : 'bg-foreground hover:bg-foreground/90'}`}
                    disabled={(!watchedItems || watchedItems.length === 0) || form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? 'Procesando...'
                      : 'Realizar Venta'}
                  </Button>
                )
              }

              {isReviewing && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs underline underline-offset-4 opacity-70 hover:opacity-100"
                  onClick={() => setIsReviewing(false)}
                >
                  Volver a edición
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>

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
    </div>
  )
}
