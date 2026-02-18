'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card'
import {
    Search,
    Filter,
    AlertTriangle,
    CheckCircle,
    Info,
    ChevronDown,
    ChevronRight,
    Package,
    Layers,
    Eye
} from 'lucide-react'
import { Product, ProductVariant } from '@/apis/app/product-stock'
import { cn } from '@/lib/utils'
import { ProductDetailSheet } from './product-detail-sheet'

interface InventoryListProps {
    data: Product[]
    totalItems: number
    page: number
    totalPages: number
    businessId: string
}

export const InventoryList = ({
    data,
    totalItems,
    page,
    totalPages,
    businessId
}: InventoryListProps) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const toggleRow = (productId: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [productId]: !prev[productId]
        }))
    }

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString())
        if (searchTerm) {
            params.set('q', searchTerm)
        } else {
            params.delete('q')
        }
        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    const getStockStatus = (stock: number) => {
        if (stock <= 5) return { label: 'Bajo', color: 'bg-red-500', icon: AlertTriangle, textColor: 'text-red-500' }
        if (stock <= 20) return { label: 'Medio', color: 'bg-yellow-500', icon: Info, textColor: 'text-yellow-500' }
        return { label: 'Alto', color: 'bg-green-500', icon: CheckCircle, textColor: 'text-green-500' }
    }

    const lowStockCount = data.reduce((acc, p) => {
        const total = p.has_variants
            ? (p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0)
            : (p.stock || 0)
        return total <= 5 ? acc + 1 : acc
    }, 0)

    const handleViewProduct = (product: Product) => {
        setSelectedProduct(product)
    }

    const handleEditProduct = (product: Product) => {
        // Logic to navigate to edit page
        router.push(`${pathname}/${product.id}/edit`)
        // Or if modal, logic here. Assuming route based.
    }

    const handleManageVariants = (product: Product) => {
        // Logic to navigate to variants management
        router.push(`${pathname}/${product.id}/variants`)
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                        <p className="text-xs text-muted-foreground">Productos registrados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertas Stock Bajo</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{lowStockCount}</div>
                        <p className="text-xs text-muted-foreground">En esta página</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Variantes Activas</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.reduce((acc, p) => acc + (p.variants?.length || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">En esta página</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold">Listado de Inventario</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por nombre, código..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <Button onClick={handleSearch}>Buscar</Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría / Marca</TableHead>
                            <TableHead className="text-right">Stock Total</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No se encontraron productos en el inventario.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((product) => {
                                const totalStock = product.has_variants
                                    ? (product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0)
                                    : (product.stock || 0)
                                const status = getStockStatus(totalStock)
                                const StatusIcon = status.icon
                                const isExpanded = expandedRows[product.id]

                                return (
                                    <>
                                        <TableRow
                                            key={product.id}
                                            className={cn("cursor-pointer hover:bg-muted/50", isExpanded && "bg-muted/50")}
                                            onClick={() => handleViewProduct(product)}
                                        >
                                            <TableCell>
                                                {(product.has_variants || (product.variants && product.variants.length > 0)) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="p-0 h-8 w-8"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleRow(product.id)
                                                        }}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {product.code}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 group">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{product.name}</span>
                                                        {product.has_variants && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {product.variants?.length} variantes
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Eye className="h-3 w-3 text-blue-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span>{product.brand?.name || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {
                                                    product?.variants &&
                                                        product?.variants?.length > 0 ? <>
                                                        <span className="text-xs text-muted-foreground italic">Ver detalles</span>
                                                    </> : <span>
                                                        {totalStock} <span className="text-xs font-normal text-muted-foreground">{product.unit}</span>
                                                    </span>
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {
                                                    product?.variants &&
                                                        product?.variants?.length > 0 ? <>
                                                        <Badge variant="outline">Variantes</Badge>
                                                    </> : <div className={`flex items-center gap-1 ${status.textColor}`}>
                                                        <StatusIcon className="h-4 w-4" />
                                                        <span className="text-sm font-medium">{status.label}</span>
                                                    </div>
                                                }
                                            </TableCell>
                                        </TableRow>
                                        {/* Variants Row */}
                                        {(product.has_variants || (product.variants && product.variants.length > 0)) && isExpanded && (
                                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                <TableCell colSpan={6} className="p-0">
                                                    <div className="p-4 pl-14">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="h-8">Código Var.</TableHead>
                                                                    <TableHead className="h-8">Variante</TableHead>
                                                                    <TableHead className="h-8">Precio</TableHead>
                                                                    <TableHead className="h-8 text-right">Stock</TableHead>
                                                                    <TableHead className="h-8">Estado</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {product.variants?.map((variant) => {
                                                                    const vStatus = getStockStatus(variant.stock || 0)
                                                                    const VStatusIcon = vStatus.icon
                                                                    return (
                                                                        <TableRow key={variant.id} className="border-0">
                                                                            <TableCell className="py-2 font-mono text-xs">{variant.code}</TableCell>
                                                                            <TableCell className="py-2">
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-sm font-medium">{variant.name}</span>
                                                                                    <span className="text-xs text-muted-foreground">
                                                                                        {variant.attributes?.map(a => `${a.attribute_type}: ${a.attribute_value}`).join(', ')}
                                                                                    </span>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="py-2 text-sm">
                                                                                {variant.price_unit ? `S/ ${variant.price_unit.toFixed(2)}` : '-'}
                                                                            </TableCell>
                                                                            <TableCell className="py-2 text-right font-bold">
                                                                                {variant.stock}
                                                                            </TableCell>
                                                                            <TableCell className="py-2">
                                                                                <Badge variant="outline" className={`${vStatus.textColor} border-current gap-1`}>
                                                                                    <VStatusIcon className="h-3 w-3" />
                                                                                    {vStatus.label}
                                                                                </Badge>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                )
                            })
                        )}
                    </TableBody >
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="text-sm text-muted-foreground mr-4">
                        Página {page} de {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Siguiente
                    </Button>
                </div>
            )}

            <ProductDetailSheet
                product={selectedProduct}
                open={!!selectedProduct}
                onOpenChange={(open) => !open && setSelectedProduct(null)}
                onEdit={handleEditProduct}
                onManageVariants={handleManageVariants}
            />
        </div>
    )
}
