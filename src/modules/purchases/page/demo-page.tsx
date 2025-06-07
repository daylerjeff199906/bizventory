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
import { CombinedResultExtended } from '@/apis/app/productc.variants.list'

interface PurchaseInvoiceProps {
  purchase: PurchaseList
  items?: CombinedResultExtended[]
}

export default function DemoPage(props: PurchaseInvoiceProps) {
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
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Alert informativo */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Este documento PDF incluye toda la información de la compra: datos del
          proveedor, detalle de productos con precios y descuentos, y totales
          calculados. Ideal para registros contables y control de inventario.
        </AlertDescription>
      </Alert>

      {/* Información principal */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información de la Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Código
              </label>
              <p className="font-semibold">{purchase.code || 'No asignado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha</label>
              <p className="font-semibold">{formatDate(purchase.date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Guía N°
              </label>
              <p className="font-semibold">
                {purchase.guide_number || 'No especificada'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total</label>
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
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Proveedor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">{purchase.supplier.name}</p>
                  <p className="text-gray-600">{purchase.supplier.contact}</p>
                  <p className="text-gray-600">{purchase.supplier.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">{purchase.supplier.phone}</p>
                  <p className="text-gray-600">{purchase.supplier.address}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {purchase.supplier.document_type}:{' '}
                      {purchase.supplier.document_number}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de productos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Productos ({items.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Código</TableHead>
                    <TableHead className="w-[120px]">Producto</TableHead>
                    <TableHead className="w-[80px] text-center">
                      Cant.
                    </TableHead>
                    <TableHead className="w-[100px] text-right">
                      Precio
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
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">
                        {item.code || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {item?.brand?.name || ''} {item.description}{' '}
                        {item?.variant_name}{' '}
                        {item?.attributes &&
                          item?.attributes?.length > 0 &&
                          item.attributes
                            .map((attr) => ` ${attr.attribute_value}`)
                            .join(', ')}
                      </TableCell>

                      <TableCell className="text-center font-semibold">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
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
                      <TableCell className="text-right font-semibold">
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
            <div className="text-center py-8 text-gray-500">
              <p>No hay productos en esta compra</p>
            </div>
          )}

          {/* Resumen de totales */}
          {items.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
                <div className="space-y-2 min-w-[250px]">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>
                      {formatCurrency(
                        purchase.subtotal,
                        purchase.supplier?.currency
                      )}
                    </span>
                  </div>
                  {purchase.discount && purchase.discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Descuento:</span>
                      <span>
                        -
                        {formatCurrency(
                          purchase.discount,
                          purchase.supplier?.currency
                        )}
                      </span>
                    </div>
                  )}
                  {purchase.tax_amount && purchase.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Impuesto ({purchase.tax_rate}%):</span>
                      <span>
                        {formatCurrency(
                          purchase.tax_amount,
                          purchase.supplier?.currency
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
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

      {/* Botón de descarga */}
      <div className="flex justify-center fixed bottom-4 right-4 leading-4 left-1/2 transform -translate-x-1/3 p-4 bg-white shadow-lg rounded-lg z-10">
        <PurchasePDFGenerator
          purchase={purchase}
          items={items}
          fileName={`boleta-${purchase.code || purchase.id}`}
        />
      </div>
    </div>
  )
}
