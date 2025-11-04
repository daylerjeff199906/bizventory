/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink
} from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import type { PurchaseList } from '@/types'
import type { CombinedResultExtended } from '@/apis/app/productc.variants.list'

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#1e40af',
    paddingBottom: 15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1e293b'
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 15
  },
  purchaseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  infoColumn: {
    width: '48%'
  },
  supplierInfo: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8fafc',
    border: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
    textTransform: 'uppercase'
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start'
  },
  label: {
    fontWeight: 'bold',
    width: 80,
    color: '#475569'
  },
  value: {
    flex: 1,
    color: '#334155'
  },
  table: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
    color: '#ffffff'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    fontSize: 9,
    alignItems: 'flex-start'
  },
  colIndex: { width: '6%', textAlign: 'center' },
  colCode: { width: '12%' },
  colProduct: { width: '42%' },
  colQuantity: { width: '8%', textAlign: 'center' },
  colPrice: { width: '16%', textAlign: 'right' },
  colTotal: { width: '16%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 6,
    width: 250
  },
  totalLabel: {
    fontWeight: 'bold',
    width: 150,
    textAlign: 'right',
    marginRight: 10,
    color: '#475569'
  },
  totalValue: {
    width: 90,
    textAlign: 'right',
    color: '#334155'
  },
  finalTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    borderTop: 2,
    borderTopColor: '#1e40af',
    paddingTop: 8,
    color: '#059669'
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: 1,
    borderTopColor: '#cbd5e1',
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center'
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 5
  }
})

