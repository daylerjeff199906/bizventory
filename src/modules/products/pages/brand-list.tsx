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
    <div className="rounded-md border bg-white shadow-none overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100">
            <TableHead className="border-r border-gray-200">
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
              >
                Nombre
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead className="border-r border-gray-200">
              <div className="font-medium text-gray-700">Logo</div>
            </TableHead>
            <TableHead className="border-r border-gray-200">
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
              >
                Estado
                {getSortIcon('status')}
              </Button>
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
          {brandslist.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center">
                No hay marcas registradas
              </TableCell>
            </TableRow>
          ) : (
            brandslist.map((brand) => (
              <TableRow key={brand.id} className="hover:bg-gray-50">
                <TableCell className="font-medium border-r border-gray-100">
                  {brand.name || 'Sin nombre'}
                </TableCell>
                <TableCell className="border-r border-gray-100">
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
                      <span className="text-xs text-gray-500">No logo</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <Badge
                    className={cn('text-xs rounded-full', {
                      'bg-green-100 text-green-800': brand.status === 'ACTIVO',
                      'bg-red-100 text-red-800': brand.status !== 'ACTIVO'
                    })}
                  >
                    {brand.status || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <div className="text-sm">
                    {brand.created_at && (
                      <div className="text-gray-500 text-xs">
                        {format(new Date(brand.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <div className="text-sm">
                    {brand.updated_at && (
                      <div className="text-gray-500 text-xs">
                        {format(new Date(brand.updated_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditBrand(brand)}>
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <BrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brand={selectedBrand}
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
