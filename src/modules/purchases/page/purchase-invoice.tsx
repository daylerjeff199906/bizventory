'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { PurchaseList } from '@/types'
import type { CombinedResultExtended } from '@/apis/app/productc.variants.list'
import { StatusBadge } from '../components'
import { StatusModal } from '../components/status-modal'
import { PaymentStatusModal } from '../components/payment-status-modal'

interface PurchaseInvoiceProps {
  purchase: PurchaseList
  items?: CombinedResultExtended[]
}

export default function PurchaseInvoice({
  purchase,
  items
}: PurchaseInvoiceProps) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isPaymentStatusModalOpen, setIsPaymentStatusModalOpen] =
    useState(false)

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
    <div className="min-h-screen print:bg-white">
      {/* Action Bar - Hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="w-full flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold text-gray-900">
              Orden de Compra #{purchase.code || 'Sin código'}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {purchase.status !== 'completed' ? (
                <div
                  onClick={() => setIsStatusModalOpen(true)}
                  className="cursor-pointer"
                >
                  <StatusBadge status={purchase.status} />
                </div>
              ) : (
                <StatusBadge status={purchase.status} />
              )}
              <div
                onClick={() => setIsPaymentStatusModalOpen(true)}
                className="cursor-pointer"
              >
                <StatusBadge payment_status={purchase.payment_status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="w-full py-6 print:p-0">
        <div className="bg-white print:shadow-none shadow-sm border print:border-0 rounded-lg print:rounded-none">
          <div className="p-8 print:p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Mi Empresa S.A.C.
                </h2>
                <div className="text-sm text-gray-600 space-y-1 leading-relaxed">
                  <p>RUC: 20123456789</p>
                  <p>Av. Principal 123, Lima, Perú</p>
                  <p>Teléfono: +51 1 234-5678</p>
                  <p>Email: contacto@miempresa.com</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-gray-900 text-white px-6 py-4 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">ORDEN DE COMPRA</h3>
                  <p className="text-gray-200 text-lg">
                    #{purchase.guide_number || 'Sin código'}
                  </p>
                </div>
              </div>
            </div>

            {/* Information Grid - Responsive with grid-cols-2 on desktop, grid-cols-1 on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Supplier Information */}
              <div>
                <div className=" pb-2 mb-2">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Información del Proveedor
                  </h4>
                </div>
                <div className="p-4 border border-gray-200 rounded-md">
                  {purchase.supplier ? (
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {purchase.supplier.name}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex">
                          <span className="text-gray-500 w-20">Contacto:</span>
                          <span className="text-gray-900">
                            {purchase.supplier.contact}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-20">Email: </span>
                          <span className="text-gray-900">
                            {purchase.supplier.email}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-20">Teléfono: </span>
                          <span className="text-gray-900">
                            {purchase.supplier.phone}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-20">
                            Dirección:{' '}
                          </span>
                          <span className="text-gray-900">
                            {purchase.supplier.address}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-20">
                            Documento:{' '}
                          </span>
                          <span className="text-gray-900">
                            {purchase.supplier.document_type}:{' '}
                            {purchase.supplier.document_number}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Proveedor no especificado</p>
                  )}
                </div>
              </div>

              {/* Purchase Details */}
              <div>
                <div className="pb-2 mb-2">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Detalles de la Compra
                  </h4>
                </div>
                <div className="p-4 border border-gray-200 rounded-md">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha de compra:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(purchase.date)}
                      </span>
                    </div>
                    {purchase.guide_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Guía de remisión:</span>
                        <span className="font-medium text-gray-900">
                          {purchase.guide_number}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha de registro:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(purchase.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Última actualización:
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatDate(purchase.updated_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Moneda:</span>
                      <span className="font-medium text-gray-900">
                        {purchase.supplier?.currency || 'PEN'} -{' '}
                        {purchase.supplier?.currency === 'USD'
                          ? 'Dólares'
                          : 'Soles'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table - Only table headers have gray background */}
            <div className="mb-12">
              <div className="border-b border-gray-200 pb-2 mb-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Productos
                </h4>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="text-center py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Unidad
                        </th>
                        <th className="text-center py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Cant.
                        </th>
                        <th className="text-right py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Precio Unit.
                        </th>
                        <th className="text-right py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Descuento
                        </th>
                        <th className="text-right py-4 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {items && items.length > 0 ? (
                        items.map((item: CombinedResultExtended, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <Badge
                                variant="secondary"
                                className="text-xs font-mono"
                              >
                                {item?.code || 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-gray-900 text-sm">
                                  {item.brand?.name || `Producto #${index + 1}`}{' '}
                                  {item.name || '-'}
                                  {item.variant_name && (
                                    <>{item.variant_name}</>
                                  )}
                                  {item?.attributes &&
                                    item?.attributes.length > 0 && (
                                      <>
                                        {' '}
                                        {item.attributes
                                          .map(
                                            (attr) => `${attr.attribute_value}`
                                          )
                                          .join(', ')}
                                      </>
                                    )}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-sm text-gray-600 uppercase">
                                {item.unit || 'N/E'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center font-medium text-gray-900">
                              {item.quantity}
                            </td>

                            <td className="py-4 px-4 text-right font-medium text-gray-900">
                              {formatCurrency(item?.price ?? 0)}
                            </td>
                            <td
                              className={`py-4 px-4 text-right font-medium ${
                                item.discount ? 'text-red-600' : 'text-gray-900'
                              }`}
                            >
                              {item.discount ? (
                                <>- {formatCurrency(item.discount)}</>
                              ) : (
                                '0.00'
                              )}
                            </td>
                            <td className="py-4 px-4 text-right font-semibold text-gray-900">
                              {formatCurrency(
                                (item?.quantity ?? 0) * (item?.price ?? 0)
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-gray-500"
                          >
                            No hay productos en esta compra
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-12">
              <div className="w-full max-w-sm">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(purchase.subtotal)}
                      </span>
                    </div>

                    {typeof purchase.discount === 'number' &&
                      purchase.discount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Descuento:</span>
                          <span>-{formatCurrency(purchase.discount)}</span>
                        </div>
                      )}

                    {typeof purchase.tax_amount === 'number' &&
                      purchase.tax_amount > 0 &&
                      typeof purchase.tax_rate === 'number' &&
                      purchase.tax_rate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            IGV ({purchase.tax_rate}%):
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(purchase.tax_amount)}
                          </span>
                        </div>
                      )}

                    <Separator />

                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">
                        {formatCurrency(purchase.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Observations */}
            {purchase.supplier?.notes && (
              <div className="mb-8">
                <div className="border-b border-gray-200 pb-2 mb-4">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Observaciones
                  </h4>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {purchase.supplier.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        purchaseId={purchase.id}
        currentStatus={purchase.status || 'pending'}
      />

      <PaymentStatusModal
        isOpen={isPaymentStatusModalOpen}
        onClose={() => setIsPaymentStatusModalOpen(false)}
        purchaseId={purchase.id}
        currentPaymentStatus={purchase.payment_status || 'pending'}
      />
    </div>
  )
}
