'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Loader2,
  PackageSearch,
  Trash,
  Eye,
  PlusSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
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
import { ResApi } from '@/types'
import { APP_URLS } from '@/config/app-urls'
import { cn } from '@/lib/utils'
import { DeleteProductDialog } from '../components/delete-product-dialog'
import { ProductDetailSheet } from '@/modules/inventory/components/product-detail-sheet'
import { Product } from '@/apis/app/product-stock'

type SortField = 'name' | 'updated_at' | 'created_at' | 'price' | 'code'
type SortDirection = 'asc' | 'desc'

interface ProductsListProps {
  dataProducts: ResApi<Product>
  isLoading?: boolean
  searchQuery?: string
  bussinessId: string
}

export const ProductsList = ({
  dataProducts,
  isLoading = false,
  searchQuery = '',
  bussinessId
}: ProductsListProps) => {
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

  const [productToDelete, setProductToDelete] = useState<{ id: string, name: string } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

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

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc'

    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    }

    setSortField(field)
    setSortDirection(newDirection)

    // Update URL with sort parameters
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', `${field}.${newDirection}`)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
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

  const confirmDelete = (product: Product) => {
    setProductToDelete({ id: product.id, name: product.name })
    setIsDeleteDialogOpen(true)
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleEditProduct = (product: Product) => {
    router.push(APP_URLS.ORGANIZATION.PRODUCTS.EDIT(bussinessId, product.id))
  }

  const handleManageVariants = (product: Product) => {
    // Using the same route as the existing "PlusSquare" button
    router.push(APP_URLS.ORGANIZATION.PRODUCTS.CREATE_VARIANT(bussinessId, product.id))
  }

  return (
    <div className="rounded-md border w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-[100px] h-9">
              <Button
                variant="ghost"
                onClick={() => handleSort('code')}
                className="h-auto p-0 text-xs font-semibold hover:bg-transparent uppercase tracking-wider"
              >
                Código
                {getSortIcon('code')}
              </Button>
            </TableHead>
            <TableHead className="h-9 text-xs font-semibold uppercase tracking-wider">
              Marca
            </TableHead>
            <TableHead className="h-9">
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="h-auto p-0 text-xs font-semibold hover:bg-transparent uppercase tracking-wider"
              >
                Producto
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead className="h-9 text-xs font-semibold uppercase tracking-wider">
              Unidad
            </TableHead>
            <TableHead className="h-9 text-xs font-semibold uppercase tracking-wider">
              Estado
            </TableHead>
            <TableHead className="h-9">
              <Button
                variant="ghost"
                onClick={() => handleSort('created_at')}
                className="h-auto p-0 text-xs font-semibold hover:bg-transparent uppercase tracking-wider"
              >
                Creado
                {getSortIcon('created_at')}
              </Button>
            </TableHead>
            <TableHead className="h-9">
              <Button
                variant="ghost"
                onClick={() => handleSort('updated_at')}
                className="h-auto p-0 text-xs font-semibold hover:bg-transparent uppercase tracking-wider"
              >
                Actualizado
                {getSortIcon('updated_at')}
              </Button>
            </TableHead>
            <TableHead className="w-[80px] h-9 text-right text-xs font-semibold uppercase tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Cargando productos...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : dataProducts?.data?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <PackageSearch className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-1 text-center">
                    <h3 className="text-sm font-medium">
                      {searchQuery
                        ? 'No se encontraron coincidencias'
                        : 'No hay productos registrados'}
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md">
                      {searchQuery
                        ? `No se encontraron productos que coincidan con "${searchQuery}". Intenta con otro término de búsqueda.`
                        : 'Parece que aún no has agregado ningún producto. Comienza agregando tu primer producto.'}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link
                      href={APP_URLS.ORGANIZATION.PRODUCTS.CREATE(bussinessId)}
                    >
                      Agregar nuevo producto
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            dataProducts?.data?.map((product) => (
              <TableRow
                key={product.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewProduct(product)}
              >
                <TableCell className="py-2">
                  <Badge
                    variant="outline"
                    className="font-mono rounded-full text-[10px] px-2"
                  >
                    {product.code}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-xs text-muted-foreground">
                    {product?.brand ? product?.brand?.name : '-'}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-muted rounded-md flex-shrink-0 overflow-hidden border">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-muted-foreground text-[10px]">
                            N/A
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 max-w-md">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-medium break-words whitespace-normal group-hover:underline line-clamp-1">
                          {product.name}
                        </h2>
                        <Eye className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[10px] text-muted-foreground break-words whitespace-normal line-clamp-1">
                        {product.description || 'Sin descripción'}
                      </p>
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {product.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] px-1 h-4"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-xs text-muted-foreground uppercase">
                    {product.unit || 'und'}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <Badge
                    className={cn('text-[10px] rounded-full px-2', {
                      'bg-green-100 text-green-800 hover:bg-green-100': product.is_active,
                      'bg-red-100 text-red-800 hover:bg-red-100': !product.is_active
                    })}
                  >
                    {product.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex flex-col">
                    <span className="text-xs" suppressHydrationWarning>
                      {formatDate(product.created_at)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex flex-col">
                    <span className="text-xs" suppressHydrationWarning>
                      {product.updated_at
                        ? formatDate(product.updated_at)
                        : '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex justify-end items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={APP_URLS.ORGANIZATION.PRODUCTS.EDIT(
                          bussinessId,
                          product.id
                        )}
                        title="Editar"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={APP_URLS.ORGANIZATION.PRODUCTS.CREATE_VARIANT(
                          bussinessId,
                          product.id
                        )}
                        title="Variantes"
                      >
                        <PlusSquare className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDelete(product)
                      }}
                      title="Eliminar"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {dataProducts?.data?.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Mostrando {dataProducts.data.length} de {dataProducts.total} productos
            {dataProducts.total_pages > 1 && ` (Página ${dataProducts.page} de ${dataProducts.total_pages})`}
          </div>

          {dataProducts.total_pages > 1 && (
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(dataProducts.page - 1)}
                disabled={dataProducts.page <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-sm font-medium mx-2">
                {dataProducts.page}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(dataProducts.page + 1)}
                disabled={dataProducts.page >= dataProducts.total_pages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <ProductDetailSheet
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        onEdit={handleEditProduct}
        onManageVariants={handleManageVariants}
      />

      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setProductToDelete(null)
        }}
        productId={productToDelete?.id}
        productName={productToDelete?.name || ''}
        onSuccess={() => {
          router.refresh()
        }}
      />
    </div>
  )
}
