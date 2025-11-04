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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Eye,
  PackageSearch,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  FileText
} from 'lucide-react'
import { PurchaseList } from '@/types'
import { APP_URLS } from '@/config/app-urls'
import { StatusBadge } from '../components'
import { isNumberForRender } from '@/utils'

type SortField = 'code' | 'date' | 'subtotal' | 'created_at' | 'updated_at'
type SortDirection = 'asc' | 'desc'

interface PurchasesListProps {
  purchasesData: PurchaseList[]
  searchQuery?: string
  isReceiptPage?: boolean
  businessId?: string
}

export const PurchasesList = ({
  purchasesData = [],
  searchQuery = '',
  businessId
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
    <div className="rounded-md border bg-white w-full overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted">
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
              <div className="font-medium">Proveedor</div>
            </TableHead>
            <TableHead>
              <div className="font-medium">Guía</div>
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
              <div className="font-medium">Est. Pago</div>
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
          {purchasesData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <PackageSearch className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-1 text-center">
                    <h3 className="text-lg font-medium">
                      {searchQuery
                        ? 'No se encontraron coincidencias'
                        : 'No hay compras registradas'}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      {searchQuery
                        ? `No se encontraron compras que coincidan con "${searchQuery}". Intenta con otro término de búsqueda.`
                        : 'Parece que aún no has agregado ninguna compra. Comienza agregando tu primera compra.'}
                    </p>
                  </div>
                  {businessId && (
                    <Button asChild>
                      <Link
                        href={APP_URLS.ORGANIZATION.PURCHASES.CREATE(
                          businessId
                        )}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Compra
                      </Link>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            purchasesData.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="font-mono rounded-full text-xs"
                  >
                    {purchase.code || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
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
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">
                      {purchase.supplier?.name || 'N/A'}
                    </div>
                    {purchase.supplier?.contact && (
                      <div className="text-xs text-muted-foreground">
                        {purchase.supplier.contact}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {purchase.guide_number ? (
                    <Badge variant="secondary" className="text-xs">
                      {purchase.guide_number}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      Sin guía
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-medium text-sm">
                    {formatCurrency(purchase.subtotal || 0)}
                  </div>
                  {isNumberForRender(purchase.discount) && (
                    <div className="text-xs text-muted-foreground">
                      Desc.: {formatCurrency(Number(purchase.discount))}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-bold text-sm">
                    {formatCurrency(purchase.total_amount || 0)}
                  </div>
                  {isNumberForRender(purchase.tax_amount) && (
                    <div className="text-xs text-muted-foreground">
                      IGV: {formatCurrency(Number(purchase.tax_amount))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge payment_status={purchase.payment_status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {purchase.created_at
                        ? formatDate(
                            purchase.created_at instanceof Date
                              ? purchase.created_at.toISOString()
                              : purchase.created_at
                          )
                        : 'N/A'}
                    </span>
                    {purchase.created_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(
                          purchase.created_at instanceof Date
                            ? purchase.created_at.toISOString()
                            : purchase.created_at
                        )}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={APP_URLS.ORGANIZATION.PURCHASES.VIEW(
                              businessId || '',
                              purchase.id
                            )}
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={APP_URLS.ORGANIZATION.PURCHASES.EDIT(
                              businessId || '',
                              purchase.id
                            )}
                            className="flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Editar compra
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {purchasesData.length > 0 && (
        <div className="px-4 py-3 text-sm text-muted-foreground border-t">
          {purchasesData.length} compra
          {purchasesData.length !== 1 ? 's' : ''} mostrada
          {purchasesData.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
