// 'use client'

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table'
// import { FileText, MapPin, Download, Info } from 'lucide-react'
// import { CompanyInfo } from '@/types/core/company-info'
// import { SaleWithItems } from '@/apis/app/sales'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Button } from '@/components/ui/button'
// import {
//   PDFDownloadLink,
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet
// } from '@react-pdf/renderer'
// import { format } from 'date-fns'
// import { es } from 'date-fns/locale'

// interface InvoiceDetailProps {
//   company: CompanyInfo
//   sale: SaleWithItems
// }

// // Estilos para el PDF de comprobante
// const InvoiceStyles = StyleSheet.create({
//   page: {
//     flexDirection: 'column',
//     backgroundColor: '#FFFFFF',
//     padding: 30,
//     fontSize: 10
//   },
//   header: {
//     marginBottom: 20,
//     borderBottom: 2,
//     borderBottomColor: '#000000',
//     paddingBottom: 10
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 10
//   },
//   companyInfo: {
//     marginBottom: 15
//   },
//   clientInfo: {
//     marginBottom: 20,
//     padding: 10,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 5
//   },
//   sectionTitle: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     marginBottom: 5,
//     color: '#333333'
//   },
//   infoRow: {
//     flexDirection: 'row',
//     marginBottom: 3
//   },
//   label: {
//     fontWeight: 'bold',
//     width: 100
//   },
//   value: {
//     flex: 1
//   },
//   table: {
//     marginBottom: 20
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: '#e0e0e0',
//     padding: 8,
//     fontWeight: 'bold',
//     fontSize: 9
//   },
//   tableRow: {
//     flexDirection: 'row',
//     padding: 8,
//     borderBottom: 1,
//     borderBottomColor: '#e0e0e0',
//     fontSize: 9
//   },
//   col1: { width: '10%' },
//   col2: { width: '40%' },
//   col3: { width: '15%' },
//   col4: { width: '15%' },
//   col5: { width: '20%' },
//   totalsSection: {
//     marginTop: 20,
//     alignItems: 'flex-end'
//   },
//   totalRow: {
//     flexDirection: 'row',
//     marginBottom: 5,
//     width: 200
//   },
//   totalLabel: {
//     fontWeight: 'bold',
//     width: 100,
//     textAlign: 'right',
//     marginRight: 10
//   },
//   totalValue: {
//     width: 90,
//     textAlign: 'right'
//   },
//   finalTotal: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     borderTop: 2,
//     borderTopColor: '#000000',
//     paddingTop: 5
//   },
//   footer: {
//     marginTop: 30,
//     paddingTop: 20,
//     borderTop: 1,
//     borderTopColor: '#cccccc',
//     fontSize: 8,
//     color: '#666666'
//   }
// })

// // Estilos para el PDF de ticket
// const TicketStyles = StyleSheet.create({
//   page: {
//     flexDirection: 'column',
//     backgroundColor: '#FFFFFF',
//     padding: 15,
//     fontSize: 8,
//     width: 200 // Ancho reducido para ticket
//   },
//   header: {
//     marginBottom: 10,
//     borderBottom: 1,
//     borderBottomColor: '#000000',
//     paddingBottom: 5
//   },
//   title: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 5
//   },
//   companyName: {
//     fontSize: 10,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 3
//   },
//   companyInfo: {
//     textAlign: 'center',
//     marginBottom: 5,
//     fontSize: 7
//   },
//   infoRow: {
//     flexDirection: 'row',
//     marginBottom: 2
//   },
//   label: {
//     fontWeight: 'bold'
//   },
//   table: {
//     marginVertical: 10
//   },
//   tableRow: {
//     flexDirection: 'row',
//     marginBottom: 3
//   },
//   col1: { width: '15%' },
//   col2: { width: '45%' },
//   col3: { width: '20%' },
//   col4: { width: '20%' },
//   totalsRow: {
//     flexDirection: 'row',
//     marginTop: 5,
//     fontWeight: 'bold'
//   },
//   footer: {
//     marginTop: 10,
//     paddingTop: 5,
//     borderTop: 1,
//     borderTopColor: '#cccccc',
//     fontSize: 7,
//     textAlign: 'center'
//   }
// })

