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
import { PurchaseItemList, PurchaseList } from '@/types'

// Interfaces
interface Purchase {
  id: string
  date?: Date | null
  supplier_id: string
  total_amount: number
  code?: string | null
  guide_number?: string | null
  subtotal: number
  discount?: number | null
  tax_rate?: number | null
  tax_amount?: number | null
  created_at?: Date | null
  updated_at?: Date | null
}

interface PurchaseItem {
  id: string
  purchase_id?: string | null
  product_id?: string | null
  quantity: number
  price: number
  code?: string
  bar_code?: string
  discount?: number
}

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  currency: string
  status: string
  notes: string
  created_at: string
  updated_at: string
  company_type: string
  document_type: string
  document_number: string
}

type PurchaseWithDetails = Purchase & {
  items: PurchaseItem[]
  supplier: Supplier
}

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#000000',
    paddingBottom: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  companyInfo: {
    marginBottom: 15
  },
  supplierInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333'
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3
  },
  label: {
    fontWeight: 'bold',
    width: 100
  },
  value: {
    flex: 1
  },
  table: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: 1,
    borderBottomColor: '#e0e0e0',
    fontSize: 9
  },
  col1: { width: '10%' },
  col2: { width: '15%' },
  col3: { width: '35%' },
  col4: { width: '10%' },
  col5: { width: '15%' },
  col6: { width: '15%' },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
    width: 200
  },
  totalLabel: {
    fontWeight: 'bold',
    width: 100,
    textAlign: 'right',
    marginRight: 10
  },
  totalValue: {
    width: 90,
    textAlign: 'right'
  },
  finalTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    borderTop: 2,
    borderTopColor: '#000000',
    paddingTop: 5
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: 1,
    borderTopColor: '#cccccc',
    fontSize: 8,
    color: '#666666'
  }
})

// Componente del documento PDF
const PurchasePDF = ({ purchase }: { purchase: PurchaseWithDetails }) => {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-ES')
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>BOLETA DE COMPRA</Text>
          <View style={styles.companyInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Código:</Text>
              <Text style={styles.value}>{purchase.code || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>{formatDate(purchase.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Guía N°:</Text>
              <Text style={styles.value}>{purchase.guide_number || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Información del Proveedor */}
        <View style={styles.supplierInfo}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DEL PROVEEDOR</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{purchase.supplier.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Contacto:</Text>
            <Text style={styles.value}>{purchase.supplier.contact}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{purchase.supplier.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{purchase.supplier.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>{purchase.supplier.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Documento:</Text>
            <Text style={styles.value}>
              {purchase.supplier.document_type}:{' '}
              {purchase.supplier.document_number}
            </Text>
          </View>
        </View>

        {/* Tabla de Items */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>DETALLE DE PRODUCTOS</Text>

          {/* Header de la tabla */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Item</Text>
            <Text style={styles.col2}>Código</Text>
            <Text style={styles.col3}>Código de Barras</Text>
            <Text style={styles.col4}>Cant.</Text>
            <Text style={styles.col5}>Precio Unit.</Text>
            <Text style={styles.col6}>Total</Text>
          </View>

          {/* Filas de la tabla */}
          {purchase.items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.col1}>{index + 1}</Text>
              <Text style={styles.col2}>{item.code || 'N/A'}</Text>
              <Text style={styles.col3}>{item.bar_code || 'N/A'}</Text>
              <Text style={styles.col4}>{item.quantity}</Text>
              <Text style={styles.col5}>
                {formatCurrency(item.price, purchase.supplier.currency)}
              </Text>
              <Text style={styles.col6}>
                {formatCurrency(
                  item.quantity * item.price,
                  purchase.supplier.currency
                )}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(purchase.subtotal, purchase.supplier.currency)}
            </Text>
          </View>

          {purchase.discount && purchase.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuento:</Text>
              <Text style={styles.totalValue}>
                -{formatCurrency(purchase.discount, purchase.supplier.currency)}
              </Text>
            </View>
          )}

          {purchase.tax_amount && purchase.tax_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Impuesto ({purchase.tax_rate}%):
              </Text>
              <Text style={styles.totalValue}>
                {formatCurrency(
                  purchase.tax_amount,
                  purchase.supplier.currency
                )}
              </Text>
            </View>
          )}

          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(
                purchase.total_amount,
                purchase.supplier.currency
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
          {purchase.supplier.notes && (
            <Text>Notas: {purchase.supplier.notes}</Text>
          )}
        </View>
      </Page>
    </Document>
  )
}

// Componente principal
interface PurchasePDFGeneratorProps {
  purchase: PurchaseList
  items?: PurchaseItemList[]
  fileName?: string
}

export default function PurchasePDFGenerator({
  purchase,
  items,
  fileName = `boleta-compra-${purchase.code || purchase.id}`
}: PurchasePDFGeneratorProps) {
  return (
    <div className="flex gap-2">
      <PDFDownloadLink
        document={
          <PurchasePDF
            purchase={
              {
                ...purchase,
                items: items || [],
                supplier: purchase.supplier || {
                  id: '',
                  name: '',
                  contact: '',
                  email: '',
                  phone: '',
                  address: '',
                  currency: 'USD',
                  status: 'active',
                  notes: '',
                  created_at: '',
                  updated_at: '',
                  company_type: '',
                  document_type: '',
                  document_number: ''
                }
              } as PurchaseWithDetails
            }
          />
        }
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
                Descargar Boleta PDF
              </>
            )}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  )
}
