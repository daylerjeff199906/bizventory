'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { deleteProduct } from '@/apis/app/products'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'

interface DeleteProductDialogProps {
    isOpen: boolean
    onClose: () => void
    productId?: string
    productName: string
    onSuccess?: () => void
}

export function DeleteProductDialog({
    isOpen,
    onClose,
    productId,
    productName,
    onSuccess
}: DeleteProductDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!productId) return

        setIsDeleting(true)
        try {
            await deleteProduct(productId)

            toast.success(
                <ToastCustom
                    title="Producto eliminado"
                    message={`El producto "${productName}" se ha eliminado correctamente.`}
                />
            )

            onSuccess?.()
            onClose()
        } catch (error: unknown) {
            console.error('Error al eliminar el producto:', error)

            let errorMessage = ''
            if (error instanceof Error) {
                errorMessage = error.message
            } else if (typeof error === 'object' && error !== null && 'message' in error) {
                errorMessage = String((error as unknown as Error).message)
            }

            toast.error(
                <ToastCustom
                    title="Error al eliminar"
                    message={`No se pudo eliminar el producto "${productName}". ${errorMessage || 'Inténtalo de nuevo.'}`}
                />
            )
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Confirmar Eliminación
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                        ¿Estás seguro de que deseas eliminar el producto{' '}
                        <span className="font-semibold">{`"${productName}"`}</span>?
                        <br />
                        <br />
                        Esta acción no se puede deshacer y se eliminará permanentemente del inventario.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isDeleting || !productId}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            'Eliminar Producto'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
