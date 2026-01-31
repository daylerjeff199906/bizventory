'use client'

import { useState } from 'react'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  MoreHorizontal,
  Trash2
} from 'lucide-react'

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
import { cn } from '@/lib/utils'
import { Brand } from '@/types'
import { BrandModal } from '../components'
import { format } from 'date-fns'
import { DeleteBrandDialog } from '../components'

type SortField = 'name' | 'updated_at' | 'created_at' | 'status'
type SortDirection = 'asc' | 'desc'

interface BrandListProps {
  brandslist: Brand[]
}

export const BrandList = ({ brandslist = [] }: BrandListProps) => {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc'

    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    }

    setSortField(field)
    setSortDirection(newDirection)
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

  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsModalOpen(true)
  }

  const handleDeleteBrand = (brand: Brand) => {
    setBrandToDelete(brand)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="rounded-md border shadow-none overflow-hidden">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Nombre
                  {getSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead>
                <div className="font-medium">Logo</div>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('status')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Estado
                  {getSortIcon('status')}
                </Button>
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
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('updated_at')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Actualizado
                  {getSortIcon('updated_at')}
                </Button>
              </TableHead>
              <TableHead className="w-[80px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brandslist.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">
                    No hay marcas registradas
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              brandslist.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {brand.name || 'Sin nombre'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={`Logo de ${brand.name}`}
                        className="h-8 w-8 object-contain rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.src = '/placeholder-brand.svg'
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          No logo
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn('text-xs rounded-full', {
                        'bg-green-100 text-green-800':
                          brand.status === 'ACTIVO',
                        'bg-red-100 text-red-800': brand.status !== 'ACTIVO'
                      })}
                    >
                      {brand.status || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {brand.created_at && (
                        <span className="text-sm text-muted-foreground">
                          {format(
                            new Date(brand.created_at),
                            'dd/MM/yyyy HH:mm'
                          )}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {brand.updated_at && (
                        <span className="text-sm text-muted-foreground">
                          {format(
                            new Date(brand.updated_at),
                            'dd/MM/yyyy HH:mm'
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
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditBrand(brand)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteBrand(brand)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
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
        {brandslist.length > 0 && (
          <div className="px-4 py-3 text-sm text-muted-foreground border-t">
            {brandslist.length} marca{brandslist.length !== 1 ? 's' : ''}{' '}
            mostrada{brandslist.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <BrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brand={selectedBrand}
        businessId={selectedBrand?.business_id}
      />

      <DeleteBrandDialog
        isOpen={isDeleteDialogOpen}
        brandName={brandToDelete?.name || ''}
        onClose={() => setIsDeleteDialogOpen(false)}
        brandId={brandToDelete?.id || ''}
        onSuccess={() => {
          setIsDeleteDialogOpen(false)
        }}
        key={brandToDelete?.id || 'delete-brand-dialog'}
      />
    </div>
  )
}
