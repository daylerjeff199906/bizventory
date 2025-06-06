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
  PackageSearch,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { PurchaseList } from '@/types'
import { APP_URLS } from '@/config/app-urls'
import { StatusBadge } from '../components'

type SortField = 'code' | 'date' | 'subtotal' | 'created_at' | 'updated_at'
type SortDirection = 'asc' | 'desc'

interface PurchasesListProps {
  purchasesData: PurchaseList[]
  searchQuery?: string
}

export const PurchasesList = ({
  purchasesData = [],
  searchQuery = ''
}: PurchasesListProps) => {
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

  return (
    <div className="rounded-md border bg-white shadow-none overflow-auto max-h-[70vh] w-full">
      <div className="overflow-x-auto min-w-full">
        <Table className="min-w-[920px]">
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
              <TableHead className="border-r border-gray-200">
                Proveedor
              </TableHead>
              <TableHead className="border-r border-gray-200">Guía</TableHead>
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
              <TableHead className="border-r border-gray-200">Total</TableHead>
              <TableHead className="border-r border-gray-200">
                Est. Compra
              </TableHead>
              <TableHead className="border-r border-gray-200">
                Est. Pago
              </TableHead>
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
            {purchasesData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <PackageSearch className="h-12 w-12 text-gray-400" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {searchQuery
                          ? 'No se encontraron coincidencias'
                          : 'No hay compras registradas'}
                      </h3>
                      <p className="text-sm text-gray-500 max-w-md">
                        {searchQuery
                          ? `No se encontraron compras que coincidan con "${searchQuery}". Intenta con otro término de búsqueda.`
                          : 'Parece que aún no has agregado ninguna compra. Comienza agregando tu primera compra.'}
                      </p>
                    </div>
                    <Button asChild>
                      <Link href={APP_URLS.PURCHASES.CREATE}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Compra
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              purchasesData.map((purchase) => (
                <TableRow key={purchase.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium border-r border-gray-100">
                    <Badge variant="outline" className="font-mono">
                      {purchase.code || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="border-r border-gray-100">
                    <div className="text-sm">
                      {purchase.date
                        ? formatDate(
                            purchase.date instanceof Date
                              ? purchase.date.toISOString()
                              : purchase.date
                          )
                        : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="border-r border-gray-100">
                    <div>
                      <div className="font-medium">
                        {purchase.supplier?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {purchase.supplier?.contact || ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="border-r border-gray-100">
                    {purchase.guide_number ? (
                      <Badge variant="secondary">{purchase.guide_number}</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">Sin guía</span>
                    )}
                  </TableCell>
                  <TableCell className="border-r border-gray-100">
                    <div className="font-medium">
                      {formatCurrency(purchase.subtotal || 0)}
                    </div>
                    {purchase.discount && purchase.discount > 0 && (
                      <div className="text-xs text-red-600">
                        -{formatCurrency(purchase.discount)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="border-r border-gray-100">
                    <div className="font-bold">
                      {formatCurrency(purchase.total_amount || 0)}
                    </div>
                    {purchase.tax_amount && purchase.tax_amount > 0 && (
                      <div className="text-xs text-gray-500">
                        IGV: {formatCurrency(purchase.tax_amount)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="border-r border-gray-100">
                    <StatusBadge status={purchase.status} />
                  </TableCell>
                  <TableCell className="border-r border-gray-100">
                    <StatusBadge payment_status={purchase.payment_status} />
                  </TableCell>
                  <TableCell className="border-r border-gray-100">
                    <div className="text-sm">
                      <div>
                        {purchase.created_at
                          ? formatDate(
                              purchase.created_at instanceof Date
                                ? purchase.created_at.toISOString()
                                : purchase.created_at
                            )
                          : 'N/A'}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {purchase.created_at
                          ? formatTime(
                              purchase.created_at instanceof Date
                                ? purchase.created_at.toISOString()
                                : purchase.created_at
                            )
                          : ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="border-r border-gray-100">
                    <div className="text-sm">
                      <div>
                        {purchase.updated_at
                          ? formatDate(
                              purchase.updated_at instanceof Date
                                ? purchase.updated_at.toISOString()
                                : purchase.updated_at
                            )
                          : 'N/A'}
                      </div>
                      {purchase.updated_at && (
                        <div className="text-gray-500 text-xs">
                          {formatTime(
                            purchase.updated_at instanceof Date
                              ? purchase.updated_at.toISOString()
                              : purchase.updated_at
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Link href={APP_URLS.PURCHASES.VIEW(purchase.id)}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
