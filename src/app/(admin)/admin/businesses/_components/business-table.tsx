'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserPlus, Trash2, Loader2, Edit } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from 'react'
import { EditBusinessDialog } from './edit-business-dialog'
import { deleteBusinessAction } from '../../_actions'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Business } from '@/types'

interface BusinessTableProps {
    businesses: Business[]
}


export function BusinessTable({ businesses }: BusinessTableProps) {
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (!selectedBusiness) return
        setIsDeleting(true)
        try {
            const result = await deleteBusinessAction(selectedBusiness.id)
            if (result.success) {
                toast.success('Negocio eliminado')
                router.refresh()
            } else {
                toast.error(result.error || 'Error al eliminar')
            }
        } catch (error) {
            toast.error('Error inesperado')
        } finally {
            setIsDeleting(false)
            setIsDeleteOpen(false)
        }
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-xs">Nombre</TableHead>
                        <TableHead className="text-xs">Tipo</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs text-center">Estado</TableHead>
                        <TableHead className="text-xs text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {businesses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground text-sm">
                                No hay negocios registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        businesses.map((business) => (
                            <TableRow key={business.id}>
                                <TableCell className="font-medium text-sm">
                                    {business.business_name}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {business.business_type}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {business.business_email}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={business.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0">
                                        {business.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            asChild
                                        >
                                            <Link href={`/admin/businesses/${business.id}/members`}>
                                                <UserPlus className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                            onClick={() => {
                                                setSelectedBusiness(business)
                                                setIsEditOpen(true)
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                setSelectedBusiness(business)
                                                setIsDeleteOpen(true)
                                            }}
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

            {/* Edit Dialog */}
            {selectedBusiness && (
                <EditBusinessDialog
                    business={selectedBusiness}
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el negocio
                            <span className="font-bold"> {selectedBusiness?.business_name}</span> and all its associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                'Eliminar'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

