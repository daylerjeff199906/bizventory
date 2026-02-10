'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Eye,
  ShoppingCart,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Printer,
  PackageSearch,
  Filter,
  X,
  Calendar
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SaleList, ResApi } from '@/apis/app/sales'
import { APP_URLS } from '@/config/app-urls'
import { StatusBadge } from '../components/status-badge'

type SortField =
  | 'code'
  | 'date'
  | 'subtotal'
  | 'total_amount'
  | 'created_at'
  | 'updated_at'
type SortDirection = 'asc' | 'desc'

interface SalesListProps {
  businessId: string
  salesData: ResApi<SaleList>
  searchQuery?: string
  filters?: {
    from?: string
    to?: string
  }
}

export const SalesList = ({
  salesData,
  searchQuery = '',
  businessId,
  filters
}: SalesListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get('sortBy')?.split('.') || []
  const [sortField, setSortField] = useState<SortField | null>(
    (currentSort[0] as SortField) || null
  )
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    (currentSort[1] as SortDirection) || 'asc'
  )

  // Local state for filters
  const [codeFilter, setCodeFilter] = useState(searchQuery)
  const [dateFrom, setDateFrom] = useState(filters?.from || '')
  const [dateTo, setDateTo] = useState(filters?.to || '')

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (codeFilter) params.set('q', codeFilter)
    else params.delete('q')

    if (dateFrom) params.set('from', dateFrom)
    else params.delete('from')

    if (dateTo) params.set('to', dateTo)
    else params.delete('to')

    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('from')
    params.delete('to')
    setCodeFilter('')
    setDateFrom('')
    setDateTo('')
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc'

    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    }

    setSortField(field)
    setSortDirection(newDirection)

    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', `${field}.${newDirection}`)
    router.push(`${pathname}?${params.toString()}`)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-2 h-3 w-3" />
    )
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center bg-card p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center w-full">
          <div className="grid gap-1.5 w-full sm:w-auto">
            <Label htmlFor="code" className="text-xs">Buscar referencia</Label>
            <div className="relative">
              <PackageSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="code"
                placeholder="Ref. Venta..."
                className="pl-9 w-full sm:w-[200px]"
                value={codeFilter}
                onChange={(e) => setCodeFilter(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="grid gap-1.5 w-full">
              <Label htmlFor="from" className="text-xs">Desde</Label>
              <Input
                id="from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>
            <div className="grid gap-1.5 w-full">
              <Label htmlFor="to" className="text-xs">Hasta</Label>
              <Input
                id="to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <Button onClick={applyFilters} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            {(searchQuery || filters?.from || filters?.to) && (
              <Button variant="ghost" size="sm" onClick={clearSearch} title="Limpiar filtros">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Badges */}
      {
        (searchQuery || filters?.from || filters?.to) && (
          <div className="flex items-center gap-2 flex-wrap">
            {searchQuery && (
              <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                Ref: {searchQuery}
                <button onClick={() => {
                  setCodeFilter('')
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('q')
                  router.push(`${pathname}?${params.toString()}`)
                }} className="ml-1 hover:bg-muted rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters?.from && (
              <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                Desde: {formatDate(filters.from)}
                <button onClick={() => {
                  setDateFrom('')
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('from')
                  router.push(`${pathname}?${params.toString()}`)
                }} className="ml-1 hover:bg-muted rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters?.to && (
              <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                Hasta: {formatDate(filters.to)}
                <button onClick={() => {
                  setDateTo('')
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('to')
                  router.push(`${pathname}?${params.toString()}`)
                }} className="ml-1 hover:bg-muted rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )
      }

      <div className="rounded-md border w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('code')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Código
                  {getSortIcon('code')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('date')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Fecha
                  {getSortIcon('date')}
                </Button>
              </TableHead>
              <TableHead>
                <div className="font-medium">Cliente</div>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('subtotal')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Subtotal
                  {getSortIcon('subtotal')}
                </Button>
              </TableHead>
              <TableHead>
                <div className="font-medium">Total</div>
              </TableHead>
              <TableHead>
                <div className="font-medium">Estado</div>
              </TableHead>
              <TableHead>
                <div className="font-medium">Pago</div>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('created_at')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Creado
                  {getSortIcon('created_at')}
                </Button>
              </TableHead>
              <TableHead className="w-[80px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesData.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">
                        {searchQuery
                          ? 'No se encontraron coincidencias'
                          : 'No hay ventas registradas'}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {searchQuery
                          ? `No se encontraron ventas que coincidan con "${searchQuery}". Intenta con otro término de búsqueda.`
                          : 'Parece que aún no has agregado ninguna venta. Comienza agregando tu primera venta.'}
                      </p>
                    </div>
                    <Button asChild>
                      <Link href={APP_URLS.ORGANIZATION.SALES.CREATE(businessId)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Venta
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              salesData.data.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono rounded-full text-xs">
                      {sale.reference_number || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {sale.date
                        ? formatDate(
                          sale.date &&
                            typeof sale.date === 'object' &&
                            (sale.date as object) instanceof Date
                            ? (sale.date as Date).toISOString()
                            : sale.date
                        )
                        : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">
                      {sale.customer?.person?.name || 'Cliente varios'}
                    </div>
                    {sale.customer?.person?.document_number && (
                      <div className="text-xs text-muted-foreground">
                        {sale.customer.person.document_number}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">
                      {formatCurrency(sale.total_amount || 0)}
                    </div>
                    {typeof sale.discount_amount === 'number' &&
                      sale.discount_amount > 0 && (
                        <div className="text-xs text-red-600">
                          -{formatCurrency(sale.discount_amount)}
                        </div>
                      )}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-sm">
                      {formatCurrency(sale.total_amount || 0)}
                    </div>
                    {typeof sale.tax_amount === 'number' &&
                      sale.tax_amount > 0 && (
                        <div className="text-xs text-muted-foreground">
                          IGV: {formatCurrency(sale.tax_amount)}
                        </div>
                      )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sale.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      payment_method={
                        sale.payment_method
                          ? sale.payment_method.toLowerCase()
                          : undefined
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {sale?.created_at
                          ? formatDate(sale.created_at)
                          : 'N/A'}
                      </span>
                      {sale?.created_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(sale.created_at)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50"
                        title="Ver detalles"
                      >
                        <Link
                          href={APP_URLS.ORGANIZATION.SALES.VIEW(
                            businessId,
                            sale.id
                          )}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}

          </TableBody>
          {salesData.data.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-medium text-right">
                  Totales (Página)
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(
                    salesData.data.reduce(
                      (acc, sale) => acc + (sale.total_amount || 0),
                      0
                    )
                  )}
                </TableCell>
                <TableCell className="font-bold">
                  {formatCurrency(
                    salesData.data.reduce(
                      (acc, sale) => acc + (sale.total_amount || 0),
                      0
                    )
                  )}
                </TableCell>
                <TableCell colSpan={4} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
        {salesData.data.length > 0 && (
          <div className="px-4 py-3 text-sm text-muted-foreground border-t">
            {salesData.data.length} venta
            {salesData.data.length !== 1 ? 's' : ''} mostrada
            {salesData.data.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Paginación */}
      {
        salesData.total_pages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Mostrando {salesData.data.length} de {salesData.total} ventas
              {salesData.total_pages > 1 && ` (Página ${salesData.page} de ${salesData.total_pages})`}
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(salesData.page - 1)}
                disabled={salesData.page <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium mx-2">
                {salesData.page}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(salesData.page + 1)}
                disabled={salesData.page >= salesData.total_pages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      }
    </div >
  )
}
