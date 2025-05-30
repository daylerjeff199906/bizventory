'use client'

import { Separator } from '@/components/ui/separator'
// import { Badge } from '@/components/ui/badge'
import type { PurchaseList } from '@/types'

interface PurchaseInvoiceProps {
  purchase: PurchaseList
}

export default function PurchaseInvoice({ purchase }: PurchaseInvoiceProps) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'No especificada'
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  return (
    <div className="bg-white print:shadow-none shadow-sm border print:border-0 rounded-lg print:rounded-none">
      <div className="p-8 print:p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Mi Empresa S.A.C.
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>RUC: 20123456789</p>
              <p>Av. Principal 123, Lima, Perú</p>
              <p>Teléfono: +51 1 234-5678</p>
              <p>Email: contacto@miempresa.com</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gray-100 print:bg-gray-50 px-4 py-3 rounded-lg print:rounded">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                ORDEN DE COMPRA
              </h2>
              <p className="text-sm text-gray-600">
                #{purchase.code || 'Sin código'}
              </p>
            </div>
          </div>
        </div>

        {/* Información de la compra y proveedor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Proveedor
            </h3>
            {purchase.supplier ? (
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {purchase.supplier.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Contacto:</strong> {purchase.supplier.contact}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {purchase.supplier.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Teléfono:</strong> {purchase.supplier.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Dirección:</strong> {purchase.supplier.address}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>RUC/DNI:</strong> {purchase.supplier.document_type}:{' '}
                  {purchase.supplier.document_number}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Proveedor no especificado</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Detalles de la compra
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha de compra:</span>
                <span className="font-medium">{formatDate(purchase.date)}</span>
              </div>
              {purchase.guide_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Guía de remisión:</span>
                  <span className="font-medium">{purchase.guide_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha de registro:</span>
                <span className="font-medium">
                  {formatDate(purchase.created_at)}
                </span>
              </div>
              {purchase.updated_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Última actualización:</span>
                  <span className="font-medium">
                    {formatDate(purchase.updated_at)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2">
                <span className="text-gray-600">Moneda:</span>
                <span className="font-medium">
                  {purchase.supplier?.currency || 'PEN'} -{' '}
                  {purchase.supplier?.currency === 'USD' ? 'Dólares' : 'Soles'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Tabla de productos */}
        {/* <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
            Productos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Producto
                  </th>
                  <th className="text-left py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Código
                  </th>
                  <th className="text-center py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Cantidad
                  </th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Precio Unit.
                  </th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchase.items && purchase.items.length > 0 ? (
                  purchase.items.map((item: any, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.product?.name || `Producto #${index + 1}`}
                          </p>
                          {item.product && (
                            <p className="text-sm text-gray-500">
                              {item.product.unit} |{' '}
                              {item.product.brand || 'Sin marca'}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline" className="text-xs">
                          {item.product?.code || 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-4 text-center font-medium">
                        {item.quantity}
                      </td>
                      <td className="py-4 text-right font-medium">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-4 text-right font-medium">
                        {formatCurrency(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      No hay productos en esta compra
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div> */}

        {/* Totales */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(purchase.subtotal)}
                </span>
              </div>

              {purchase.discount && purchase.discount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Descuento:</span>
                  <span>-{formatCurrency(purchase.discount)}</span>
                </div>
              )}

              {purchase.tax_amount && purchase.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    IGV ({purchase.tax_rate}%):
                  </span>
                  <span className="font-medium">
                    {formatCurrency(purchase.tax_amount)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(purchase.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        {purchase.supplier?.notes && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
              Observaciones
            </h3>
            <p className="text-sm text-gray-600">{purchase.supplier.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-gray-500">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Términos y condiciones:
              </h4>
              <ul className="space-y-1">
                <li>
                  • Los productos deben ser entregados en las condiciones
                  acordadas
                </li>
                <li>
                  • Cualquier discrepancia debe ser reportada dentro de 24 horas
                </li>
                <li>
                  • El pago se realizará según los términos acordados con el
                  proveedor
                </li>
                <li>
                  • Esta orden de compra está sujeta a los términos comerciales
                  establecidos
                </li>
              </ul>
            </div>
            <div className="text-right">
              <p className="mb-2">
                <strong>Documento generado el:</strong>
              </p>
              <p>
                {new Date().toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Firmas */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="text-center">
            <div className="border-t border-gray-300 pt-2">
              <p className="text-sm font-medium text-gray-700">
                Autorizado por
              </p>
              <p className="text-xs text-gray-500 mt-1">Firma y sello</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-300 pt-2">
              <p className="text-sm font-medium text-gray-700">Recibido por</p>
              <p className="text-xs text-gray-500 mt-1">
                Firma y sello del proveedor
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
