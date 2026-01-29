'use client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  AlertTriangle,
  Package,
  Calculator,
} from 'lucide-react'
import type { Currency } from '@/types'
import type { SaleFormValues, SaleItemValues } from '../schemas'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  saleData: SaleFormValues
  currency: Currency
  totals: {
    subtotal: number
    totalDiscount: number
    taxAmount: number
    total: number
  }
  isSubmitting?: boolean
  isEditing?: boolean
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  saleData,
  currency,
  totals,
  isSubmitting = false,
  isEditing = false
}: ConfirmationDialogProps) {
  const currencySymbol = currency === 'PEN' ? 'S/' : '$'
  const currencyName = currency === 'PEN' ? 'Soles' : 'Dólares'

  const paymentMethodLabels: Record<string, string> = {
    efectivo: 'Efectivo',
    tarjeta_credito: 'Tarjeta de Crédito',
    tarjeta_debito: 'Tarjeta de Débito',
    transferencia: 'Transferencia',
    yape: 'Yape',
    plin: 'Plin',
    cheque: 'Cheque'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col min-w-[60vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {isEditing ? 'Confirmar Actualización' : 'Confirmar Registro de Venta'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Revisa los detalles antes de actualizar. Si la venta ya estaba completada, los cambios podrían afectar el stock nuevamente.'
              : 'Revisa los detalles de la venta antes de confirmar el registro. Esta acción no se puede deshacer.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Información general */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Información General
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Número de Referencia:
                </span>
                <p className="font-medium">{saleData.reference_number}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha:</span>
                <p className="font-medium">
                  {new Date(saleData.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Método de Pago:</span>
                <p className="font-medium">
                  {paymentMethodLabels[saleData.payment_method] ||
                    saleData.payment_method}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Moneda:</span>
                <p className="font-medium">{currencyName}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Productos */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos ({saleData.items?.length || 0})
            </h4>
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">
                        Producto
                      </th>
                      <th className="text-center py-2 px-3 font-medium">
                        Cant.
                      </th>
                      <th className="text-right py-2 px-3 font-medium">
                        P.Unit.
                      </th>
                      <th className="text-right py-2 px-3 font-medium">
                        Desc.
                      </th>
                      <th className="text-right py-2 px-3 font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleData.items?.map((item: SaleItemValues, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-2 px-3">
                          <div className="font-medium">
                            {item.brand?.name} {item.product_description}
                            {item.variant_name && <> {item.variant_name}</>}
                          </div>
                          {item.attributes && item.attributes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.attributes.map((attr, attrIndex) => (
                                <Badge
                                  key={attrIndex}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {attr.attribute_value}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {currencySymbol}
                          {item.price_unit?.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {item.discount && item.discount > 0 ? (
                            <span className="text-red-600">
                              -{currencySymbol}
                              {item.discount.toFixed(2)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          {currencySymbol}
                          {item.subtotal?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <Separator />

          {/* Resumen de totales */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Resumen de Totales
            </h4>
            <div className="bg-muted/30 p-4 rounded-md space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>
                  {currencySymbol}
                  {totals.subtotal.toFixed(2)}
                </span>
              </div>
              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento Total:</span>
                  <span>
                    -{currencySymbol}
                    {totals.totalDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>IGV:</span>
                  <span>
                    {currencySymbol}
                    {totals.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total a Pagar:</span>
                <span>
                  {currencySymbol}
                  {totals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Importante</p>
              <p className="text-yellow-700">
                Una vez confirmada, la venta será registrada en el sistema y no
                podrá ser modificada. Asegúrate de que todos los datos sean
                correctos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Procesando...' : isEditing ? 'Actualizar Venta' : 'Confirmar Venta'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
