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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import {
    Trash2,
    ShoppingCart,
    Calculator,
    Package,
    DollarSign,
    Pencil,
    Plus,
    Save
} from 'lucide-react'
import { saleFormSchema, SaleFormValues, SaleItemValues } from '../schemas'
import { Currency } from '@/types'
import ProductSelectionModal from './product-selection-modal'
import { SelectedProductItem } from './types'
import { SaleValues, ItemValues } from '../schemas'
import { updateSale, SaleWithItems } from '@/apis/app/sales'
import { getCustomers } from '@/apis/app/customers'
import { CustomerList } from '@/types'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import { useRouter, useParams } from 'next/navigation'
import { APP_URLS } from '@/config/app-urls'
import ConfirmationDialog from './confirmation-dialog'
import EditProductModal from './edit-product-modal'

interface EditSaleFormProps {
    sale: SaleWithItems
}

export default function EditSaleForm({ sale }: EditSaleFormProps) {
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

    const router = useRouter()
    const params = useParams()
    const businessId = params.uuid as string

    // Map initial items
    const initialItems: SaleItemValues[] = sale.items.map(item => ({
        _temp_id: item.id || `existing-${Math.random()}`,
        product_id: item.id || '', // item.id is product.id from CombinedResult
        variant_id: item.variant_id || undefined,
        product_name: item.name || '',
        product_description: item.description || '',
        variant_name: item.variant_name || '',
        quantity: item.quantity || 1,
        price_unit: item.unit_price || 0,
        discount: item.discount_amount || 0,
        subtotal: item.total_price || 0,
        unit: item.unit || '',
        brand: item.brand ? { id: item.brand.id || '', name: item.brand.name || '' } : undefined,
        attributes: item.attributes || [],
        max_stock: 99999 // Todo: fetch actual stock if needed
    }))

    const form = useForm<SaleFormValues>({
        resolver: zodResolver(saleFormSchema),
        defaultValues: {
            currency: 'PEN', // TODO: Add currency to Sale model if supported, assumming PEN for now
            reference_number: sale.reference_number,
            payment_method: sale.payment_method || 'efectivo',
            shipping_address: sale.shipping_address || '',
            tax_rate: sale.tax_amount > 0 ? (sale.tax_amount / (sale.total_amount - sale.tax_amount)) : 0, // Approximation
            date: sale.date.split('T')[0],
            items: initialItems,
            customer_id: sale.customer_id || '',
            status: sale.status || 'pending'
        }
    })

    const { watch, setValue, getValues } = form

    const watchedItems = getValues('items') as SaleItemValues[] | undefined
    const watchedCurrency = watch('currency') as Currency
    const watchedTaxExempt = 0
    const watchedTaxRate = watch('tax_rate')
    const watchedStatus = watch('status')

    const currencySymbol = watchedCurrency === 'PEN' ? 'S/' : '$'
    const currencyName = watchedCurrency === 'PEN' ? 'Soles' : 'Dólares'

    // Fetch customers
    useEffect(() => {
        const fetchCustomers = async () => {
            setIsLoadingCustomers(true)
            try {
                const { data } = await getCustomers({ pageSize: 100 })
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

    // Calculate totals
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

    const handleConfirmUpdate = async () => {
        const data = getValues()

        const saleData: SaleValues = {
            customer_id: data.customer_id || null,
            reference_number: data.reference_number,
            date: data.date,
            payment_method: data.payment_method,
            shipping_address: data.shipping_address || '',
            discount_amount: totalDiscount,
            tax_amount: taxAmount,
            total_items: watchedItems?.length || 0,
            total_amount: total,
            salesperson_id: sale.salesperson_id,
            status: data.status || 'pending'
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
            const response = await updateSale({
                id: sale.id,
                updated: saleData,
                items: items
            })

            if (response) {
                toast.success(
                    <ToastCustom
                        title="Venta actualizada"
                        message={`La venta ${data.reference_number} ha sido actualizada.`}
                    />
                )
                // Redirect using businessId
                router.push(`/dashboard/${businessId}/sales/${response.id}/edit`)
            }
        } catch (error) {
            console.error(error)
            toast.error(
                <ToastCustom
                    title="Error al actualizar"
                    message="Hubo un problema al actualizar la venta."
                />
            )
        } finally {
            setIsConfirmationDialogOpen(false)
        }
    }

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

    const isCompleted = sale.status === 'completed'

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Editar Venta</h2>
                {isCompleted && (
                    <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium">
                        Esta venta ya está completada. Editarla puede afectar el inventario.
                    </div>
                )}
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmitForm)}
                    className="space-y-8"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="p-4 bg-white dark:bg-gray-800 border rounded-md">
                                <div>
                                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        Información de la Venta
                                    </h3>
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
                                                        <Input type="date" className="w-full" {...field} />
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
                                                            <div className="p-2 sticky top-0 bg-white z-10 border-b">
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
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Estado</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Estado" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pendiente</SelectItem>
                                                            <SelectItem value="completed">Completada</SelectItem>
                                                            <SelectItem value="canceled">Cancelada</SelectItem>
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
                                                            <SelectItem value="PEN">Soles (S/)</SelectItem>
                                                            <SelectItem value="USD">Dólares ($)</SelectItem>
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
                                                        <Input className="w-full" {...field} />
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
                                                            <SelectItem value="tarjeta_credito">Tarjeta de Crédito</SelectItem>
                                                            <SelectItem value="tarjeta_debito">Tarjeta de Débito</SelectItem>
                                                            <SelectItem value="transferencia">Transferencia</SelectItem>
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
                                </div>
                            </div>

                            {/* Productos */}
                            <div className="p-4 bg-white dark:bg-gray-800 border rounded-md grid grid-cols-1 gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        <h3 className="text-lg font-semibold">Productos</h3>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => setIsProductModalOpen(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Agregar
                                    </Button>
                                </div>

                                <div className="mt-4">
                                    {watchedItems && watchedItems.length > 0 ? (
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-gray-200">
                                                            <th className="text-left py-3 px-2 text-sm font-medium">#</th>
                                                            <th className="text-left py-3 px-2 text-sm font-medium">Producto</th>
                                                            <th className="text-center py-3 px-2 text-sm font-medium">Cant.</th>
                                                            <th className="text-right py-3 px-2 text-sm font-medium">P.Unit.</th>
                                                            <th className="text-right py-3 px-2 text-sm font-medium">Total</th>
                                                            <th className="text-center py-3 px-2 text-sm font-medium">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {watchedItems.map((item, index) => (
                                                            <tr key={item._temp_id} className="border-b hover:bg-gray-50">
                                                                <td className="py-3 px-2 text-sm text-gray-500">{index + 1}</td>
                                                                <td className="py-3 px-2 text-sm">
                                                                    {item.product_name}
                                                                    {item.variant_name && <span className="text-gray-500 ml-1">({item.variant_name})</span>}
                                                                </td>
                                                                <td className="py-3 px-2 text-center text-sm">{item.quantity}</td>
                                                                <td className="py-3 px-2 text-right text-sm">{currencySymbol}{item.price_unit?.toFixed(2)}</td>
                                                                <td className="py-3 px-2 text-right text-sm font-semibold">
                                                                    {currencySymbol}{((item.price_unit || 0) * (item.quantity || 0) - (item.discount || 0)).toFixed(2)}
                                                                </td>
                                                                <td className="py-3 px-2 text-center">
                                                                    <div className="flex justify-center gap-1">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-7 w-7 p-0"
                                                                            onClick={() => {
                                                                                setEditingProduct({ item, index })
                                                                                setIsEditModalOpen(true)
                                                                            }}
                                                                        >
                                                                            <Pencil className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-7 w-7 p-0 text-red-600"
                                                                            onClick={() => removeItem(item._temp_id || '')}
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
                                        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                            No hay productos
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        Resumen
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span>{currencySymbol}{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={form.formState.isSubmitting || watchedItems?.length === 0}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Cambios
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>

            <ProductSelectionModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onAddProduct={handleAddProduct}
                addedProductIds={addedProductIds}
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
                onConfirm={handleConfirmUpdate}
                saleData={getValues() as SaleFormValues}
                totals={{ subtotal, totalDiscount, taxAmount, total }}
                isSubmitting={form.formState.isSubmitting}
                isEditing
            />
        </div>
    )
}
