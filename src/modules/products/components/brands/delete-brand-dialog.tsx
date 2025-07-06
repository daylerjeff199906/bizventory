'use client'

import { AlertTriangle } from 'lucide-react'
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

interface DeleteBrandDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  brandName: string
}

export function DeleteBrandDialog({
  isOpen,
  onClose,
  onConfirm,
  brandName
}: DeleteBrandDialogProps) {
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
            <span className="font-semibold">"{brandName}"</span>?
            <br />
            <br />
            Esta acción no se puede deshacer y se eliminará permanentemente toda
            la información asociada a esta marca.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Eliminar Marca
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
