'use client'

import type { PurchaseList } from '@/types'
import PurchasePDFGenerator from '../components/purchase-pdf-generator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getProductDescription } from '../utils/generate-name'
import { CombinedResultExtended, VariantAttribute } from '@/apis/app/productc.variants.list'
import { Label } from '@/components/ui/label'

interface PurchaseInvoiceProps {
  purchase: PurchaseList
  items?: CombinedResultExtended[]
}

export default function PurchaseInvoice(props: PurchaseInvoiceProps) {
  const { purchase, items = [] } = props

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'No especificada'
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return format(dateObj, 'dd/MM/yyyy', { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  const formatCurrency = (amount: number, currency = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const calculateItemTotal = (item: CombinedResultExtended) => {
    const subtotal = (item?.quantity ?? 0) * (item?.price ?? 0)
    const discount = item.discount || 0
    return subtotal - discount
  }


  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Alert informativo */}
      <Alert className="mb-6 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-700 dark:text-blue-200">
          Este documento incluye toda la información de la compra: datos del
          proveedor, detalle de productos con precios y descuentos, y totales
          calculados.
        </AlertDescription>
      </Alert>

      {/* Actions PDF */}
      <Card className="mb-6 rounded-md border sticky top-20 shadow-lg">
        <CardContent>
          <div className="flex flex-col md:flex-row md:justify-end gap-2">
            <p className="text-sm text-foreground mr-auto">
              Generar PDF de la compra para impresión o envío por correo.
            </p>
            <PurchasePDFGenerator purchase={purchase} items={items} />
          </div>
        </CardContent>
      </Card>

      {/* Información principal de la compra */}
      <Card className="mb-6 shadow-none rounded-md border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Información de la Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-2">
            <Label className="text-sm font-medium">Estado de la Compra</Label>
            <div className="flex gap-2">
              <Badge
                variant={
                  purchase.status === 'completed' ? 'default' : 'secondary'
                }
                className="rounded-full"
              >
                {purchase.status === 'completed'
                  ? 'Completado'
                  : purchase.status === 'pending'
                    ? 'Pendiente'
                    : purchase.status === 'cancelled'
                      ? 'Cancelado'
                      : 'No especificado'}
              </Badge>
              <Badge
                variant={
                  purchase.payment_status === 'paid' ? 'default' : 'outline'
                }
                className="rounded-full"
              >
                {purchase.payment_status === 'paid'
                  ? 'Pagado'
                  : purchase.payment_status === 'pending'
                    ? 'Pendiente'
                    : purchase.payment_status === 'partially_paid'
                      ? 'Pago Parcial'
                      : purchase.payment_status === 'cancelled'
                        ? 'Cancelado'
                        : 'No especificado'}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Código de Compra
              </label>
              <p className="font-semibold">
                {purchase.code || 'No asignado'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Fecha de Compra</label>
              <p className="font-semibold ">
                {formatDate(purchase.date)}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Guía N°</label>
              <p className="font-semibold ">
                {purchase.guide_number || 'No especificada'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Total</label>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(
                  purchase.total_amount,
                  purchase.supplier?.currency
                )}
              </p>
            </div>
          </div>

          {/* Información del proveedor */}
          {purchase.supplier && (
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-semibold  mb-3">
                Información del Proveedor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div>
                    <p className="font-medium ">
                      {purchase.supplier.name}
                    </p>
                    <p className="text-sm">
                      {purchase.supplier.contact}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      {purchase.supplier.email}
                    </p>
                    <p className="text-sm">
                      {purchase.supplier.phone}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    {purchase.supplier.address}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {purchase.supplier.document_type}:{' '}
                      {purchase.supplier.document_number}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Moneda: {purchase.supplier.currency}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de productos */}
      <Card className="mb-6 shadow-none rounded-md border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Detalle de Productos ({items.length}{' '}
            {items.length === 1 ? 'item' : 'items'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="w-[80px] text-center">
                      Cant.
                    </TableHead>
                    <TableHead className="w-[100px] text-right">
                      Precio Unit.
                    </TableHead>
                    <TableHead className="w-[100px] text-right">
                      Descuento
                    </TableHead>
                    <TableHead className="w-[100px] text-right">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow
                      key={item.id || index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell className="font-mono text-sm">
                        {item.code || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0 whitespace-normal">
                          <p className="text-sm font-medium  break-words  uppercase">
                            {item.brand?.name || ''} {item.name || ''}
                          </p>
                          {item.variant_name && (
                            <p className="text-sm text-blue-600 font-medium">
                              {item.variant_name}
                            </p>
                          )}
                          {item.description && !item.variant_name && (
                            <p className="text-xs text-gray-500">
                              {item.description}
                            </p>
                          )}
                          {(item.attributes || item.variant_attributes) && (
                            <div className="mt-1">
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {(item.attributes || item.variant_attributes || [])
                                  .map((attr: VariantAttribute) => attr.attribute_value)
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(
                          item?.price ?? 0,
                          purchase.supplier?.currency
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.discount && item.discount > 0 ? (
                          <span className="text-red-600 font-medium">
                            -
                            {formatCurrency(
                              item.discount,
                              purchase.supplier?.currency
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold ">
                        {formatCurrency(
                          calculateItemTotal(item),
                          purchase.supplier?.currency
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No hay productos en esta compra</p>
            </div>
          )}

          {/* Resumen de totales */}
          {items.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-end">
                <div className="space-y-3 min-w-[280px]">
                  <div className="flex justify-between text-base">
                    <span className="text-foreground">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        purchase.subtotal,
                        purchase.supplier?.currency
                      )}
                    </span>
                  </div>
                  {(() => {
                    const discount = Number(purchase.discount ?? 0)
                    if (!Number.isFinite(discount) || discount <= 0) return null
                    return (
                      <div className="flex justify-between text-base">
                        <span className="text-foreground">Descuento Global:</span>
                        <span className="text-red-600 font-medium">
                          -
                          {formatCurrency(
                            discount,
                            purchase.supplier?.currency
                          )}
                        </span>
                      </div>
                    )
                  })()}

                  <div className="flex justify-between text-base">
                    <span className="text-foreground">
                      IGV ({purchase.tax_rate}%):
                    </span>
                    {purchase.tax_amount && purchase.tax_amount > 0 && (
                      <span className="font-medium">
                        {formatCurrency(
                          purchase.tax_amount,
                          purchase.supplier?.currency
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between text-lg font-semibold border-t pt-3">
                    <span className="">Total a Pagar:</span>
                    <span className="text-green-600">
                      {formatCurrency(
                        purchase.total_amount,
                        purchase.supplier?.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
