'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Search,
  Users,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash
} from 'lucide-react'
import { PersonsCRUD } from '../components'
import { CustomerList } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteCustomer } from '@/apis/app/customers'
import { toast } from 'react-toastify'

interface IProps {
  customersList?: CustomerList[]
  totalItems?: number
  page?: number
  totalPages?: number
}

export const CustomersList = (props: IProps) => {
  const { customersList: customers = [], totalItems = 0, page = 1, totalPages = 1 } = props
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No registrado'
    return format(new Date(dateString), 'PP', { locale: es })
  }

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set('q', searchTerm)
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleDelete = async (personId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await deleteCustomer(personId)
        toast.success('Cliente eliminado correctamente')
      } catch (error) {
        console.error(error)
        toast.error('Error al eliminar el cliente')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, documento..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{customer.person.name}</span>
                      <span className="text-xs text-muted-foreground">ID: {customer.person.id.slice(0, 8)}...</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {customer.person.document_type && customer.person.document_number ? (
                        <>
                          <span className="text-sm font-medium">{customer.person.document_number}</span>
                          <span className="text-xs text-muted-foreground">{customer.person.document_type}</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No registrado</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {customer.person.whatsapp && (
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3 text-green-600" />
                          <span>{customer.person.whatsapp}</span>
                        </div>
                      )}
                      {customer.person.email && (
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3 text-blue-600" />
                          <span className="truncate max-w-[150px]" title={customer.person.email}>{customer.person.email}</span>
                        </div>
                      )}
                      {!customer.person.whatsapp && !customer.person.email && (
                        <span className="text-xs text-muted-foreground italic">Sin contacto</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {customer.person.address ? (
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                          <span className="text-xs line-clamp-2">{customer.person.address}</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground italic">Sin dirección</span>}
                      {customer.person.country && (
                        <span className="text-[10px] text-muted-foreground ml-4">{customer.person.country}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs">{formatDate(customer.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PersonsCRUD
                        businessId={customer.business_id}
                        personData={customer.person}
                        mode="edit"
                        isCustomer
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PersonsCRUD>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => handleDelete(customer.person.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-sm text-muted-foreground mr-4">
            Página {page} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
