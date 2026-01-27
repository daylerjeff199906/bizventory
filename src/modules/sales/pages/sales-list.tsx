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
  TableRow
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
  Printer
} from 'lucide-react'
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
}

export const SalesList = ({
  salesData,
  searchQuery = '',
  businessId
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
      <Table className="border rounded-md">
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100">
            <TableHead className="border-r border-gray-200">
              <Button
                variant="ghost"
                onClick={() => handleSort('code')}
                className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
              >
                Código
                {getSortIcon('code')}
              </Button>
            </TableHead>
            <TableHead className="border-r border-gray-200">
              <Button
                variant="ghost"
                onClick={() => handleSort('date')}
                className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
              >
                Fecha
                {getSortIcon('date')}
              </Button>
            </TableHead>
            <TableHead className="border-r border-gray-200">Cliente</TableHead>
            <TableHead className="border-r border-gray-200">
              <Button
                variant="ghost"
                onClick={() => handleSort('subtotal')}
                className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
              >
                Subtotal
                {getSortIcon('subtotal')}
              </Button>
            </TableHead>
            <TableHead className="border-r border-gray-200">
              <Button
                variant="ghost"
                onClick={() => handleSort('total_amount')}
                className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
              >
                Total
                {getSortIcon('total_amount')}
              </Button>
            </TableHead>
            <TableHead className="border-r border-gray-200">Estado</TableHead>
            <TableHead className="border-r border-gray-200">Pago</TableHead>
            <TableHead className="border-r border-gray-200">
              <Button
                variant="ghost"
                onClick={() => handleSort('created_at')}
                className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
              >
                Creado
                {getSortIcon('created_at')}
              </Button>
            </TableHead>
            <TableHead className="border-r border-gray-200">
              <Button
                variant="ghost"
                onClick={() => handleSort('updated_at')}
                className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
              >
                Actualizado
                {getSortIcon('updated_at')}
              </Button>
            </TableHead>
            <TableHead className="w-[80px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salesData.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <ShoppingCart className="h-12 w-12 text-gray-400" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {searchQuery
                        ? 'No se encontraron coincidencias'
                        : 'No hay ventas registradas'}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      {searchQuery
                        ? `No se encontraron ventas que coincidan con "${searchQuery}". Intenta con otro término de búsqueda.`
                        : 'Parece que aún no has agregado ninguna venta. Comienza agregando tu primera venta.'}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={APP_URLS.SALES.CREATE}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Venta
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            salesData.data.map((sale) => (
              <TableRow key={sale.id} className="hover:bg-gray-50">
                <TableCell className="font-medium border-r border-gray-100">
                  <Badge variant="outline" className="font-mono">
                    {sale.reference_number || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="border-r border-gray-100">
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
                <TableCell className="border-r border-gray-100">
                  <div className="font-medium uppercase">
                    {sale.customer?.name || 'Cliente varios'}
                  </div>
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <div className="font-medium">
                    {formatCurrency(sale.total_amount || 0)}
                  </div>
                  {typeof sale.discount_amount === 'number' &&
                    sale.discount_amount > 0 && (
                      <div className="text-xs text-red-600">
                        -{formatCurrency(sale.discount_amount)}
                      </div>
                    )}
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <div className="font-bold">
                    {formatCurrency(sale.total_amount || 0)}
                  </div>
                  {typeof sale.tax_amount === 'number' &&
                    sale.tax_amount > 0 && (
                      <div className="text-xs text-gray-500">
                        IGV: {formatCurrency(sale.tax_amount)}
                      </div>
                    )}
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <StatusBadge status={sale.status} />
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <StatusBadge
                    payment_method={
                      sale.payment_method
                        ? sale.payment_method.toLowerCase()
                        : undefined
                    }
                  />
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <div className="text-sm">
                    {sale?.created_at
                      ? `${formatDate(sale.created_at)} ${formatTime(
                          sale.created_at
                        )}`
                      : 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <div className="text-sm">
                    {sale?.updated_at ? formatDate(sale.updated_at) : 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Link href={APP_URLS.SALES.PRINT(sale.id)}>
                      <Printer className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Paginación */}
      {salesData.total_pages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Mostrando {salesData.data.length} de {salesData.total} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={salesData.page <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(salesData.page - 1)}
              disabled={salesData.page <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Página {salesData.page} de {salesData.total_pages}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(salesData.total_pages)}
              disabled={salesData.page >= salesData.total_pages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
