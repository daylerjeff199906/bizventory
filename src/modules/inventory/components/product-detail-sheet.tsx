'use client'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Edit,
    Layers,
    Package,
    AlertTriangle,
    Info,
    CheckCircle,
    X
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
}

export const ProductDetailSheet = ({
    product,
    open,
    onOpenChange,
    onEdit,
    onManageVariants
}: ProductDetailSheetProps) => {
    if (!product) return null

    const getStockStatus = (stock: number) => {
        if (stock <= 5) return { label: 'Bajo', color: 'bg-red-500', icon: AlertTriangle, textColor: 'text-red-500', borderColor: 'border-red-500' }
        if (stock <= 20) return { label: 'Medio', color: 'bg-yellow-500', icon: Info, textColor: 'text-yellow-500', borderColor: 'border-yellow-500' }
        return { label: 'Alto', color: 'bg-green-500', icon: CheckCircle, textColor: 'text-green-500', borderColor: 'border-green-500' }
    }

    const totalStock = product.has_variants
        ? (product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0)
        : (product.stock || 0)

    const status = getStockStatus(totalStock)
    const StatusIcon = status.icon

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-background" side="right">
                {/* Header */}
                <div className="p-6 pb-2">
                    <SheetHeader className="space-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <SheetTitle className="text-xl font-bold line-clamp-2">
                                    {product.name}
                                </SheetTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                                    <Package className="h-3 w-3" />
                                    {product.code}
                                </div>
                            </div>
                            {/* Close button provided by SheetContent usually, but we can have custom if needed */}
                        </div>
                        {product.description && (
                            <SheetDescription className="line-clamp-3 mt-2">
                                {product.description}
                            </SheetDescription>
                        )}
                    </SheetHeader>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className="flex-1 px-6">
                    <div className="space-y-6 pb-6">
                        {/* Status & Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-1.5 p-3 border rounded-lg bg-muted/20">
                                <span className="text-xs font-medium text-muted-foreground">Estado del Stock</span>
                                <div className={`flex items-center gap-1.5 ${status.textColor}`}>
                                    <StatusIcon className="h-4 w-4" />
                                    <span className="font-semibold">{status.label}</span>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-1.5 p-3 border rounded-lg bg-muted/20">
                                <span className="text-xs font-medium text-muted-foreground">Stock Total</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{totalStock}</span>
                                    <span className="text-xs text-muted-foreground">{product.unit || 'und'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Detalles Generales
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Marca</span>
                                    <div className="font-medium">{product.brand?.name || '-'}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Categoría</span>
                                    <div className="font-medium">{product.category_id || '-'}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Creado el</span>
                                    <div className="font-medium">
                                        {product.created_at ? format(new Date(product.created_at), 'PP', { locale: es }) : '-'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Ubicación</span>
                                    <div className="font-medium">{product.location || '-'}</div>
                                </div>
                                {!product.has_variants && (
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground">Precio Unitario</span>
                                        <div className="font-medium">
                                            {product.price_unit ? `S/ ${product.price_unit.toFixed(2)}` : '-'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Variants Section */}
                        {product.has_variants && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm flex items-center gap-2">
                                        <Layers className="h-4 w-4" />
                                        Variantes ({product.variants?.length || 0})
                                    </h3>
                                </div>

                                <div className="border rounded-md overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="h-8 text-xs w-[80px]">Código</TableHead>
                                                <TableHead className="h-8 text-xs">Variante</TableHead>
                                                <TableHead className="h-8 text-xs text-right">Stock</TableHead>
                                                <TableHead className="h-8 text-xs text-right">Precio</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {product.variants?.map((variant) => {
                                                const vStatus = getStockStatus(variant.stock || 0)
                                                return (
                                                    <TableRow key={variant.id}>
                                                        <TableCell className="py-2 text-xs font-mono">
                                                            {variant.code}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-xs">
                                                            <div className="space-y-0.5">
                                                                <span className="font-medium block">{variant.name}</span>
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {variant.attributes?.map(a => a.attribute_value).join(', ')}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2 text-xs text-right font-medium">
                                                            <Badge variant="outline" className={`h-5 px-1.5 ${vStatus.borderColor} ${vStatus.textColor}`}>
                                                                {variant.stock}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-2 text-xs text-right">
                                                            {variant.price_unit ? `S/ ${variant.price_unit.toFixed(2)}` : '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Sticky Footer Actions */}
                <div className="p-4 border-t bg-background mt-auto sticky bottom-0 z-10">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onManageVariants?.(product)}
                            disabled={!product.has_variants}
                            className="w-full"
                        >
                            <Layers className="mr-2 h-4 w-4" />
                            Gest. Variantes
                        </Button>
                        <Button
                            onClick={() => onEdit?.(product)}
                            className="w-full"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Producto
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
