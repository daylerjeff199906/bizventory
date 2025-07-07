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
import { deleteBrand } from '@/apis/app'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'

interface DeleteBrandDialogProps {
  isOpen: boolean
  onClose: () => void
  brandId?: string
  brandName: string
  onSuccess?: () => void
}

export function DeleteBrandDialog({
  isOpen,
  onClose,
  brandId,
  brandName,
  onSuccess
}: DeleteBrandDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!brandId) return

    setIsDeleting(true)
    try {
      const result = await deleteBrand(brandId)

      if (!result) {
        throw new Error('No se recibió respuesta del servidor')
      }

      toast.success(
        <ToastCustom
          title="Marca eliminada"
          message={`La marca "${brandName}" se ha eliminado correctamente.`}
        />
      )

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error al eliminar la marca:', error)
      toast.error(
        <ToastCustom
          title="Error al eliminar"
          message={`No se pudo eliminar la marca "${brandName}". Por favor, inténtalo de nuevo.`}
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
            ¿Estás seguro de que deseas eliminar la marca{' '}
            <span className="font-semibold">{`"${brandName}"`}</span>?
            <br />
            <br />
            Esta acción no se puede deshacer y se eliminará permanentemente toda
            la información asociada a esta marca.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || !brandId}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar Marca'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
