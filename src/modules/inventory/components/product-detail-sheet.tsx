'use client'

import { useEffect, useState } from 'react'
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
        if (open && product?.id) {
            setIsLoading(true)
            setDetails(null)

            // Call the REST API route to fetch full product details, variants & attributes
            fetch(`/api/products/${product.id}`)
                .then(async (res) => {
                    if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`)
                    return res.json()
                })
                .then((data: Product) => setDetails(data))
                .catch((err) => console.error('ProductDetailSheet fetch error:', err))
                .finally(() => setIsLoading(false))
        } else if (!open) {
            setDetails(null)
        }
    }, [product?.id, open])

    if (!product) return null

    // Use fetched full details; fallback to list-level product while loading
    const displayProduct = details || product

    const getStockStatus = (stock: number) => {
        if (stock <= 5) return { label: 'Bajo', color: 'bg-red-500', icon: AlertTriangle, textColor: 'text-red-500', borderColor: 'border-red-500' }
        if (stock <= 20) return { label: 'Medio', color: 'bg-yellow-500', icon: Info, textColor: 'text-yellow-500', borderColor: 'border-yellow-500' }
        return { label: 'Alto', color: 'bg-green-500', icon: CheckCircle, textColor: 'text-green-500', borderColor: 'border-green-500' }
    }

    const totalStock = displayProduct.has_variants
        ? (displayProduct.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0)
        : (displayProduct.stock || 0)

    const status = getStockStatus(totalStock)
    const StatusIcon = status.icon

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white border-l shadow-2xl" side="right">
                {/* Minimal Header */}
                <div className="px-6 pt-6 pb-2 relative">
                    {isLoading && (
                        <div className="absolute top-6 right-12 z-20">
                            <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />
                        </div>
                    )}
                    <SheetHeader className="space-y-1.5 text-left">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                                <span>{displayProduct.code}</span>
                                {displayProduct.is_active ? (
                                    <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full ring-1 ring-inset ring-emerald-600/20">
                                        Activo
                                    </span>
                                ) : (
                                    <span className="text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full">
                                        Inactivo
                                    </span>
                                )}
                            </div>
                            <SheetTitle className="text-base font-bold tracking-tight text-neutral-900">
                                {displayProduct.name}
                            </SheetTitle>
                        </div>
                        {displayProduct.description && (
                            <SheetDescription className="text-xs text-neutral-500 leading-relaxed max-w-sm line-clamp-2">
                                {displayProduct.description}
                            </SheetDescription>
                        )}
                    </SheetHeader>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 px-6">
                    <div className="space-y-6 pb-6">
                        {/* Stats Cards - Compact */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50/50 space-y-0.5">
                                <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Stock Total</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-neutral-900">{totalStock}</span>
                                    <span className="text-[10px] text-neutral-500 font-medium">{displayProduct.unit}</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50/50 space-y-0.5">
                                <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Estado</span>
                                <div className={`flex items-center gap-1.5 mt-0.5 ${status.textColor}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                                    <span className="font-semibold text-sm">{status.label}</span>
                                </div>
                            </div>
                        </div>

                        {/* General Details - Compact Grid */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">Información General</h3>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                                <div>
                                    <span className="text-[10px] text-neutral-400 block mb-0.5">Marca</span>
                                    <div className="font-medium text-neutral-700">{displayProduct.brand?.name || '—'}</div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-neutral-400 block mb-0.5">Categoría</span>
                                    <div className="font-medium text-neutral-700">{displayProduct.category_id || '—'}</div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-neutral-400 block mb-0.5">Ubicación</span>
                                    <div className="font-medium text-neutral-700">{displayProduct.location || '—'}</div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-neutral-400 block mb-0.5">Actualizado</span>
                                    <div className="font-medium text-neutral-700">
                                        {displayProduct.updated_at ? format(new Date(displayProduct.updated_at), 'dd MMM, yy', { locale: es }) : '—'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-neutral-100" />

                        {/* Variants Section - Compact List */}
                        {displayProduct.has_variants && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">
                                        Variantes ({displayProduct.variants?.length || 0})
                                    </h3>
                                </div>

                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                                    </div>
                                ) : (
                                    <div className="border border-neutral-100 rounded-lg divide-y divide-neutral-100 bg-white overflow-hidden">
                                        {displayProduct.variants && displayProduct.variants.length > 0 ? (
                                            displayProduct.variants.map((variant) => (
                                                <div key={variant.id} className="group flex items-start p-2.5 gap-2.5 hover:bg-neutral-50/50 transition-colors">
                                                    {/* Image/Icon */}
                                                    <div className="w-8 h-8 rounded-md bg-neutral-100 border border-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center text-neutral-400">
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
                                                            <span className="text-xs font-medium text-neutral-900 truncate pr-2">
                                                                {variant.name}
                                                            </span>
                                                            <span className="text-xs font-semibold text-neutral-900 flex-shrink-0">
                                                                {variant.price_unit ? `S/ ${variant.price_unit.toFixed(2)}` : '-'}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex flex-wrap gap-1 items-center">
                                                                <span className="text-[10px] font-mono text-neutral-400">{variant.code}</span>
                                                                {variant.attributes?.map((attr, idx) => (
                                                                    <span key={idx} className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 leading-none">
                                                                        {attr.attribute_value}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <div className={`w-1 h-1 rounded-full ${getStockStatus(variant.stock || 0).color}`} />
                                                                <span className="text-[10px] font-medium text-neutral-600">
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
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer Actions */}
                {showActions && (
                    <div className="p-4 border-t border-neutral-100 bg-white mt-auto">
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onManageVariants?.(displayProduct)}
                                disabled={!displayProduct.has_variants}
                                className="w-full h-9 text-xs font-medium text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900"
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
