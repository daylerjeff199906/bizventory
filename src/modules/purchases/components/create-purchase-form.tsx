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
    FormMessage,
    FormLabel,
    FormDescription
} from '@/components/ui/form'
import { useDebouncedCallback } from 'use-debounce'
import {
    Trash2,
    Search,
    Package,
    ArrowLeft,
    CheckCircle2,
    Plus,
    Minus,
    ShoppingCart,
    Calendar,
    User,
    FileText,
    BadgeInfo
} from 'lucide-react'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

// Reusing types and hooks
import { useProductsPrices } from '@/hooks/use-products-price'
import { useSuppliers } from '@/hooks/use-suppliers'
import {
    PurchaseFormSchema,
    PurchaseSchema,
    type PurchaseFormData,
    type CreatePurchaseData,
    type PurchaseItem
} from '../schemas'
import { createPurchaseWithItems } from '@/apis/app'
import { formatCurrencySoles } from '@/utils'
import { transformProductsToCombinedSelection } from '@/modules/sales/components/product-selection-modal'
import { ProductCombinedSelection } from '@/modules/sales/components/types'

// Reusing ProductItem for visual consistency
import { ProductItem } from '@/modules/sales/components/product-selection-modal'

export default function CreatePurchaseForm() {
    const params = useParams()
    const businessId = params.uuid as string
    const router = useRouter()

    const [isReviewing, setIsReviewing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Products fetching
    const { items: productsResponse, loading: productsLoading, fetchItems } = useProductsPrices()
    const [productSearchTerm, setProductSearchTerm] = useState('')
    const [searchInput, setSearchInput] = useState('')

    const debouncedSearch = useDebouncedCallback((value: string) => {
        setProductSearchTerm(value)
    }, 300)

    // Suppliers fetching
    const { suppliers } = useSuppliers({ businessId })
    const [searchSupplier, setSearchSupplier] = useState('')

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchSupplier.toLowerCase())
    )

    const form = useForm<PurchaseFormData>({
        resolver: zodResolver(PurchaseFormSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            business_id: businessId,
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

    const { watch, setValue, getValues } = form
    const watchedItems = watch('items') as PurchaseItem[]
    const watchedDiscount = watch('discount') || 0
    const watchedTaxRate = watch('tax_rate') || 0

    // Fetch products
    useEffect(() => {
        fetchItems({ searchQuery: productSearchTerm, page: 1, pageSize: 40, businessId })
    }, [productSearchTerm, businessId])

    const listGeneralProducts = transformProductsToCombinedSelection(
        productsResponse?.data || []
    )

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
        setValue('subtotal', subtotal)
        setValue('tax_amount', taxAmount)
        setValue('total_amount', total)
    }, [subtotal, taxAmount, total, setValue])

    const handleProductSelect = (product: ProductCombinedSelection) => {
        const currentItems = getValues('items') || []
        const existingIndex = currentItems.findIndex(item =>
            item.product_id === product.product_id && item.product_variant_id === product.variant_id
        )

        if (existingIndex >= 0) {
            // Toggle: remove if already selected
            const newItems = currentItems.filter((_, i) => i !== existingIndex)
            setValue('items', newItems, { shouldValidate: true })
        } else {
            // Add new item
            const newItem: PurchaseItem = {
                product_id: product.product_id,
                product_variant_id: product.variant_id || null,
                quantity: 1,
                price: product.price_unit || 0, // In purchase we might want a different default, but this is a start
                discount: 0,
                _temp_id: product._temp_id,
                original_product_name: product.product_name,
                original_variant_name: product.variant_name,
                // UI Helpers
                name: product.product_name,
                brand: product.brand,
                unit: product.unit,
                description: product.product_description,
                attributes: product.attributes
            }
            setValue('items', [...currentItems, newItem], { shouldValidate: true })
        }
    }

    const updateItemField = (index: number, field: keyof PurchaseItem, value: any) => {
        const currentItems = [...(getValues('items') || [])]
        currentItems[index] = { ...currentItems[index], [field]: value }
        setValue('items', currentItems, { shouldValidate: true })
    }

    const updateQuantity = (index: number, delta: number) => {
        const currentItems = getValues('items') || []
        const newQuantity = (currentItems[index].quantity || 0) + delta
        if (newQuantity <= 0) {
            const newItems = currentItems.filter((_, i) => i !== index)
            setValue('items', newItems, { shouldValidate: true })
        } else {
            updateItemField(index, 'quantity', newQuantity)
        }
    }

    const confirmPurchase = async () => {
        if (!isReviewing) {
            const isValid = await form.trigger(['supplier_id', 'date', 'items'])
            if (!watchedItems || watchedItems.length === 0) {
                toast.error('Agrega al menos un producto.')
                return
            }
            if (isValid) setIsReviewing(true)
            return
        }

        setIsLoading(true)
        try {
            const data = form.getValues()
            const purchaseData: CreatePurchaseData = {
                ...data,
                items: watchedItems,
                business_id: businessId,
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
                        message="La compra se ha registrado exitosamente."
                    />
                )
                router.push(`/dashboard/${businessId}/purchases/${response.data.id}`)
            } else {
                throw new Error(response.error || 'Error desconocido')
            }
        } catch (error) {
            toast.error(
                <ToastCustom
                    title="Error al registrar"
                    message={error instanceof Error ? error.message : 'Error al procesar la compra'}
                />
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 p-4 -m-4 bg-muted/10 overflow-hidden relative">
            <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()} className="contents">

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
                                    <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                                        {listGeneralProducts.length} productos disponibles
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 p-4">
                                    {productsLoading ? (
                                        <div className="flex items-center justify-center py-20 h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : listGeneralProducts.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                                            {listGeneralProducts.map((product) => {
                                                const isSelected = watchedItems?.some(i => i._temp_id === product._temp_id)
                                                const addedItem = watchedItems?.find(i => i._temp_id === product._temp_id)

                                                return (
                                                    <div key={product._temp_id} className="relative">
                                                        <ProductItem
                                                            product={product}
                                                            onSelect={handleProductSelect}
                                                            isSelected={isSelected}
                                                            isConfiguring={false}
                                                            currency="PEN"
                                                        />
                                                        {isSelected && addedItem && (
                                                            <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-md">
                                                                {addedItem.quantity} agregados
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
                                            <p className="text-muted-foreground text-sm">Prueba con otros términos de búsqueda</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </>
                        ) : (
                            /* REVIEW MODE */
                            <div className="flex-1 flex flex-col h-full overflow-hidden">
                                <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <Package className="h-5 w-5 text-primary" />
                                            Revisión de Compra
                                        </h2>
                                        <p className="text-xs text-muted-foreground">Revisa los productos y costos finales antes de registrar.</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsReviewing(false)}
                                        className="gap-2 hover:bg-background"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Regresar a editar
                                    </Button>
                                </div>

                                <ScrollArea className="flex-1">
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            {watchedItems.map((item, index) => (
                                                <Card key={item._temp_id} className="p-4 shadow-sm border-muted-foreground/10 hover:border-primary/20 transition-colors">
                                                    <div className="flex gap-4">
                                                        <div className="h-20 w-20 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border">
                                                            {/* Reusing the image logic if we have metadata */}
                                                            <Package className="h-8 w-8 text-muted-foreground/30" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                                                <div>
                                                                    <h3 className="font-bold text-sm md:text-base line-clamp-1">{item.name}</h3>
                                                                    <p className="text-xs text-muted-foreground">{item.brand?.name} | {item.unit}</p>
                                                                    {item.attributes && item.attributes.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {item.attributes.map((attr, idx) => (
                                                                                <Badge key={idx} variant="outline" className="text-[10px] h-4">
                                                                                    {attr.attribute_type}: {attr.attribute_value}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 bg-muted/40 p-1.5 rounded-lg border">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 rounded-md hover:bg-background"
                                                                        onClick={() => updateQuantity(index, -1)}
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </Button>
                                                                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 rounded-md hover:bg-background"
                                                                        onClick={() => updateQuantity(index, 1)}
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 items-end pt-2 border-t border-dashed">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Precio Unit.</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={item.price}
                                                                        onChange={(e) => updateItemField(index, 'price', Number(e.target.value))}
                                                                        className="h-8 text-sm font-medium"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Dscto Total</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={item.discount || 0}
                                                                        onChange={(e) => updateItemField(index, 'discount', Number(e.target.value))}
                                                                        className="h-8 text-sm font-medium"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Cod. Barras</label>
                                                                    <Input
                                                                        value={item.bar_code || ''}
                                                                        onChange={(e) => updateItemField(index, 'bar_code', e.target.value)}
                                                                        className="h-8 text-sm"
                                                                        placeholder="Opcional"
                                                                    />
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Item</p>
                                                                    <p className="text-sm font-bold text-primary">
                                                                        {formatCurrencySoles(item.price * item.quantity - (item.discount || 0))}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-destructive self-start"
                                                            onClick={() => {
                                                                const newItems = watchedItems.filter((_, i) => i !== index)
                                                                setValue('items', newItems)
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* Cost Breakdown Visual */}
                                        <div className="bg-primary/5 rounded-xl border border-primary/10 p-6 space-y-4">
                                            <h3 className="font-bold text-sm flex items-center gap-2">
                                                <BadgeInfo className="h-4 w-4 text-primary" />
                                                Desglose de Costos
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="flex justify-between items-center p-3 bg-background rounded-lg border shadow-sm">
                                                    <span className="text-xs font-medium text-muted-foreground">Subtotal Productos</span>
                                                    <span className="font-bold">{formatCurrencySoles(subtotal)}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-background rounded-lg border shadow-sm">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium text-muted-foreground">Descuento Global</span>
                                                        <span className="text-[10px] text-destructive">Se resta al total</span>
                                                    </div>
                                                    <span className="font-bold text-destructive">-{formatCurrencySoles(watchedDiscount)}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-primary text-primary-foreground rounded-lg border shadow-sm">
                                                    <span className="text-xs font-medium opacity-90">Total Final</span>
                                                    <span className="text-xl font-black">{formatCurrencySoles(total)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Aside / Summary */}
                    <div className="w-full lg:w-96 flex flex-col gap-6">
                        <Card className="shadow-lg border-2 border-primary/10 overflow-hidden">
                            <div className="bg-primary p-4 text-primary-foreground">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Resumen de Compra
                                </h2>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Supplier Field */}
                                <FormField
                                    control={form.control}
                                    name="supplier_id"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                                                <User className="h-3 w-3" /> Proveedor
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 bg-muted/30 border-muted-foreground/20 rounded-lg">
                                                        <SelectValue placeholder="Seleccionar proveedor" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <div className="px-2 py-2">
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
                                                            {s.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> Fecha
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className="h-10 text-xs bg-muted/30" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="guide_number"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                                                    <FileText className="h-3 w-3" /> N° Guía
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="001-001..." {...field} className="h-10 text-xs bg-muted/30" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Estado Compra</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 text-xs bg-muted/30">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="draft" className="text-xs">Borrador</SelectItem>
                                                        <SelectItem value="completed" className="text-xs">Completada</SelectItem>
                                                        <SelectItem value="pending" className="text-xs">Pendiente</SelectItem>
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
                                                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Estado Pago</FormLabel>
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
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">{formatCurrencySoles(subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between items-center gap-4">
                                        <span className="text-xs font-bold uppercase text-muted-foreground whitespace-nowrap">Descuento Global</span>
                                        <Input
                                            type="number"
                                            value={watchedDiscount}
                                            onChange={(e) => setValue('discount', Number(e.target.value))}
                                            className="h-8 py-0 text-right font-bold text-destructive w-24 bg-destructive/5 border-destructive/20 focus-visible:ring-destructive/20"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="tax-toggle"
                                                checked={watchedTaxRate > 0}
                                                onCheckedChange={(checked) => setValue('tax_rate', checked ? 18 : 0)}
                                            />
                                            <label htmlFor="tax-toggle" className="text-xs font-medium cursor-pointer">Aplicar IGV (18%)</label>
                                        </div>
                                        {watchedTaxRate > 0 && <span className="text-xs font-bold">{formatCurrencySoles(taxAmount)}</span>}
                                    </div>

                                    <div className="pt-4 mt-2 border-t flex justify-between items-center">
                                        <span className="text-base font-bold">Total</span>
                                        <span className="text-2xl font-black text-primary">{formatCurrencySoles(total)}</span>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button
                                        key={isReviewing ? "confirm-btn" : "review-btn"}
                                        type="button"
                                        onClick={confirmPurchase}
                                        disabled={isLoading || watchedItems.length === 0}
                                        className={`w-full h-14 text-base font-bold shadow-lg rounded-xl transition-all active:scale-[0.98] ${isReviewing
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-primary hover:bg-primary/90'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                Procesando...
                                            </div>
                                        ) : isReviewing ? (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Realizar Compra
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-lg">
                                                Siguiente: Revisar Detalle
                                                <ArrowLeft className="h-5 w-5 rotate-180" />
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <div className="bg-primary/5 rounded-xl border p-4">
                            <h3 className="text-xs font-bold uppercase text-primary mb-2 flex items-center gap-2">
                                <BadgeInfo className="h-4 w-4" /> Recomendaciones
                            </h3>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Asegúrate de que los precios unitarios correspondan a la moneda local.
                                Las compras marcadas como <b>Completadas</b> afectarán inmediatamente tu inventario.
                            </p>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
