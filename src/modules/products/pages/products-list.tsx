'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  MoreHorizontal,
  Loader2,
  PackageSearch
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ResApi, ProductDetails } from '@/types'
import { APP_URLS } from '@/config/app-urls'
import { cn } from '@/lib/utils'

type SortField = 'name' | 'updated_at' | 'created_at' | 'price' | 'code'
type SortDirection = 'asc' | 'desc'

interface ProductsListProps {
  dataProducts: ResApi<ProductDetails>
  isLoading?: boolean
  searchQuery?: string
}

export const ProductsList = ({
  dataProducts,
  isLoading = false,
  searchQuery = ''
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
    <div className="rounded-md border bg-white shadow-none overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100">
            <TableHead className="border-r border-gray-200 w-[100px]">
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
                onClick={() => handleSort('name')}
                className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
              >
                Producto
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead className="border-r border-gray-200">
              <div className="font-medium text-gray-700">Unidad</div>
            </TableHead>
            <TableHead className="border-r border-gray-200">
              <div className="font-medium text-gray-700">Marca</div>
            </TableHead>
            <TableHead className="border-r border-gray-200">
              <div className="font-medium text-gray-700">Estado</div>
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cargando productos...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : dataProducts?.data?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <PackageSearch className="h-12 w-12 text-gray-400" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {searchQuery
                        ? 'No se encontraron coincidencias'
                        : 'No hay productos registrados'}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      {searchQuery
                        ? `No se encontraron productos que coincidan con "${searchQuery}". Intenta con otro término de búsqueda.`
                        : 'Parece que aún no has agregado ningún producto. Comienza agregando tu primer producto.'}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={APP_URLS.PRODUCTS.CREATE}>
                      Agregar nuevo producto
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            dataProducts?.data?.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50">
                <TableCell className="font-medium border-r border-gray-100">
                  <Badge variant="outline" className="font-mono rounded-full">
                    {product.code}
                  </Badge>
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {product.description || 'Sin descripción'}
                      </div>
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {product.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <div className="text-xs text-gray-500">
                    {product.unit || 'unidad'}
                  </div>
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <div className="text-xs text-gray-500">
                    {product?.brand ? product?.brand?.name : 'Sin marca'}
                  </div>
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <Badge
                    className={cn('text-xs rounded-full', {
                      'bg-lime-100 text-lime-800': product.is_active,
                      'bg-red-100 text-red-800': !product.is_active
                    })}
                  >
                    {product.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>

                <TableCell className="border-r border-gray-100">
                  <div className="text-sm">
                    <div>{formatDate(product.created_at)}</div>
                    <div className="text-gray-500 text-xs">
                      {formatTime(product.created_at)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <div className="text-sm">
                    <div>
                      {product.updated_at
                        ? formatDate(product.updated_at)
                        : 'N/A'}
                    </div>
                    {product.updated_at && (
                      <div className="text-gray-500 text-xs">
                        {formatTime(product.updated_at)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
