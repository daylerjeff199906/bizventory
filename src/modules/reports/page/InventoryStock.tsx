'use client'

import { Badge } from '@/components/ui/badge'
import type { InventoryStock } from '@/types'
import {
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  FileText,
  Sheet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from '@react-pdf/renderer'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  inventoryStock: InventoryStock[]
  company: CompanyInfo
}

interface CompanyInfo {
  name: string
  tax_number: string
  address: string
  phone: string
  email?: string
  logo_url?: string
}

// Estilos para el PDF
const InventoryStockReportStyles = StyleSheet.create({
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
  filtersInfo: {
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
  col1: { width: '5%' },
  col2: { width: '40%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '25%' },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: 1,
    borderTopColor: '#cccccc',
    fontSize: 8,
    color: '#666666'
  }
})

// Componente PDF
const InventoryStockReportPDF = ({
  company,
  inventoryStock
}: {
  company: CompanyInfo
  inventoryStock: InventoryStock[]
}) => {
  const getStockStatusColor = (quantity: number) => {
    if (quantity === 0) return '#EF4444'
    if (quantity <= 5) return '#F59E0B'
    if (quantity >= 50) return '#3B82F6'
    return '#10B981'
  }

  const getStockStatusText = (quantity: number) => {
    if (quantity === 0) return 'Sin Stock'
    if (quantity <= 5) return 'Stock Bajo'
    if (quantity >= 50) return 'Stock Alto'
    return 'Stock Normal'
  }

  return (
    <Document>
      <Page size="A4" style={InventoryStockReportStyles.page}>
        {/* Header */}
        <View style={InventoryStockReportStyles.header}>
          <Text style={InventoryStockReportStyles.title}>
            REPORTE DE STOCK DE INVENTARIO
          </Text>
          <View style={InventoryStockReportStyles.companyInfo}>
            <View style={InventoryStockReportStyles.infoRow}>
              <Text style={InventoryStockReportStyles.label}>Empresa:</Text>
              <Text style={InventoryStockReportStyles.value}>
                {company.name}
              </Text>
            </View>
            <View style={InventoryStockReportStyles.infoRow}>
              <Text style={InventoryStockReportStyles.label}>RUC:</Text>
              <Text style={InventoryStockReportStyles.value}>
                {company.tax_number}
              </Text>
            </View>
            <View style={InventoryStockReportStyles.infoRow}>
              <Text style={InventoryStockReportStyles.label}>Dirección:</Text>
              <Text style={InventoryStockReportStyles.value}>
                {company.address}
              </Text>
            </View>
            <View style={InventoryStockReportStyles.infoRow}>
              <Text style={InventoryStockReportStyles.label}>Teléfono:</Text>
              <Text style={InventoryStockReportStyles.value}>
                {company.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Información del reporte */}
        <View style={InventoryStockReportStyles.filtersInfo}>
          <Text style={InventoryStockReportStyles.sectionTitle}>
            RESUMEN DE STOCK
          </Text>
          <View style={InventoryStockReportStyles.infoRow}>
            <Text style={InventoryStockReportStyles.label}>
              Total productos:
            </Text>
            <Text style={InventoryStockReportStyles.value}>
              {inventoryStock.length}
            </Text>
          </View>
          <View style={InventoryStockReportStyles.infoRow}>
            <Text style={InventoryStockReportStyles.label}>Sin stock:</Text>
            <Text style={InventoryStockReportStyles.value}>
              {inventoryStock.filter((item) => item.stock_total === 0).length}
            </Text>
          </View>
          <View style={InventoryStockReportStyles.infoRow}>
            <Text style={InventoryStockReportStyles.label}>Stock bajo:</Text>
            <Text style={InventoryStockReportStyles.value}>
              {
                inventoryStock.filter(
                  (item) => item.stock_total > 0 && item.stock_total <= 5
                ).length
              }
            </Text>
          </View>
          <View style={InventoryStockReportStyles.infoRow}>
            <Text style={InventoryStockReportStyles.label}>Stock alto:</Text>
            <Text style={InventoryStockReportStyles.value}>
              {inventoryStock.filter((item) => item.stock_total >= 50).length}
            </Text>
          </View>
          <View style={InventoryStockReportStyles.infoRow}>
            <Text style={InventoryStockReportStyles.label}>
              Fecha generación:
            </Text>
            <Text style={InventoryStockReportStyles.value}>
              {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
            </Text>
          </View>
        </View>

        {/* Tabla de stock */}
        <View style={InventoryStockReportStyles.table}>
          {/* Header de la tabla */}
          <View style={InventoryStockReportStyles.tableHeader}>
            <Text style={InventoryStockReportStyles.col1}>#</Text>
            <Text style={InventoryStockReportStyles.col2}>Producto</Text>
            <Text style={InventoryStockReportStyles.col3}>Código</Text>
            <Text style={InventoryStockReportStyles.col4}>Cantidad</Text>
            <Text style={InventoryStockReportStyles.col5}>Estado</Text>
          </View>

          {/* Filas de la tabla */}
          {inventoryStock.map((item, index) => {
            const statusColor = getStockStatusColor(item.stock_total)
            const statusText = getStockStatusText(item.stock_total)

            return (
              <View
                key={item.product_id}
                style={InventoryStockReportStyles.tableRow}
              >
                <Text style={InventoryStockReportStyles.col1}>{index + 1}</Text>
                <Text style={InventoryStockReportStyles.col2}>
                  {item.brand_name} {item.product_full_name}
                </Text>
                <Text style={InventoryStockReportStyles.col3}>{item.code}</Text>
                <Text
                  style={[
                    InventoryStockReportStyles.col4,
                    {
                      color: statusColor,
                      fontWeight: 'bold'
                    }
                  ]}
                >
                  {item.stock_total}
                </Text>
                <Text
                  style={[
                    InventoryStockReportStyles.col5,
                    { color: statusColor }
                  ]}
                >
                  {statusText}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Footer */}
        <View style={InventoryStockReportStyles.footer}>
          <Text>
            Documento generado el{' '}
            {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Componente de generación de reportes
const ReportGenerators = ({
  company,
  inventoryStock
}: {
  company: CompanyInfo
  inventoryStock: InventoryStock[]
}) => {
  const fileName = `stock-inventario-${format(new Date(), 'yyyyMMddHHmm', {
    locale: es
  })}`

  const handleExportExcel = () => {
    const worksheetData = inventoryStock.map((item, index) => {
      const status = getStockStatus(item.stock_total)

      return {
        '#': index + 1,
        Producto: `${item.brand_name || ''} ${item.product_full_name}`,
        Código: item.code,
        Cantidad: item.stock_total,
        Estado: status.label
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock')

    // Ajustar el ancho de las columnas
    const wscols = [
      { wch: 5 }, // #
      { wch: 50 }, // Producto
      { wch: 15 }, // Código
      { wch: 10 }, // Cantidad
      { wch: 15 } // Estado
    ]
    worksheet['!cols'] = wscols

    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportExcel}>
        <Sheet className="h-4 w-4 mr-2" />
        Exportar Excel
      </Button>

      <PDFDownloadLink
        document={
          <InventoryStockReportPDF
            company={company}
            inventoryStock={inventoryStock}
          />
        }
        fileName={`${fileName}.pdf`}
      >
        {({ loading }) => (
          <Button size="sm" disabled={loading}>
            {loading ? (
              'Generando...'
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </>
            )}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  )
}

// Función auxiliar para obtener el estado del stock
const getStockStatus = (quantity: number) => {
  if (quantity === 0)
    return {
      label: 'Sin Stock',
      color: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="h-3 w-3" />
    }
  if (quantity <= 5)
    return {
      label: 'Stock Bajo',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <TrendingDown className="h-3 w-3" />
    }
  if (quantity >= 50)
    return {
      label: 'Stock Alto',
      color: 'bg-blue-100 text-blue-800',
      icon: <TrendingUp className="h-3 w-3" />
    }
  return {
    label: 'Stock Normal',
    color: 'bg-green-100 text-green-800',
    icon: <Package className="h-3 w-3" />
  }
}

export default function InventoryStockTable({
  inventoryStock,
  company
}: Props) {
  return (
    <div className="space-y-4">
      {/* Encabezado con título y botones de exportación */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Stock de Inventario</h2>
        <ReportGenerators company={company} inventoryStock={inventoryStock} />
      </div>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">
            Total Productos
          </div>
          <div className="text-2xl font-bold">{inventoryStock.length}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Sin Stock</div>
          <div className="text-2xl font-bold text-red-600">
            {inventoryStock.filter((item) => item.stock_total === 0).length}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Stock Bajo</div>
          <div className="text-2xl font-bold text-yellow-600">
            {
              inventoryStock.filter(
                (item) => item.stock_total > 0 && item.stock_total <= 5
              ).length
            }
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Stock Alto</div>
          <div className="text-2xl font-bold text-blue-600">
            {inventoryStock.filter((item) => item.stock_total >= 50).length}
          </div>
        </div>
      </div>

      {/* Tabla de stock */}
      <div className="overflow-hidden rounded-md border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  #
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Producto
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Código
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Cantidad
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {inventoryStock.map((item, index) => {
                const status = getStockStatus(item.stock_total)
                const textColor =
                  item.stock_total === 0
                    ? 'text-red-600'
                    : item.stock_total <= 5
                    ? 'text-yellow-600'
                    : item.stock_total >= 50
                    ? 'text-blue-600'
                    : 'text-green-600'

                return (
                  <tr
                    key={item.product_id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {item.brand_name} {item.product_full_name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="text-xs font-mono bg-gray-50"
                      >
                        {item.code}
                      </Badge>
                    </td>
                    <td
                      className={`px-4 py-3 text-lg font-semibold text-center ${textColor}`}
                    >
                      {item.stock_total}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`${status.color} px-2 py-1 rounded-md`}>
                        <span className="flex items-center gap-1.5">
                          {status.icon}
                          {status.label}
                        </span>
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
