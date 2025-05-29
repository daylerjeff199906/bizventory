'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

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

// Tipado para los proveedores
export interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  currency: string
  status: 'activo' | 'inactivo' | 'pendiente'
  notes: string
  created_at: string
  updated_at: string
  company_type: string
  document_type: string
  document_number: string
}

type SortField = 'id' | 'name' | 'created_at' | 'updated_at'
type SortDirection = 'asc' | 'desc'

export default function SuppliersList() {
  // Datos de ejemplo
  const suppliers: Supplier[] = [
    {
      id: 'SUP001',
      name: 'Distribuidora Central S.A.',
      contact: 'María González',
      email: 'maria@distribuidora.com',
      phone: '+34 912 345 678',
      address: 'Calle Mayor 123, Madrid',
      currency: 'EUR',
      status: 'activo',
      notes: 'Proveedor principal de materiales',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-03-20T14:45:00Z',
      company_type: 'S.A.',
      document_type: 'CIF',
      document_number: 'A12345678'
    },
    {
      id: 'SUP002',
      name: 'Suministros del Norte',
      contact: 'Carlos Rodríguez',
      email: 'carlos@suministros.com',
      phone: '+34 985 123 456',
      address: 'Avenida Industrial 45, Oviedo',
      currency: 'EUR',
      status: 'activo',
      notes: 'Especializado en herramientas',
      created_at: '2024-02-10T09:15:00Z',
      updated_at: '2024-03-18T11:20:00Z',
      company_type: 'S.L.',
      document_type: 'CIF',
      document_number: 'B87654321'
    },
    {
      id: 'SUP003',
      name: 'Tecnología Avanzada',
      contact: 'Ana Martín',
      email: 'ana@tecavanzada.com',
      phone: '+34 934 567 890',
      address: 'Polígono Industrial 12, Barcelona',
      currency: 'EUR',
      status: 'pendiente',
      notes: 'En proceso de verificación',
      created_at: '2024-03-01T16:00:00Z',
      updated_at: '2024-03-15T10:30:00Z',
      company_type: 'S.L.',
      document_type: 'CIF',
      document_number: 'B11223344'
    },
    {
      id: 'SUP004',
      name: 'Logística Express',
      contact: 'Pedro Sánchez',
      email: 'pedro@logistica.com',
      phone: '+34 954 321 098',
      address: 'Calle Comercio 78, Sevilla',
      currency: 'EUR',
      status: 'inactivo',
      notes: 'Suspendido temporalmente',
      created_at: '2023-12-05T08:45:00Z',
      updated_at: '2024-01-10T13:15:00Z',
      company_type: 'S.A.',
      document_type: 'CIF',
      document_number: 'A99887766'
    }
  ]

  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

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
    const filtered = suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered.sort((a, b) => {
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
      activo: 'default',
      inactivo: 'secondary',
      pendiente: 'outline'
    } as const

    return <Badge variant={variants[status]}>{status}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground">
            Gestiona y administra todos tus proveedores
          </p>
        </div>
        <Button>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('id')}
                  className="h-auto p-0 font-semibold"
                >
                  ID
                  {getSortIcon('id')}
                </Button>
              </TableHead>
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
              <TableHead>Contacto</TableHead>
              <TableHead>Email</TableHead>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {supplier.company_type}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{supplier.contact}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                <TableCell>{formatDate(supplier.created_at)}</TableCell>
                <TableCell>{formatDate(supplier.updated_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredAndSortedSuppliers.length} de {suppliers.length}{' '}
        proveedores
      </div>
    </div>
  )
}
