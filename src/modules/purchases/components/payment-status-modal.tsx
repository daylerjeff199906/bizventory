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
import { patchPurchaseField } from '@/apis/app'
import { Loader2 } from 'lucide-react'

interface PaymentStatusModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseId: string
  currentPaymentStatus: string
}

export function PaymentStatusModal({
  isOpen,
  onClose,
  purchaseId,
  currentPaymentStatus
}: PaymentStatusModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<string>(
    currentPaymentStatus || 'pending'
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      await patchPurchaseField(purchaseId, 'payment_status', paymentStatus)
      onClose()
    } catch (error) {
      console.error('Error al actualizar el estado de pago:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar Estado de Pago</DialogTitle>
          <DialogDescription>
            Selecciona el nuevo estado de pago para esta orden de compra.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={paymentStatus}
            onValueChange={setPaymentStatus}
            className="flex flex-col gap-2"
          >
            <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem
                value="pending"
                id="payment-pending"
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="payment-pending"
                  className="text-base font-medium"
                >
                  Pendiente
                </Label>
                <p className="text-sm text-gray-500">
                  El pago aún no ha sido realizado.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="paid" id="payment-paid" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="payment-paid" className="text-base font-medium">
                  Pagado
                </Label>
                <p className="text-sm text-gray-500">
                  El pago ha sido completado en su totalidad.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem
                value="partially_paid"
                id="payment-partially"
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="payment-partially"
                  className="text-base font-medium"
                >
                  Parcialmente Pagado
                </Label>
                <p className="text-sm text-gray-500">
                  Se ha realizado un pago parcial de la orden.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem
                value="cancelled"
                id="payment-cancelled"
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="payment-cancelled"
                  className="text-base font-medium"
                >
                  Cancelado
                </Label>
                <p className="text-sm text-gray-500">
                  El pago ha sido cancelado y no se procesará.
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
              'Actualizar Estado de Pago'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
