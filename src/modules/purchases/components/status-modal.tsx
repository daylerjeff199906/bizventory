'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { updatePurchaseStatus } from '@/apis/app'
import { Loader2 } from 'lucide-react'

interface StatusModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseId: string
  currentStatus: string
}

export function StatusModal({
  isOpen,
  onClose,
  purchaseId,
  currentStatus
}: StatusModalProps) {
  const [status, setStatus] = useState<string>(currentStatus || 'pending')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      await updatePurchaseStatus(purchaseId, status)
      onClose()
    } catch (error) {
      console.error('Error al actualizar el estado:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar Estado de Compra</DialogTitle>
          <DialogDescription>
            Selecciona el nuevo estado para esta orden de compra.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={status}
            onValueChange={setStatus}
            className="flex flex-col gap-2"
          >
            <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="pending" id="pending" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="pending" className="text-base font-medium">
                  Pendiente
                </Label>
                <p className="text-sm text-gray-500">
                  La orden está registrada pero aún no ha sido procesada
                  completamente.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem
                value="completed"
                id="completed"
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="completed" className="text-base font-medium">
                  Completada
                </Label>
                <p className="text-sm text-gray-500">
                  La orden ha sido procesada y los productos han sido recibidos.
                  Esto actualizará automáticamente el inventario.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem
                value="cancelled"
                id="cancelled"
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="cancelled" className="text-base font-medium">
                  Cancelada
                </Label>
                <p className="text-sm text-gray-500">
                  La orden ha sido cancelada y no será procesada.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              'Actualizar Estado'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
