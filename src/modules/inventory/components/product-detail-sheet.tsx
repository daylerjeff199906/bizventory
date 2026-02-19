'use client'
import { useEffect, useState } from 'react'
import { getProductById } from '@/apis/app/product-stock'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
    Edit,
    Layers,
    Package,
    AlertTriangle,
    Info,
    CheckCircle,
    Loader2
} from 'lucide-react'
import { Product } from '@/apis/app/product-stock'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProductDetailSheetProps {
    product: Product | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit?: (product: Product) => void
    onManageVariants?: (product: Product) => void
    showActions?: boolean
}

export const ProductDetailSheet = ({
    product,
    open,
    onOpenChange,
    onEdit,
    onManageVariants,
    showActions = true
}: ProductDetailSheetProps) => {
    const [details, setDetails] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchDetails = async () => {
            if (!open || !product?.id) {
                if (!open) setDetails(null)
                return
            }

            setIsLoading(true)
            try {
                // 1. Get Product
                const productData: Product | null = await getProductById(product.id)
                console.log(productData)
                if (productData) {
                    setDetails(productData)
                }
            }
            catch (error) {
                console.error('Error fetching details:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDetails()
    }, [product?.id, open])

    if (!product) return null

    // Use fetched full details; fallback to list-level product while loading
    const displayProduct = details || product

    const getStockStatus = (stock: number) => {
        if (stock <= 5) return { label: 'Bajo', color: 'bg-red-500 dark:bg-red-400', icon: AlertTriangle, textColor: 'text-red-500 dark:text-red-400', borderColor: 'border-red-500 dark:border-red-400' }
        if (stock <= 20) return { label: 'Medio', color: 'bg-yellow-500 dark:bg-yellow-400', icon: Info, textColor: 'text-yellow-500 dark:text-yellow-400', borderColor: 'border-yellow-500 dark:border-yellow-400' }
        return { label: 'Alto', color: 'bg-green-500 dark:bg-green-400', icon: CheckCircle, textColor: 'text-green-500 dark:text-green-400', borderColor: 'border-green-500 dark:border-green-400' }
    }

    const totalStock = displayProduct?.variants?.length && displayProduct?.variants?.length > 0
        ? (displayProduct.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0)
        : (displayProduct.stock || 0)

    const status = getStockStatus(totalStock)

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full border-l shadow-2xl" side="right">
                {/* Minimal Header */}
                <div className="pt-6">
                    <SheetHeader className="flex flex-col gap-2 text-left pb-0 py-0">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[10px] font-medium  uppercase tracking-wider">
                                <span>{displayProduct.code}</span>
                                {displayProduct.is_active ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/20 px-1.5 py-0.5 rounded-full ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-400/20">
                                        Activo
                                    </span>
                                ) : (
                                    <span className="bg-neutral-100 dark:bg-neutral-400/20 px-1.5 py-0.5 rounded-full">
                                        Inactivo
                                    </span>
                                )}
                            </div>
                            <SheetTitle className="text-base font-bold tracking-tight ">
                                {displayProduct.name}
                            </SheetTitle>
                        </div>
                        {displayProduct.description && (
                            <SheetDescription className="text-xs leading-relaxed max-w-sm line-clamp-2">
                                {displayProduct.description}
                            </SheetDescription>
                        )}
                    </SheetHeader>
                </div>
                <hr className="border-neutral-200" />
                {/* Content */}
                <ScrollArea className="flex-1 px-4 h-[calc(100vh-210px)]">
                    {isLoading ? (
                        <div className="space-y-6 pb-6">
                            {/* Stats Skeleton */}
                            <div className="grid grid-cols-2 gap-3">
                                <Skeleton className="h-[60px] w-full rounded-lg" />
                                <Skeleton className="h-[60px] w-full rounded-lg" />
                            </div>

                            {/* General Details Skeleton */}
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-32" />
                                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i}>
                                            <Skeleton className="h-3 w-16 mb-1" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator className="bg-neutral-100" />

                            {/* Images Skeleton */}
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-20" />
                                <div className="flex gap-2">
                                    <Skeleton className="w-16 h-16 rounded-md" />
                                    <Skeleton className="w-16 h-16 rounded-md" />
                                    <Skeleton className="w-16 h-16 rounded-md" />
                                </div>
                            </div>

                            <Separator className="bg-neutral-100" />

                            {/* Variants Skeleton */}
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-24" />
                                <div className="space-y-2">
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-6">
                            {/* Stats Cards - Compact */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50/50 dark:bg-neutral-400/20 space-y-0.5">
                                    <span className="text-[10px] font-medium uppercase tracking-wide">Stock Total</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold ">{totalStock}</span>
                                        <span className="text-[10px] font-medium">{displayProduct.unit}</span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50/50 dark:bg-neutral-400/20 space-y-0.5">
                                    <span className="text-[10px] font-medium uppercase tracking-wide">Estado</span>
                                    <div className={`flex items-center gap-1.5 mt-0.5 ${status.textColor}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                                        <span className="font-semibold text-sm">{status.label}</span>
                                    </div>
                                </div>
                            </div>

                            {/* General Details - Compact Grid */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold  uppercase tracking-wide">Información General</h3>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                                    <div>
                                        <span className="text-[10px]  block mb-0.5">Marca</span>
                                        <div className="font-medium text-neutral-700 dark:text-neutral-200">{displayProduct.brand?.name || '—'}</div>
                                    </div>
                                    <div>
                                        <span className="text-[10px]  block mb-0.5">Categoría</span>
                                        <div className="font-medium text-neutral-700 dark:text-neutral-200">{displayProduct.category_id || '—'}</div>
                                    </div>
                                    <div>
                                        <span className="text-[10px]  block mb-0.5">Ubicación</span>
                                        <div className="font-medium text-neutral-700 dark:text-neutral-200">{displayProduct.location || '—'}</div>
                                    </div>
                                    <div>
                                        <span className="text-[10px]  block mb-0.5">Actualizado</span>
                                        <div className="font-medium text-neutral-700 dark:text-neutral-200">
                                            {displayProduct.updated_at ? format(new Date(displayProduct.updated_at), 'dd MMM, yy', { locale: es }) : '—'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Product Images */}
                            {displayProduct.images && displayProduct.images.length > 0 && (
                                <>
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold  uppercase tracking-wide">
                                            Imágenes ({displayProduct.images.length})
                                        </h3>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-200">
                                            {displayProduct.images.map((image, idx) => (
                                                <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border border-neutral-200 flex-shrink-0 bg-neutral-50">
                                                    <img
                                                        src={image}
                                                        alt={`${displayProduct.name} - ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Separator className="bg-neutral-100" />
                                </>
                            )}

                            {/* Variants Section - Compact List */}
                            {displayProduct.variants?.length && displayProduct.variants.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-semibold  uppercase tracking-wide">
                                            Variantes ({displayProduct.variants?.length || 0})
                                        </h3>
                                    </div>

                                    <div className="border border-neutral-100 rounded-lg divide-y divide-neutral-100 overflow-hidden">
                                        {displayProduct.variants && displayProduct.variants.length > 0 ? (
                                            displayProduct.variants.map((variant) => (
                                                <div key={variant.id} className="group flex items-start p-2.5 gap-2.5 hover:bg-neutral-50/50 transition-colors">
                                                    {/* Image/Icon */}
                                                    <div className="w-8 h-8 rounded-md bg-neutral-100 border border-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center ">
                                                        {variant.images && variant.images.length > 0 ? (
                                                            <img
                                                                src={variant.images[0]}
                                                                alt={variant.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="h-3 w-3" />
                                                        )}
                                                    </div>

                                                    {/* Main Info */}
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <span className="text-xs font-medium  truncate pr-2">
                                                                {variant.name}
                                                            </span>
                                                            <span className="text-xs font-semibold  flex-shrink-0">
                                                                {variant.price_unit ? `S/ ${variant.price_unit.toFixed(2)}` : '-'}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex flex-wrap gap-1 items-center">
                                                                <span className="text-[10px] font-mono ">{variant.code}</span>
                                                                {variant.attributes?.map((attr, idx) => (
                                                                    <span key={idx} className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 leading-none">
                                                                        {attr.attribute_value}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <div className={`w-1 h-1 rounded-full ${getStockStatus(variant.stock || 0).color}`} />
                                                                <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-200">
                                                                    {variant.stock || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-neutral-500">
                                                No hay variantes disponibles.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer Actions */}
                {showActions && (
                    <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 mt-auto">
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onManageVariants?.(displayProduct)}
                                disabled={!displayProduct.variants || displayProduct.variants.length === 0}
                                className="w-full h-9 text-xs font-medium text-neutral-600 border-neutral-200 hover:bg-neutral-50 dark:text-neutral-200 dark:border-neutral-800 dark:hover:bg-neutral-800"
                            >
                                <Layers className="mr-1.5 h-3.5 w-3.5" />
                                Variantes
                            </Button>
                            <Button
                                onClick={() => onEdit?.(displayProduct)}
                                className="w-full h-9 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800"
                            >
                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                Editar Detalle
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
