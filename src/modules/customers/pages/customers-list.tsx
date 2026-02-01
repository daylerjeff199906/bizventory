'use client'

import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { PersonsCRUD } from '../components'
import { CustomerList } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface IProps {
  customersList?: CustomerList[]
}

export const CustomersList = (props: IProps) => {
  const { customersList: customers } = props

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No registrado'
    return format(new Date(dateString), 'PP', { locale: es })
  }

  return (
    <>
      <div className="flex flex-col space-y-6 p-2">
        {/* Table */}
        <div className="border rounded-lg">
          {customers && customers?.length > 0 ? (
            <Table className="overflow-x-auto">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold"
                    >
                      Nombre
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold"
                    >
                      WhatsApp
                    </Button>
                  </TableHead>
                  <TableHead>Teléfono Secundario</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold"
                    >
                      Email
                    </Button>
                  </TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold"
                    >
                      Creado
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold"
                    >
                      Actualizado
                    </Button>
                  </TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.person.name}
                    </TableCell>
                    <TableCell>
                      {customer.person.whatsapp || 'No registrado'}
                    </TableCell>
                    <TableCell>
                      {customer.person.secondary_phone || 'No registrado'}
                    </TableCell>
                    <TableCell>
                      {customer.person.email || 'No registrado'}
                    </TableCell>
                    <TableCell>
                      {customer.person.address || 'No registrado'}
                    </TableCell>
                    <TableCell>
                      {customer.person.country || 'No registrado'}
                    </TableCell>
                    <TableCell>{formatDate(customer.created_at)}</TableCell>
                    <TableCell>{formatDate(customer.updated_at)}</TableCell>
                    <TableCell>
                      <PersonsCRUD
                        businessId={customer.business_id}
                        personData={customer.person}
                        mode="edit"
                        isCustomer
                      >
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PersonsCRUD>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <h2 className="text-lg font-semibold mb-2">No hay resultados</h2>
              <p className="text-muted-foreground text-sm">
                No se encontraron clientes que coincidan con tu búsqueda o
                filtros.
              </p>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Mostrando {customers?.length} de {customers?.length} clientes
        </div>
      </div>
    </>
  )
}