// // Componente PDF de comprobante
// const InvoicePDF = ({
//   company,
//   sale
// }: {
//   company: CompanyInfo
//   sale: SaleWithItems
// }) => {
//   const formatDate = (dateString: string) => {
//     return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
//   }

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('es-PE', {
//       style: 'currency',
//       currency: 'PEN'
//     }).format(amount)
//   }

//   return (
//     <Document>
//       <Page size="A4" style={InvoiceStyles.page}>
//         {/* Header */}
//         <View style={InvoiceStyles.header}>
//           <Text style={InvoiceStyles.title}>COMPROBANTE DE VENTA</Text>
//           <View style={InvoiceStyles.companyInfo}>
//             <View style={InvoiceStyles.infoRow}>
//               <Text style={InvoiceStyles.label}>Empresa:</Text>
//               <Text style={InvoiceStyles.value}>{company.name}</Text>
//             </View>
//             <View style={InvoiceStyles.infoRow}>
//               <Text style={InvoiceStyles.label}>RUC:</Text>
//               <Text style={InvoiceStyles.value}>{company.tax_number}</Text>
//             </View>
//             <View style={InvoiceStyles.infoRow}>
//               <Text style={InvoiceStyles.label}>Dirección:</Text>
//               <Text style={InvoiceStyles.value}>{company.address}</Text>
//             </View>
//             <View style={InvoiceStyles.infoRow}>
//               <Text style={InvoiceStyles.label}>Teléfono:</Text>
//               <Text style={InvoiceStyles.value}>{company.phone}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Información de la venta */}
//         <View style={InvoiceStyles.clientInfo}>
//           <Text style={InvoiceStyles.sectionTitle}>
//             INFORMACIÓN DE LA VENTA
//           </Text>
//           <View style={InvoiceStyles.infoRow}>
//             <Text style={InvoiceStyles.label}>Número:</Text>
//             <Text style={InvoiceStyles.value}>{sale.reference_number}</Text>
//           </View>
//           <View style={InvoiceStyles.infoRow}>
//             <Text style={InvoiceStyles.label}>Fecha:</Text>
//             <Text style={InvoiceStyles.value}>{formatDate(sale.date)}</Text>
//           </View>
//           <View style={InvoiceStyles.infoRow}>
//             <Text style={InvoiceStyles.label}>Método de pago:</Text>
//             <Text style={InvoiceStyles.value}>{sale.payment_method}</Text>
//           </View>
//           <View style={InvoiceStyles.infoRow}>
//             <Text style={InvoiceStyles.label}>Estado:</Text>
//             <Text style={InvoiceStyles.value}>{sale.status}</Text>
//           </View>
//           {sale.shipping_address && (
//             <View style={InvoiceStyles.infoRow}>
//               <Text style={InvoiceStyles.label}>Dirección envío:</Text>
//               <Text style={InvoiceStyles.value}>{sale.shipping_address}</Text>
//             </View>
//           )}
//         </View>

//         {/* Tabla de Items */}
//         <View style={InvoiceStyles.table}>
//           <Text style={InvoiceStyles.sectionTitle}>DETALLE DE PRODUCTOS</Text>

//           {/* Header de la tabla */}
//           <View style={InvoiceStyles.tableHeader}>
//             <Text style={InvoiceStyles.col1}>Cant.</Text>
//             <Text style={InvoiceStyles.col2}>Producto</Text>
//             <Text style={InvoiceStyles.col3}>P. Unit.</Text>
//             <Text style={InvoiceStyles.col4}>Desc.</Text>
//             <Text style={InvoiceStyles.col5}>Total</Text>
//           </View>

//           {/* Filas de la tabla */}
//           {sale.items.map((item) => (
//             <View key={item.id} style={InvoiceStyles.tableRow}>
//               <Text style={InvoiceStyles.col1}>
//                 {item.quantity} {item.unit}
//               </Text>
//               <Text style={InvoiceStyles.col2}>
//                 {item.brand?.name || ''} {item.description}
//                 {item.variant_name && ` - ${item.variant_name}`}
//                 {item.attributes &&
//                   item.attributes.length > 0 &&
//                   ` (${item.attributes
//                     .map((attr) => attr.attribute_value)
//                     .join(', ')})`}
//               </Text>
//               <Text style={InvoiceStyles.col3}>
//                 {formatCurrency(item.unit_price ?? 0)}
//               </Text>
//               <Text style={InvoiceStyles.col4}>
//                 {item.discount_amount
//                   ? `-${formatCurrency(item.discount_amount)}`
//                   : '-'}
//               </Text>
//               <Text style={InvoiceStyles.col5}>
//                 {formatCurrency(item.total_price ?? 0)}
//               </Text>
//             </View>
//           ))}
//         </View>

//         {/* Totales */}
//         <View style={InvoiceStyles.totalsSection}>
//           <View style={InvoiceStyles.totalRow}>
//             <Text style={InvoiceStyles.totalLabel}>Subtotal:</Text>
//             <Text style={InvoiceStyles.totalValue}>
//               {formatCurrency(sale.total_amount - sale.tax_amount)}
//             </Text>
//           </View>

//           {sale.discount_amount > 0 && (
//             <View style={InvoiceStyles.totalRow}>
//               <Text style={InvoiceStyles.totalLabel}>Descuento:</Text>
//               <Text style={InvoiceStyles.totalValue}>
//                 -{formatCurrency(sale.discount_amount)}
//               </Text>
//             </View>
//           )}

//           {sale.tax_amount > 0 && (
//             <View style={InvoiceStyles.totalRow}>
//               <Text style={InvoiceStyles.totalLabel}>IGV (18%):</Text>
//               <Text style={InvoiceStyles.totalValue}>
//                 {formatCurrency(sale.tax_amount)}
//               </Text>
//             </View>
//           )}

//           <View style={[InvoiceStyles.totalRow, InvoiceStyles.finalTotal]}>
//             <Text style={InvoiceStyles.totalLabel}>TOTAL:</Text>
//             <Text style={InvoiceStyles.totalValue}>
//               {formatCurrency(sale.total_amount)}
//             </Text>
//           </View>
//         </View>

//         {/* Footer */}
//         <View style={InvoiceStyles.footer}>
//           <Text>
//             Documento generado el{' '}
//             {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
//           </Text>
//           <Text>Gracias por su compra</Text>
//         </View>
//       </Page>
//     </Document>
//   )
// }

// // Componente PDF de ticket
// const TicketPDF = ({
//   company,
//   sale
// }: {
//   company: CompanyInfo
//   sale: SaleWithItems
// }) => {
//   const formatDate = (dateString: string) => {
//     return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
//   }

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('es-PE', {
//       style: 'currency',
//       currency: 'PEN'
//     }).format(amount)
//   }

//   return (
//     <Document>
//       <Page size={[200, 1000]} style={TicketStyles.page}>
//         {' '}
//         {/* Tamaño personalizado para ticket */}
//         {/* Header */}
//         <View style={TicketStyles.header}>
//           <Text style={TicketStyles.companyName}>{company.name}</Text>
//           <Text style={TicketStyles.companyInfo}>
//             RUC: {company.tax_number} | Tel: {company.phone}
//           </Text>
//           <Text style={TicketStyles.companyInfo}>{company.address}</Text>
//           <Text style={TicketStyles.title}>COMPROBANTE DE VENTA</Text>
//         </View>
//         {/* Información de la venta */}
//         <View>
//           <View style={TicketStyles.infoRow}>
//             <Text style={TicketStyles.label}>N°: </Text>
//             <Text>{sale.reference_number}</Text>
//           </View>
//           <View style={TicketStyles.infoRow}>
//             <Text style={TicketStyles.label}>Fecha: </Text>
//             <Text>{formatDate(sale.date)}</Text>
//           </View>
//           <View style={TicketStyles.infoRow}>
//             <Text style={TicketStyles.label}>Método: </Text>
//             <Text>{sale.payment_method}</Text>
//           </View>
//         </View>
//         {/* Tabla de Items */}
//         <View style={TicketStyles.table}>
//           {/* Header de la tabla */}
//           <View style={TicketStyles.tableRow}>
//             <Text style={TicketStyles.col1}>Cant.</Text>
//             <Text style={TicketStyles.col2}>Producto</Text>
//             <Text style={TicketStyles.col4}>Total</Text>
//           </View>

//           {/* Filas de la tabla */}
//           {sale.items.map((item) => (
//             <View key={item.id} style={TicketStyles.tableRow}>
//               <Text style={TicketStyles.col1}>{item.quantity}</Text>
//               <Text style={TicketStyles.col2}>
//                 {item.description}
//                 {item.variant_name && ` - ${item.variant_name}`}
//               </Text>
//               <Text style={TicketStyles.col4}>
//                 {formatCurrency(item.total_price ?? 0)}
//               </Text>
//             </View>
//           ))}
//         </View>
//         {/* Totales */}
//         <View>
//           <View style={TicketStyles.totalsRow}>
//             <Text style={TicketStyles.col2}>Subtotal:</Text>
//             <Text style={TicketStyles.col4}>
//               {formatCurrency(sale.total_amount - sale.tax_amount)}
//             </Text>
//           </View>
//           {sale.discount_amount > 0 && (
//             <View style={TicketStyles.totalsRow}>
//               <Text style={TicketStyles.col2}>Descuento:</Text>
//               <Text style={TicketStyles.col4}>
//                 -{formatCurrency(sale.discount_amount)}
//               </Text>
//             </View>
//           )}
//           {sale.tax_amount > 0 && (
//             <View style={TicketStyles.totalsRow}>
//               <Text style={TicketStyles.col2}>IGV (18%):</Text>
//               <Text style={TicketStyles.col4}>
//                 {formatCurrency(sale.tax_amount)}
//               </Text>
//             </View>
//           )}
//           <View style={TicketStyles.totalsRow}>
//             <Text style={TicketStyles.col2}>TOTAL:</Text>
//             <Text style={TicketStyles.col4}>
//               {formatCurrency(sale.total_amount)}
//             </Text>
//           </View>
//         </View>
//         {/* Footer */}
//         <View style={TicketStyles.footer}>
//           <Text>Gracias por su compra</Text>
//           <Text>{format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}</Text>
//         </View>
//       </Page>
//     </Document>
//   )
// }

// // Componente de generación de PDFs
// const PDFGenerators = ({
//   company,
//   sale
// }: {
//   company: CompanyInfo
//   sale: SaleWithItems
// }) => {
//   const fileName = `venta-${sale.reference_number || sale.id}`

//   return (
//     <div className="flex gap-2">
//       <PDFDownloadLink
//         document={<TicketPDF company={company} sale={sale} />}
//         fileName={`${fileName}-ticket.pdf`}
//       >
//         {({ loading }) => (
//           <Button variant="outline" size="sm" disabled={loading}>
//             {loading ? (
//               'Generando...'
//             ) : (
//               <>
//                 <Download className="h-4 w-4 mr-2" />
//                 Ticket PDF
//               </>
//             )}
//           </Button>
//         )}
//       </PDFDownloadLink>

//       <PDFDownloadLink
//         document={<InvoicePDF company={company} sale={sale} />}
//         fileName={`${fileName}-comprobante.pdf`}
//       >
//         {({ loading }) => (
//           <Button size="sm" disabled={loading}>
//             {loading ? (
//               'Generando...'
//             ) : (
//               <>
//                 <FileText className="h-4 w-4 mr-2" />
//                 Comprobante PDF
//               </>
//             )}
//           </Button>
//         )}
//       </PDFDownloadLink>
//     </div>
//   )
// }

// export const InvoiceDetailPrint = ({ company, sale }: InvoiceDetailProps) => {
//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'completed':
//         return 'bg-green-100 text-green-800 border-green-200'
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800 border-yellow-200'
//       case 'cancelled':
//         return 'bg-red-100 text-red-800 border-red-200'
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-200'
//     }
//   }

//   const getStatusText = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'completed':
//         return 'Completado'
//       case 'pending':
//         return 'Pendiente'
//       case 'cancelled':
//         return 'Cancelado'
//       default:
//         return status
//     }
//   }

//   const formatDate = (dateString: string) => {
//     return format(new Date(dateString), 'PPP', { locale: es })
//   }

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('es-PE', {
//       style: 'currency',
//       currency: 'PEN'
//     }).format(amount)
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white">
//       {/* Alert informativo */}
//       <Alert className="mb-6">
//         <Info className="h-4 w-4" />
//         <AlertDescription>
//           Este documento incluye toda la información de la venta: datos del
//           cliente, detalle de productos con precios y descuentos, y totales
//           calculados.
//         </AlertDescription>
//       </Alert>

//       {/* Botones de descarga */}
//       <div className="flex justify-end mb-6">
//         <PDFGenerators company={company} sale={sale} />
//       </div>

//       {/* Header de la factura */}
//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>Información de la Venta</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//             <div>
//               <label className="text-sm font-medium text-gray-500">
//                 Número de Factura
//               </label>
//               <p className="font-semibold">{sale.reference_number}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Fecha</label>
//               <p className="font-semibold">{formatDate(sale.date)}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">
//                 Estado
//               </label>
//               <Badge className={`rounded-md ${getStatusColor(sale.status)}`}>
//                 {getStatusText(sale.status)}
//               </Badge>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">
//                 Método de Pago
//               </label>
//               <p className="font-semibold capitalize">{sale.payment_method}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">
//                 Total de Items
//               </label>
//               <p className="font-semibold">{sale.total_items}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Total</label>
//               <p className="text-lg font-bold text-green-600">
//                 {formatCurrency(sale.total_amount)}
//               </p>
//             </div>
//           </div>

//           {/* Información de envío si existe */}
//           {sale.shipping_address && (
//             <div className="border-t pt-4">
//               <h3 className="font-semibold mb-3">Dirección de Envío</h3>
//               <div className="flex items-start gap-2">
//                 <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
//                 <p className="text-gray-600">{sale.shipping_address}</p>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Información de la empresa */}
//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>Información de la Empresa</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-start gap-4">
//             {company.logo_url && (
//               <img
//                 src={company.logo_url}
//                 alt={`Logo de ${company.name}`}
//                 className="w-16 h-16 object-contain rounded-md"
//               />
//             )}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
//               <div>
//                 <p className="font-medium">{company.name}</p>
//                 <p className="text-gray-600">RUC: {company.tax_number}</p>
//                 <p className="text-gray-600">{company.address}</p>
//               </div>
//               <div>
//                 <p className="text-gray-600">Tel: {company.phone}</p>
//                 {company.email && (
//                   <p className="text-gray-600">Email: {company.email}</p>
//                 )}
//                 {company.legal_name && (
//                   <p className="text-gray-600">
//                     Razón Social: {company.legal_name}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Tabla de productos */}
//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>
//             Detalle de Productos ({sale.items.length} items)
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[100px]">Código</TableHead>
//                   <TableHead>Producto</TableHead>
//                   <TableHead className="w-[80px] text-center">Cant.</TableHead>
//                   <TableHead className="w-[100px] text-right">
//                     P. Unit.
//                   </TableHead>
//                   <TableHead className="w-[100px] text-right">Desc.</TableHead>
//                   <TableHead className="w-[100px] text-right">Total</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {sale.items.map((item) => (
//                   <TableRow key={item.id}>
//                     <TableCell className="font-mono text-xs">
//                       {item.code || 'N/A'}
//                     </TableCell>
//                     <TableCell>
//                       <div className="space-y-1">
//                         <p className="font-medium">
//                           {item.brand?.name} {item.description}
//                           {item.variant_name && ` - ${item.variant_name}`}
//                           {item.attributes && item.attributes.length > 0 && (
//                             <span className="text-gray-500">
//                               {' '}
//                               (
//                               {item.attributes
//                                 .map((attr) => attr.attribute_value)
//                                 .join(', ')}
//                               )
//                             </span>
//                           )}
//                         </p>
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-center">
//                       <span className="font-medium">{item.quantity}</span>
//                       <span className="text-sm text-gray-500 ml-1">
//                         {item.unit}
//                       </span>
//                     </TableCell>
//                     <TableCell className="text-right font-mono">
//                       {typeof item.unit_price === 'number' &&
//                       item.unit_price > 0
//                         ? formatCurrency(item.unit_price)
//                         : '-'}
//                     </TableCell>
//                     <TableCell className="text-right font-mono">
//                       {(item.discount_amount ?? 0) > 0 ? (
//                         <span className="text-red-600">
//                           -{formatCurrency(item.discount_amount ?? 0)}
//                         </span>
//                       ) : (
//                         <span className="text-gray-400">-</span>
//                       )}
//                     </TableCell>
//                     <TableCell className="text-right font-mono font-semibold">
//                       {formatCurrency(item.total_price ?? 0)}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>

//           {/* Resumen de totales */}
//           <div className="mt-6 pt-4 border-t">
//             <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
//               <div className="space-y-2 min-w-[250px]">
//                 <div className="flex justify-between text-sm">
//                   <span>Subtotal:</span>
//                   <span>
//                     {formatCurrency(sale.total_amount - sale.tax_amount)}
//                   </span>
//                 </div>
//                 {sale.discount_amount > 0 && (
//                   <div className="flex justify-between text-sm text-red-600">
//                     <span>Descuento:</span>
//                     <span>-{formatCurrency(sale.discount_amount)}</span>
//                   </div>
//                 )}
//                 {sale.tax_amount > 0 && (
//                   <div className="flex justify-between text-sm">
//                     <span>IGV (18%):</span>
//                     <span>{formatCurrency(sale.tax_amount)}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between font-bold text-lg border-t pt-2">
//                   <span>Total:</span>
//                   <span className="text-green-600">
//                     {formatCurrency(sale.total_amount)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Footer */}
//       <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
//         <p>Gracias por su compra</p>
//         <p className="mt-1">
//           Documento generado el {format(new Date(), 'PPPp', { locale: es })}
//         </p>
//       </div>
//     </div>
//   )
// }
