'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InventoryMovementWithProduct } from '@/types'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Sheet
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanyInfo } from '@/types/core/company-info'
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

type SortField = 'date' | 'code' | 'product' | 'type' | 'quantity'
type SortDirection = 'asc' | 'desc'

interface IProps {
  movements: InventoryMovementWithProduct[]
  company: CompanyInfo
}

// Estilos para el PDF
const InventoryReportStyles = StyleSheet.create({
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
  col1: { width: '15%' },
  col2: { width: '15%' },
  col3: { width: '30%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  col6: { width: '10%' },
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
const InventoryReportPDF = ({
  company,
  movements,
  sortField,
  sortDirection
}: {
  company: CompanyInfo
  movements: InventoryMovementWithProduct[]
  sortField: SortField | null
  sortDirection: SortDirection
}) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No especificada'
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
  }

  const getMovementType = (movement: InventoryMovementWithProduct) => {
    const { reference_type, movement_type } = movement
    if (movement_type) {
      return movement_type.charAt(0).toUpperCase() + movement_type.slice(1)
    }
    if (reference_type) {
      return reference_type.charAt(0).toUpperCase() + reference_type.slice(1)
    }
    return 'Movimiento'
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#10B981'
      case 'pending':
        return '#F59E0B'
      case 'cancelled':
        return '#EF4444'
      default:
        return '#6B7280'
    }
  }

  return (
    <Document>
      <Page size="A4" style={InventoryReportStyles.page}>
        {/* Header */}
        <View style={InventoryReportStyles.header}>
          <Text style={InventoryReportStyles.title}>
            REPORTE DE MOVIMIENTOS DE INVENTARIO
          </Text>
          <View style={InventoryReportStyles.companyInfo}>
            <View style={InventoryReportStyles.infoRow}>
              <Text style={InventoryReportStyles.label}>Empresa:</Text>
              <Text style={InventoryReportStyles.value}>{company.name}</Text>
            </View>
            <View style={InventoryReportStyles.infoRow}>
              <Text style={InventoryReportStyles.label}>RUC:</Text>
              <Text style={InventoryReportStyles.value}>
                {company.tax_number}
              </Text>
            </View>
            <View style={InventoryReportStyles.infoRow}>
              <Text style={InventoryReportStyles.label}>Dirección:</Text>
              <Text style={InventoryReportStyles.value}>{company.address}</Text>
            </View>
            <View style={InventoryReportStyles.infoRow}>
              <Text style={InventoryReportStyles.label}>Teléfono:</Text>
              <Text style={InventoryReportStyles.value}>{company.phone}</Text>
            </View>
          </View>
        </View>

        {/* Información del reporte */}
        <View style={InventoryReportStyles.filtersInfo}>
          <Text style={InventoryReportStyles.sectionTitle}>
            CONFIGURACIÓN DEL REPORTE
          </Text>
          <View style={InventoryReportStyles.infoRow}>
            <Text style={InventoryReportStyles.label}>Ordenado por:</Text>
            <Text style={InventoryReportStyles.value}>
              {sortField || 'Ninguno'} ({sortDirection})
            </Text>
          </View>
          <View style={InventoryReportStyles.infoRow}>
            <Text style={InventoryReportStyles.label}>Total movimientos:</Text>
            <Text style={InventoryReportStyles.value}>{movements.length}</Text>
          </View>
          <View style={InventoryReportStyles.infoRow}>
            <Text style={InventoryReportStyles.label}>Fecha generación:</Text>
            <Text style={InventoryReportStyles.value}>
              {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
            </Text>
          </View>
        </View>

        {/* Tabla de movimientos */}
        <View style={InventoryReportStyles.table}>
          {/* Header de la tabla */}
          <View style={InventoryReportStyles.tableHeader}>
            <Text style={InventoryReportStyles.col1}>Fecha</Text>
            <Text style={InventoryReportStyles.col2}>Código</Text>
            <Text style={InventoryReportStyles.col3}>Producto</Text>
            <Text style={InventoryReportStyles.col4}>Tipo</Text>
            <Text style={InventoryReportStyles.col5}>Cantidad</Text>
            <Text style={InventoryReportStyles.col6}>Estado</Text>
          </View>

          {/* Filas de la tabla */}
          {movements.map((movement) => {
            const isPositive = movement.quantity > 0
            const quantityDisplay = Math.abs(movement.quantity)
            const movementType = getMovementType(movement)

            return (
              <View key={movement.id} style={InventoryReportStyles.tableRow}>
                <Text style={InventoryReportStyles.col1}>
                  {formatDate(movement.date || movement.movement_date)}
                </Text>
                <Text style={InventoryReportStyles.col2}>
                  {movement?.product?.code || '-'}
                </Text>
                <Text style={InventoryReportStyles.col3}>
                  {movement?.product?.brand?.name}{' '}
                  {movement?.product?.description}
                  {movement.variant && (
                    <>
                      {' - '}
                      {movement.variant.name}
                      {movement.variant.attributes?.length > 0 &&
                        ` (${movement.variant.attributes
                          .map((attr) => attr.attribute_value)
                          .join(', ')})`}
                    </>
                  )}
                </Text>
                <Text style={InventoryReportStyles.col4}>{movementType}</Text>
                <Text style={InventoryReportStyles.col5}>
                  {isPositive ? '+' : '-'}
                  {quantityDisplay}
                </Text>
                <Text
                  style={[
                    InventoryReportStyles.col6,
                    { color: getStatusColor(movement.movement_status) }
                  ]}
                >
                  {movement.movement_status}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Footer */}
        <View style={InventoryReportStyles.footer}>
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
  movements,
  sortField,
  sortDirection
}: {
  company: CompanyInfo
  movements: InventoryMovementWithProduct[]
  sortField: SortField | null
  sortDirection: SortDirection
}) => {
  const fileName = `movimientos-inventario-${format(
    new Date(),
    'yyyyMMddHHmm',
    { locale: es }
  )}`

  const getMovementType = (movement: InventoryMovementWithProduct) => {
    const { reference_type, movement_type } = movement

    // Si tenemos movement_type definido, usarlo primero
    if (movement_type) {
      return movement_type.charAt(0).toUpperCase() + movement_type.slice(1)
    }

    // Si tenemos reference_type definido, usarlo
    if (reference_type) {
      return reference_type.charAt(0).toUpperCase() + reference_type.slice(1)
    }
  }

  const handleExportExcel = () => {
    const worksheetData = movements.map((movement) => {
      const isPositive = movement.quantity > 0
      const quantityDisplay = Math.abs(movement.quantity)
      const movementType = getMovementType(movement)

      return {
        Fecha:
          movement.date || movement.movement_date
            ? format(
                new Date(movement.date || movement.movement_date || ''),
                'dd/MM/yyyy HH:mm',
                { locale: es }
              )
            : 'No especificada',
        Código: movement?.product?.code || '-',
        Producto: `${movement?.product?.brand?.name || ''} ${
          movement?.product?.description || ''
        }`,
        Variante: movement.variant
          ? `${movement.variant.name} ${
              movement.variant.attributes?.length > 0
                ? `(${movement.variant.attributes
                    .map((attr) => attr.attribute_value)
                    .join(', ')})`
                : ''
            }`
          : '',
        Tipo: movementType,
        Cantidad: `${isPositive ? '+' : '-'}${quantityDisplay}`,
        Estado: movement.movement_status
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos')

    // Ajustar el ancho de las columnas
    const wscols = [
      { wch: 20 }, // Fecha
      { wch: 15 }, // Código
      { wch: 40 }, // Producto
      { wch: 30 }, // Variante
      { wch: 20 }, // Tipo
      { wch: 12 }, // Cantidad
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
          <InventoryReportPDF
            company={company}
            movements={movements}
            sortField={sortField}
            sortDirection={sortDirection}
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

export const InventoryMovementReport = (props: IProps) => {
  const { movements, company } = props
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get('sortBy')?.split('.') || []
  const [sortField, setSortField] = useState<SortField | null>(
    (currentSort[0] as SortField) || null
  )
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    (currentSort[1] as SortDirection) || 'asc'
  )

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No especificada'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getQuantityDisplay = (quantity: number) => {
    const isPositive = quantity > 0
    return {
      value: Math.abs(quantity),
      isPositive,
      icon: isPositive ? (
        <ArrowDownLeft className="h-3 w-3" />
      ) : (
        <ArrowUpRight className="h-3 w-3" />
      ),
      color: isPositive
        ? 'text-green-800 bg-green-100'
        : 'text-red-800 bg-red-100'
    }
  }

  const getMovementType = (movement: InventoryMovementWithProduct) => {
    const { reference_type, movement_type } = movement

    if (movement_type) {
      return movement_type.charAt(0).toUpperCase() + movement_type.slice(1)
    }

    if (reference_type) {
      return reference_type.charAt(0).toUpperCase() + reference_type.slice(1)
    }

    return 'Movimiento'
  }

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc'

    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    }

    setSortField(field)
    setSortDirection(newDirection)

    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', `${field}.${newDirection}`)
    router.push(`${pathname}?${params.toString()}`)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-2 h-3 w-3" />
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-200 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-200 text-red-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // Ordenar los movimientos según el campo y dirección seleccionados
  const sortedMovements = [...movements].sort((a, b) => {
    if (!sortField) return 0

    const direction = sortDirection === 'asc' ? 1 : -1

    switch (sortField) {
      case 'date':
        return ((a.date || '') > (b.date || '') ? 1 : -1) * direction
      case 'code':
        return (
          ((a?.product?.code || '') > (b?.product?.code || '') ? 1 : -1) *
          direction
        )
      case 'product':
        const productA = `${a?.product?.brand?.name || ''} ${
          a?.product?.description || ''
        }`
        const productB = `${b?.product?.brand?.name || ''} ${
          b?.product?.description || ''
        }`
        return (productA > productB ? 1 : -1) * direction
      case 'type':
        const typeA = getMovementType(a) || ''
        const typeB = getMovementType(b) || ''
        return (typeA > typeB ? 1 : -1) * direction
      case 'quantity':
        return (a.quantity - b.quantity) * direction
      default:
        return 0
    }
  })

  if (movements.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-gray-500">
        No hay movimientos registrados
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Encabezado con título y botones de exportación */}
      <div className="flex justify-between items-center">
        <ReportGenerators
          company={company}
          movements={sortedMovements}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </div>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Movimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {movements.filter((m) => m.quantity > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Salidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {movements.filter((m) => m.quantity < 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de movimientos */}
      <div className="rounded-md border bg-white shadow-none overflow-auto max-h-[70vh] w-full">
        <div className="overflow-x-auto min-w-full">
          <Table className="min-w-[800px]">
            <TableHeader className="sticky top-0 bg-gray-100 font-bold border-b">
              <TableRow>
                <TableHead className="border-r border-gray-200 w-[150px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('date')}
                    className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
                  >
                    Fecha y hora
                    {getSortIcon('date')}
                  </Button>
                </TableHead>
                <TableHead className="border-r border-gray-200 w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('code')}
                    className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
                  >
                    Código
                    {getSortIcon('code')}
                  </Button>
                </TableHead>
                <TableHead className="border-r border-gray-200">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('product')}
                    className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
                  >
                    Producto
                    {getSortIcon('product')}
                  </Button>
                </TableHead>
                <TableHead className="border-r border-gray-200 text-center w-[120px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('type')}
                    className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
                  >
                    Tipo
                    {getSortIcon('type')}
                  </Button>
                </TableHead>
                <TableHead className="border-r border-gray-200 text-center w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('quantity')}
                    className="h-auto p-0 font-medium text-gray-700 hover:bg-transparent hover:text-gray-900"
                  >
                    Cantidad
                    {getSortIcon('quantity')}
                  </Button>
                </TableHead>
                <TableHead className="border-r border-gray-200 text-center w-[110px]">
                  Estado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {sortedMovements.map((movement) => {
                const quantityDisplay = getQuantityDisplay(movement.quantity)
                const movementType = getMovementType(movement)

                return (
                  <TableRow key={movement.id} className="hover:bg-gray-50">
                    <TableCell className="p-3 text-sm border-r border-gray-100">
                      {formatDate(movement.date || movement.movement_date)}
                      {(movement.date || movement.movement_date) && (
                        <span className="block text-xs text-gray-400">
                          {new Date(
                            movement.date || movement.movement_date || ''
                          ).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-3 text-sm border-r border-gray-100">
                      {movement?.product?.code || '-'}
                    </TableCell>
                    <TableCell className="p-3 border-r border-gray-100">
                      <div className="text-sm">
                        {movement?.product?.brand?.name}{' '}
                        {movement?.product?.description}
                        {movement.variant && (
                          <>
                            {' - '}
                            {movement.variant.name}
                            {movement.variant.attributes?.length > 0 && (
                              <>
                                {' ('}
                                {movement.variant.attributes
                                  .map((attr) => attr.attribute_value)
                                  .join(', ')}
                                {')'}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-3 text-center border-r border-gray-100">
                      <Badge
                        variant="outline"
                        className={`text-xs rounded-full ${quantityDisplay.color}`}
                      >
                        {movementType}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-r border-gray-100">
                      <p
                        className={`p-3 text-center font-bold ${
                          quantityDisplay?.isPositive
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}
                      >
                        {quantityDisplay.isPositive ? '+' : '-'}
                        {quantityDisplay.value}
                      </p>
                    </TableCell>
                    <TableCell className="p-3 text-center border-r border-gray-100">
                      <Badge
                        variant="outline"
                        className={`text-xs rounded-full ${getStatusColor(
                          movement.movement_status
                        )}`}
                      >
                        {movement.movement_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
