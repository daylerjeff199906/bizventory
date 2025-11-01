/* eslint-disable react-hooks/exhaustive-deps */
//suppliers-list.tsx
'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { StatusItems, Supplier } from '@/types'
import { SupplierForm } from '../components'
import { cn } from '@/lib/utils'
import { patchSupplierField } from '@/apis/app'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle, // Añade esto
  AlertDialogDescription // Añade esto para mejor semántica
} from '@/components/ui/alert-dialog'

// Tipado para los proveedores

type SortField = 'id' | 'name' | 'created_at' | 'updated_at'
type SortDirection = 'asc' | 'desc'

interface IProps {
  suppliersList?: Supplier[]
  bussinessId?: string
}

export default function SuppliersList(props: IProps) {
  const { suppliersList: suppliers, bussinessId } = props

  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }

  const filteredAndSortedSuppliers = useMemo(() => {
    const filtered = suppliers?.filter(
      (supplier) =>
        (supplier?.name?.toLowerCase() || '').includes(
          searchTerm?.toLowerCase() || ''
        ) ||
        (supplier?.contact?.toLowerCase() || '').includes(
          searchTerm?.toLowerCase() || ''
        ) ||
        (supplier?.email?.toLowerCase() || '').includes(
          searchTerm?.toLowerCase() || ''
        ) ||
        (supplier?.id?.toLowerCase() || '').includes(
          searchTerm?.toLowerCase() || ''
        )
    )
    return filtered?.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'id':
          aValue = a.id
          bValue = b.id
          break
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime()
          bValue = new Date(b.updated_at).getTime()
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })
  }, [searchTerm, sortField, sortDirection])

  const getStatusBadge = (status: Supplier['status']) => {
    const variants = {
      [StatusItems.ACTIVE]:
        'bg-green-100 text-green-700 border border-green-300',
      [StatusItems.INACTIVE]:
        'bg-yellow-100 text-yellow-700 border border-yellow-300',
      [StatusItems.DELETED]: 'bg-red-100 text-red-700 border border-red-300'
    } as const

    const colorClass =
      variants[status] || 'bg-gray-100 text-gray-700 border border-gray-300'

    return (
      <Badge className={cn('rounded-full px-3 uppercase', colorClass)}>
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleNewSupplier = () => {
    setEditingSupplier(null)
    setDialogOpen(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setDialogOpen(true)
  }

  const handleDeleteSupplier = async (id: string) => {
    try {
      await patchSupplierField(id, 'status', StatusItems.DELETED)
      toast.success(
        <ToastCustom
          title="Proveedor eliminado"
          message="El proveedor ha sido eliminado correctamente"
        />
      )
      window.location.reload() // Recargar la página para reflejar los cambios
    } catch {
      toast.error(
        <ToastCustom
          title="Error al eliminar"
          message="No se pudo eliminar el proveedor. Inténtalo de nuevo más tarde."
        />
      )
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-6 p-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
            <p className="text-muted-foreground">
              Gestiona y administra todos tus proveedores
            </p>
          </div>
          <Button onClick={handleNewSupplier}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proveedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          {filteredAndSortedSuppliers &&
          filteredAndSortedSuppliers?.length > 0 ? (
            <Table className="overflow-x-auto">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-semibold"
                    >
                      Nombre
                      {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead># de Documento</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('created_at')}
                      className="h-auto p-0 font-semibold"
                    >
                      Creado
                      {getSortIcon('created_at')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('updated_at')}
                      className="h-auto p-0 font-semibold"
                    >
                      Actualizado
                      {getSortIcon('updated_at')}
                    </Button>
                  </TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {supplier.company_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.document_type}:{' '}
                      <span className="font-semibold">
                        {supplier.document_number}
                      </span>
                    </TableCell>
                    <TableCell>{supplier.contact}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                    <TableCell>{formatDate(supplier.created_at)}</TableCell>
                    <TableCell>{formatDate(supplier.updated_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSupplier(supplier)}
                          disabled={supplier.status === StatusItems.DELETED}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {supplier.status !== StatusItems.DELETED && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSupplier(supplier)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <h2 className="text-lg font-semibold mb-2">No hay resultados</h2>
              <p className="text-muted-foreground text-sm">
                No se encontraron proveedores que coincidan con tu búsqueda o
                filtros.
              </p>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredAndSortedSuppliers?.length} de {suppliers?.length}{' '}
          proveedores
        </div>
      </div>
      <SupplierForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={editingSupplier}
        bussinessId={String(bussinessId)}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Proveedor</AlertDialogTitle>{' '}
            {/* Añadido */}
            <AlertDialogDescription>
              {' '}
              {/* Mejor estructura */}
              ¿Estás seguro de que deseas eliminar este proveedor? Esta acción
              no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (editingSupplier) {
                  handleDeleteSupplier(editingSupplier.id)
                }
                setIsDeleteDialogOpen(false)
              }}
            >
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
