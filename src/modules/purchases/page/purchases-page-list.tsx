'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { toast } from 'react-toastify'
import { deletePurchase } from '@/apis/app/purchases'
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
  meta?: {
    total: number
    total_pages: number
    page: number
    page_size: number
  }
  filters?: {
    from?: string
    to?: string
  }
}


export const PurchasesList = ({
  purchasesData = [],
  searchQuery = '',
  businessId,
  meta,
  filters
}: PurchasesListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentSort = searchParams.get('sortBy')?.split('.') || []
  const [sortField, setSortField] = useState<SortField | null>(
    (currentSort[0] as SortField) || null
  )
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    (currentSort[1] as SortDirection) || 'asc'
  )

  // Local state for filters to avoid excessive URL updates while typing
  const [codeFilter, setCodeFilter] = useState(searchQuery)
  const [dateFrom, setDateFrom] = useState(filters?.from || '')
  const [dateTo, setDateTo] = useState(filters?.to || '')

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1')
    router.replace(`${pathname}?${params.toString()}`)
  }

  const handleSearch = (term: string) => {
    setCodeFilter(term)
  }

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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-2 h-3 w-3" />
    )
  }

  const confirmDelete = (id: string) => {
    setPurchaseToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handlePurchaseDelete = async () => {
    if (!purchaseToDelete) return

    setIsDeleting(true)
    try {
      await deletePurchase(purchaseToDelete)
      toast.success('Compra eliminada correctamente')
      router.refresh()
      setDeleteDialogOpen(false)
      setPurchaseToDelete(null)
    } catch (error) {
      console.error(error)
      toast.error('Error al eliminar la compra')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="space-y-4 w-full">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center bg-card p-4 rounded-lg border">
          <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center w-full">
            <div className="grid gap-1.5 w-full sm:w-auto">
              <Label htmlFor="code" className="text-xs">Buscar código</Label>
              <div className="relative">
                <PackageSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="code"
                  placeholder="Cód. Compra..."
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
        {
          (searchQuery || filters?.from || filters?.to) && (
            <div className="flex items-center gap-2 flex-wrap">
              {searchQuery && (
                <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                  Código: {searchQuery}
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
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          asChild
                        >
                          <Link
                            href={APP_URLS.ORGANIZATION.PURCHASES.VIEW(
                              businessId || '',
                              purchase.id
                            )}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50"
                          asChild
                        >
                          <Link
                            href={APP_URLS.ORGANIZATION.PURCHASES.EDIT(
                              businessId || '',
                              purchase.id
                            )}
                            title="Editar compra"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => confirmDelete(purchase.id)}
                          title="Eliminar compra"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        {/* Pagination Footer */}
        {
          meta && meta.total_pages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Mostrando {purchasesData.length} de {meta.total} compras
                {meta.total_pages > 1 && ` (Página ${meta.page} de ${meta.total_pages})`}
              </div>

              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="text-sm font-medium mx-2">
                  {meta.page}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= meta.total_pages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        }

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar compra?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el registro de la compra.
                <br />
                <br />
                <strong className="text-destructive">
                  Nota: Si la compra estaba marcada como completada, se descontará automáticamente el stock de los productos.
                </strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handlePurchaseDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div >
    </>
  )
}
