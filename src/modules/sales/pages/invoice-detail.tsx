// import { Card, CardContent } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table'
// import { Building2, FileText, MapPin } from 'lucide-react'
// import { CompanyInfo } from '@/types/core/company-info'
// import { SaleWithItems } from '@/apis/app/sales'

// interface InvoiceDetailProps {
//   company: CompanyInfo
//   sale: SaleWithItems
// }

// export const InvoiceDetail = ({ company, sale }: InvoiceDetailProps) => {
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
//     return new Date(dateString).toLocaleDateString('es-ES', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//   }

//   const formatCurrency = (amount: number) => {
//     return `S/ ${amount.toFixed(2)}`
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-8 bg-white">
//       {/* Header de la factura */}
//       <div className="mb-8">
//         <div className="flex items-start justify-between mb-6">
//           <div className="flex items-center gap-4">
//             {company.logo_url && (
//               <img
//                 src={company.logo_url || '/placeholder.svg'}
//                 alt={`Logo de ${company.name}`}
//                 className="w-16 h-16 object-contain rounded-md"
//               />
//             )}
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {company.name}
//               </h1>
//               <p className="text-gray-600">{company.legal_name}</p>
//             </div>
//           </div>
//           <div className="text-right">
//             <div className="flex items-center gap-2 mb-2">
//               <FileText className="h-5 w-5 text-gray-500" />
//               <span className="text-lg font-semibold">FACTURA</span>
//             </div>
//             <Badge className={`rounded-md ${getStatusColor(sale.status)}`}>
//               {getStatusText(sale.status)}
//             </Badge>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
//           <div className="grid grid-cols-1 gap-4 border p-4 rounded-md bg-gray-50">
//             <div className="flex items-start gap-2">
//               <Building2 className="h-4 w-4 text-gray-500 mt-0.5" />
//               <div className="grid grid-cols-1 gap-2">
//                 <p className="font-medium text-gray-900">
//                   Información de la Empresa
//                 </p>
//                 <p className="text-gray-600">RUC: {company.tax_number}</p>
//                 <p className="text-gray-600">{company.address}</p>
//                 <p className="text-gray-600">Tel: {company.phone}</p>
//                 {company.email && (
//                   <p className="text-gray-600">{company.email}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 gap-4 border p-4 rounded-md bg-gray-50">
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <p className="text-gray-500">Número de Factura</p>
//                 <p className="font-semibold">{sale.reference_number}</p>
//               </div>
//               <div>
//                 <p className="text-gray-500">Fecha</p>
//                 <p className="font-semibold">{formatDate(sale.date)}</p>
//               </div>
//               <div>
//                 <p className="text-gray-500">Método de Pago</p>
//                 <p className="font-semibold capitalize">
//                   {sale.payment_method}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-gray-500">Total de Items</p>
//                 <p className="font-semibold">{sale.total_items}</p>
//               </div>
//             </div>

//             {sale.shipping_address && (
//               <div className="flex items-start gap-2">
//                 <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
//                 <div>
//                   <p className="font-medium text-gray-900">
//                     Dirección de Envío
//                   </p>
//                   <p className="text-gray-600">{sale.shipping_address}</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <Separator className="my-6" />

//       {/* Tabla de productos */}
//       <div className="mb-8">
//         <h2 className="text-lg font-semibold mb-4">Detalle de Productos</h2>
//         <div className="border rounded-md overflow-hidden">
//           <Table>
//             <TableHeader className="bg-gray-50">
//               <TableRow>
//                 <TableHead className="font-semibold">Código</TableHead>
//                 <TableHead className="font-semibold">Producto</TableHead>
//                 <TableHead className="font-semibold text-center">
//                   Cantidad
//                 </TableHead>
//                 <TableHead className="font-semibold text-right">
//                   Precio Unit.
//                 </TableHead>
//                 <TableHead className="font-semibold text-right">
//                   Descuento
//                 </TableHead>
//                 <TableHead className="font-semibold text-right">
//                   Total
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {sale.items.map((item) => (
//                 <TableRow key={item.id} className="border-b">
//                   <TableCell className="font-mono text-sm">
//                     {item.code}
//                   </TableCell>
//                   <TableCell>
//                     <div className="space-y-1">
//                       <p className="font-medium">
//                         {item.brand?.name}
//                         {item.description}
//                         {item.variant_name}
//                         {item?.attributes && item.attributes.length > 0 && (
//                           <>
//                             {item.attributes
//                               .map((attr) => `${attr.attribute_value}`)
//                               .join(', ')}
//                           </>
//                         )}
//                       </p>
//                     </div>
//                   </TableCell>
//                   <TableCell className="text-center">
//                     <span className="font-medium">{item.quantity}</span>
//                     <span className="text-sm text-gray-500 ml-1">
//                       {item.unit}
//                     </span>
//                   </TableCell>
//                   <TableCell className="text-right font-mono">
//                     {item?.unit_price && item.unit_price > 0
//                       ? formatCurrency(item.unit_price)
//                       : '-'}
//                   </TableCell>
//                   <TableCell className="text-right font-mono">
//                     {item.discount_amount && item.discount_amount > 0
//                       ? `-${formatCurrency(item.discount_amount)}`
//                       : '-'}
//                   </TableCell>
//                   <TableCell className="text-right font-mono font-semibold">
//                     {item?.total_price && item.total_price > 0
//                       ? formatCurrency(item.total_price)
//                       : '-'}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </div>

//       {/* Resumen de totales */}
//       <div className="flex justify-end">
//         <div className="w-full max-w-sm">
//           <Card className="rounded-md">
//             <CardContent className="p-6">
//               <div className="space-y-3">
//                 <div className="flex justify-between text-sm">
//                   <span>Subtotal:</span>
//                   <span className="font-mono">
//                     {formatCurrency(sale.total_amount - sale.tax_amount)}
//                   </span>
//                 </div>

//                 {sale.discount_amount > 0 && (
//                   <div className="flex justify-between text-sm text-green-600">
//                     <span>Descuentos:</span>
//                     <span className="font-mono">
//                       -{formatCurrency(sale.discount_amount)}
//                     </span>
//                   </div>
//                 )}

//                 {sale.tax_amount > 0 && (
//                   <div className="flex justify-between text-sm">
//                     <span>IGV (18%):</span>
//                     <span className="font-mono">
//                       {formatCurrency(sale.tax_amount)}
//                     </span>
//                   </div>
//                 )}

//                 <Separator />

//                 <div className="flex justify-between text-lg font-bold">
//                   <span>Total:</span>
//                   <span className="font-mono">
//                     {formatCurrency(sale.total_amount)}
//                   </span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
//         <p>Gracias por su compra</p>
//         <p className="mt-1">
//           Factura generada el {formatDate(sale.created_at)}
//         </p>
//       </div>
//     </div>
//   )
// }
