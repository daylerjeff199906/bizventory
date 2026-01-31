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
import { Search, Filter, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Product } from '@/apis/app/product-stock'

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
        if (stock <= 5) return { label: 'Bajo', color: 'bg-red-500', icon: AlertTriangle }
        if (stock <= 20) return { label: 'Medio', color: 'bg-yellow-500', icon: Info }
        return { label: 'Alto', color: 'bg-green-500', icon: CheckCircle }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Inventario</h2>
                    <p className="text-muted-foreground">
                        Gestiona y monitorea el stock de tus productos
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar producto..."
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
                            <TableHead>Código</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Stock Total</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No se encontraron productos.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((product) => {
                                // Calculate total stock including variants
                                const totalStock = product.has_variants
                                    ? (product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0)
                                    : (product.stock || 0)

                                const status = getStockStatus(totalStock)
                                const StatusIcon = status.icon

                                return (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-mono text-xs">{product.code}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{product.name}</span>
                                                {product.has_variants && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {product.variants?.length} variantes
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell className="text-right font-bold text-lg">
                                            {totalStock} {product.unit}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${status.color} hover:${status.color} text-white gap-1`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        Anterior
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Página {page} de {totalPages}
                    </div>
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
        </div>
    )
}
