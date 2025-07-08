'use client'
import //   Search,
//   Edit,
//   Trash2
'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
// import { Badge } from '@/components/ui/badge'
import { CustomerList } from '@/types'
// import { CustomerForm } from '../components'
// import { cn } from '@/lib/utils'
// import { patchCustomerField } from '@/apis/app'
// import { toast } from 'react-toastify'
// import { ToastCustom } from '@/components/app/toast-custom'
// import {
//   AlertDialog,
//   AlertDialogHeader,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogTitle,
//   AlertDialogDescription
// } from '@/components/ui/alert-dialog'

// type SortField =
//   | 'id'
//   | 'name'
//   | 'whatsapp'
//   | 'email'
//   | 'created_at'
//   | 'updated_at'
// type SortDirection = 'asc' | 'desc'

interface IProps {
  customersList?: CustomerList[]
}

export const CustomersList = (props: IProps) => {
  const { customersList: customers } = props

  //   const [dialogOpen, setDialogOpen] = useState(false)
  //   const [editingCustomer, setEditingCustomer] = useState<
  //     (Customer & { person: Person }) | undefined
  //   >()
  //   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  //   const getStatusBadge = (status: Customer['status']) => {
  //     const variants = {
  //       [StatusItems.ACTIVE]:
  //         'bg-green-100 text-green-700 border border-green-300',
  //       [StatusItems.INACTIVE]:
  //         'bg-yellow-100 text-yellow-700 border border-yellow-300',
  //       [StatusItems.DELETED]: 'bg-red-100 text-red-700 border border-red-300'
  //     } as const

  //     const colorClass =
  //       variants[status] || 'bg-gray-100 text-gray-700 border border-gray-300'

  //     return (
  //       <Badge className={cn('rounded-full px-3 uppercase', colorClass)}>
  //         {status}
  //       </Badge>
  //     )
  //   }

  //   const formatDate = (dateString: string) => {
  //     return new Date(dateString).toLocaleDateString('es-ES', {
  //       year: 'numeric',
  //       month: 'short',
  //       day: 'numeric'
  //     })
  //   }

  //   const handleEditCustomer = (customer: Customer & { person: Person }) => {
  //     setEditingCustomer(customer)
  //     setDialogOpen(true)
  //   }

  //   const handleDeleteCustomer = async (id: string) => {
  //     try {
  //       await patchCustomerField(id, 'status', StatusItems.DELETED)
  //       toast.success(
  //         <ToastCustom
  //           title="Cliente eliminado"
  //           message="El cliente ha sido eliminado correctamente"
  //         />
  //       )
  //       window.location.reload()
  //     } catch {
  //       toast.error(
  //         <ToastCustom
  //           title="Error al eliminar"
  //           message="No se pudo eliminar el cliente. Inténtalo de nuevo más tarde."
  //         />
  //       )
  //     }
  //   }

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
                      // onClick={() => handleSort('name')}
                      className="h-auto p-0 font-semibold"
                    >
                      Nombre
                      {/* {getSortIcon('name')} */}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      // onClick={() => handleSort('whatsapp')}
                      className="h-auto p-0 font-semibold"
                    >
                      WhatsApp
                      {/* {getSortIcon('whatsapp')} */}
                    </Button>
                  </TableHead>
                  <TableHead>Teléfono Secundario</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      // onClick={() => handleSort('email')}
                      className="h-auto p-0 font-semibold"
                    >
                      Email
                      {/* {getSortIcon('email')} */}
                    </Button>
                  </TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>País</TableHead>
                  {/* <TableHead>Estado</TableHead> */}
                  <TableHead>
                    <Button
                      variant="ghost"
                      // onClick={() => handleSort('created_at')}
                      className="h-auto p-0 font-semibold"
                    >
                      Creado
                      {/* {getSortIcon('created_at')} */}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      // onClick={() => handleSort('updated_at')}
                      className="h-auto p-0 font-semibold"
                    >
                      Actualizado
                      {/* {getSortIcon('updated_at')} */}
                    </Button>
                  </TableHead>
                  {/* <TableHead>Acciones</TableHead> */}
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
                    {/* <TableCell>{getStatusBadge(customer.status)}</TableCell> */}
                    {/* <TableCell>{formatDate(customer.created_at)}</TableCell> */}
                    {/* <TableCell>{formatDate(customer.updated_at)}</TableCell> */}
                    {/* <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                          disabled={customer.status === StatusItems.DELETED}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {customer.status !== StatusItems.DELETED && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCustomer(customer)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell> */}
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

      {/* <CustomerForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este cliente? Esta acción no
              se puede deshacer.
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
                if (editingCustomer) {
                  handleDeleteCustomer(editingCustomer.id)
                }
                setIsDeleteDialogOpen(false)
              }}
            >
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </>
  )
}