// Función auxiliar para formatear descripción del producto
const getProductDescription = (item: CombinedResultExtended) => {
  const parts = []
  if (item?.brand?.name) parts.push(item.brand.name)
  if (item.description) parts.push(item.description)
  if (item.variants && item.variants.length > 0) {
    const variantNames = item.variants
      .map((v) => {
        const attrs = v.attributes
        let attrsStr = ''
        if (Array.isArray(attrs) && attrs.length > 0) {
          attrsStr =
            ' (' +
            attrs
              .map((a) => {
                const value = a.attribute_value ?? ''
                const name = a.attribute_type ?? a.attribute_value ?? ''
                return name ? `${name}: ${value}` : `${value}`
              })
              .filter(Boolean)
              .join(', ') +
            ')'
        }
        return `${v.name ?? ''}${attrsStr}`.trim()
      })
      .filter(Boolean)
      .join('; ')
    if (variantNames) parts.push(variantNames)

    return parts.join(' - ')
  } else {
    return parts.join(' - ')
  }
}
// Componente del documento PDF
const PurchasePDF = ({
  purchase,
  items = []
}: {
  purchase: PurchaseList
  items?: CombinedResultExtended[]
}) => {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'No especificada'
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
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

  const getStatusText = (status: string | null | undefined) => {
    switch (status) {
      case 'completed':
        return 'COMPLETADO'
      case 'pending':
        return 'PENDIENTE'
      case 'cancelled':
        return 'CANCELADO'
      default:
        return 'NO ESPECIFICADO'
    }
  }

  const getPaymentStatusText = (status: string | null | undefined) => {
    switch (status) {
      case 'paid':
        return 'PAGADO'
      case 'pending':
        return 'PENDIENTE'
      case 'partially_paid':
        return 'PAGO PARCIAL'
      case 'cancelled':
        return 'CANCELADO'
      default:
        return 'NO ESPECIFICADO'
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>COMPROBANTE DE COMPRA</Text>
          <Text style={styles.subtitle}>
            Documento detallado de productos adquiridos
          </Text>

          <View style={styles.purchaseInfo}>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Código:</Text>
                <Text style={styles.value}>
                  {purchase.code || 'No asignado'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Fecha:</Text>
                <Text style={styles.value}>{formatDate(purchase.date)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Guía N°:</Text>
                <Text style={styles.value}>
                  {purchase.guide_number || 'No especificada'}
                </Text>
              </View>
            </View>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Estado:</Text>
                <Text style={styles.value}>
                  {getStatusText(purchase.status)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Pago:</Text>
                <Text style={styles.value}>
                  {getPaymentStatusText(purchase.payment_status)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Referencia:</Text>
                <Text style={styles.value}>
                  {purchase.reference_number || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información del Proveedor */}
        {purchase.supplier && (
          <View style={styles.supplierInfo}>
            <Text style={styles.sectionTitle}>Información del Proveedor</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Razón Social:</Text>
              <Text style={styles.value}>{purchase.supplier.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Contacto:</Text>
              <Text style={styles.value}>{purchase.supplier.contact}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Documento:</Text>
              <Text style={styles.value}>
                {purchase.supplier.document_type}:{' '}
                {purchase.supplier.document_number}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{purchase.supplier.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Contacto:</Text>
              <Text style={styles.value}>
                {purchase.supplier.email} | {purchase.supplier.phone}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Moneda:</Text>
              <Text style={styles.value}>{purchase.supplier.currency}</Text>
            </View>
          </View>
        )}

        {/* Tabla de Items */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>
            Detalle de Productos ({items.length}{' '}
            {items.length === 1 ? 'item' : 'items'})
          </Text>

          {/* Header de la tabla */}
          <View style={styles.tableHeader}>
            <Text style={styles.colIndex}>#</Text>
            <Text style={styles.colCode}>Código</Text>
            <Text style={styles.colProduct}>Producto</Text>
            <Text style={styles.colQuantity}>Cant.</Text>
            <Text style={styles.colPrice}>Precio Unit.</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>

          {/* Filas de la tabla */}
          {items.map((item, index) => {
            const itemTotal = calculateItemTotal(item)
            return (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={styles.colIndex}>{index + 1}</Text>
                <Text style={styles.colCode}>{item.code || 'N/A'}</Text>
                <Text style={styles.colProduct}>
                  {getProductDescription(item)}
                </Text>
                <Text style={styles.colQuantity}>{item.quantity || 0}</Text>
                <Text style={styles.colPrice}>
                  {formatCurrency(item.price || 0, purchase.supplier?.currency)}
                </Text>
                <Text style={styles.colTotal}>
                  {formatCurrency(itemTotal, purchase.supplier?.currency)}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(purchase.subtotal, purchase.supplier?.currency)}
            </Text>
          </View>

          {purchase.discount && purchase.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuento Global:</Text>
              <Text style={styles.totalValue}>
                -
                {formatCurrency(purchase.discount, purchase.supplier?.currency)}
              </Text>
            </View>
          )}

          {purchase.tax_amount && purchase.tax_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IGV ({purchase.tax_rate}%):</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(
                  purchase.tax_amount,
                  purchase.supplier?.currency
                )}
              </Text>
            </View>
          )}

          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.totalLabel}>TOTAL A PAGAR:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(
                purchase.total_amount,
                purchase.supplier?.currency
              )}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Documento generado el {new Date().toLocaleString('es-ES')}
          </Text>
          <Text>ID de Compra: {purchase.id}</Text>
          {purchase.notes && <Text>Notas: {purchase.notes}</Text>}
          {purchase.supplier?.notes && (
            <Text>Notas del proveedor: {purchase.supplier.notes}</Text>
          )}
        </View>
      </Page>
    </Document>
  )
}

// Componente principal
interface PurchasePDFGeneratorProps {
  purchase: PurchaseList
  items?: CombinedResultExtended[]
  fileName?: string
}

export default function PurchasePDFGenerator({
  purchase,
  items = [],
  fileName = `compra-${purchase.code || purchase.id}`
}: PurchasePDFGeneratorProps) {
  return (
    <div className="flex gap-2">
      <PDFDownloadLink
        document={<PurchasePDF purchase={purchase} items={items} />}
        fileName={`${fileName}.pdf`}
      >
        {({ blob, url, loading, error }) => (
          <Button disabled={loading} className="flex items-center gap-2">
            {loading ? (
              <>
                <FileText className="h-4 w-4 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Descargar Comprobante PDF
              </>
            )}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  )
}
