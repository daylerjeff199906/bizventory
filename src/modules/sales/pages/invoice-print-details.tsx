'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { FileText, MapPin, Download, Info, Building2, User } from 'lucide-react'
import { CompanyInfo } from '@/types/core/company-info'
import { SaleWithItems } from '@/apis/app/sales'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
    PDFDownloadLink,
    Document,
    Page,
    Text,
    View,
    StyleSheet
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { numberToWords } from '@/utils/number-to-words'

interface InvoiceDetailProps {
    company?: CompanyInfo | null
    sale: SaleWithItems
}

// Estilos para el PDF de comprobante
const InvoiceStyles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica'
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
    clientInfo: {
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
    col2: { width: '40%' },
    col3: { width: '15%' },
    col4: { width: '15%' },
    col5: { width: '20%' },
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

// Estilos para el PDF de ticket (Ajustado para 80mm)
const TicketStyles = StyleSheet.create({
    page: {
        padding: 10,
        fontSize: 8,
        fontFamily: 'Helvetica'
    },
    header: {
        marginBottom: 8,
        borderBottom: 1,
        borderBottomColor: '#000000',
        paddingBottom: 5,
        textAlign: 'center'
    },
    title: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 3
    },
    companyName: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 2
    },
    companyInfo: {
        fontSize: 7,
        marginBottom: 1
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 2
    },
    label: {
        fontWeight: 'bold',
        width: 50
    },
    value: {
        flex: 1
    },
    table: {
        marginVertical: 5,
        borderBottom: 1,
        borderBottomStyle: 'dashed',
        paddingBottom: 5
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottom: 1,
        borderBottomStyle: 'dashed',
        paddingBottom: 2,
        marginBottom: 2,
        fontWeight: 'bold'
    },
    tableRow: {
        flexDirection: 'row',
        marginBottom: 2
    },
    col1: { width: '15%' },
    col2: { width: '55%' },
    col3: { width: '30%', textAlign: 'right' },
    totalsRow: {
        flexDirection: 'row',
        marginTop: 2,
        justifyContent: 'flex-end'
    },
    totalLabel: {
        width: 80,
        textAlign: 'right',
        marginRight: 5,
        fontWeight: 'bold'
    },
    totalValue: {
        width: 40,
        textAlign: 'right'
    },
    grandTotal: {
        marginTop: 3,
        paddingTop: 3,
        borderTop: 1,
        borderTopStyle: 'dashed',
        fontSize: 9,
        fontWeight: 'bold'
    },
    footer: {
        marginTop: 10,
        paddingTop: 5,
        textAlign: 'center',
        fontSize: 6
    }
})

// Componente PDF de comprobante (A4)
const InvoicePDF = ({
    company,
    sale
}: {
    company: any
    sale: SaleWithItems
}) => {
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
        } catch {
            return dateString
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount)
    }

    return (
        <Document>
            <Page size="A4" style={InvoiceStyles.page}>
                <View style={InvoiceStyles.header}>
                    <Text style={InvoiceStyles.title}>COMPROBANTE DE VENTA</Text>
                    <Text style={InvoiceStyles.title}>{sale.reference_number}</Text>
                    <View style={InvoiceStyles.companyInfo}>
                        <View style={InvoiceStyles.infoRow}>
                            <Text style={InvoiceStyles.label}>Empresa:</Text>
                            <Text style={InvoiceStyles.value}>{company?.business_name || company?.name || 'N/A'}</Text>
                        </View>
                        <View style={InvoiceStyles.infoRow}>
                            <Text style={InvoiceStyles.label}>RUC/Doc:</Text>
                            <Text style={InvoiceStyles.value}>{company?.document_number || company?.tax_number || 'N/A'}</Text>
                        </View>
                        <View style={InvoiceStyles.infoRow}>
                            <Text style={InvoiceStyles.label}>Dirección:</Text>
                            <Text style={InvoiceStyles.value}>{company?.address || 'N/A'}</Text>
                        </View>
                        <View style={InvoiceStyles.infoRow}>
                            <Text style={InvoiceStyles.label}>Teléfono:</Text>
                            <Text style={InvoiceStyles.value}>{company?.contact_phone || company?.phone || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                <View style={InvoiceStyles.clientInfo}>
                    <Text style={InvoiceStyles.sectionTitle}>INFORMACIÓN DEL CLIENTE</Text>
                    <View style={InvoiceStyles.infoRow}>
                        <Text style={InvoiceStyles.label}>Cliente:</Text>
                        <Text style={InvoiceStyles.value}>{sale.customer?.person?.name || 'Cliente Varios'}</Text>
                    </View>
                    <View style={InvoiceStyles.infoRow}>
                        <Text style={InvoiceStyles.label}>DNI/RUC:</Text>
                        <Text style={InvoiceStyles.value}>{sale.customer?.person?.document_number || 'N/A'}</Text>
                    </View>
                    <View style={InvoiceStyles.infoRow}>
                        <Text style={InvoiceStyles.label}>Teléfono:</Text>
                        <Text style={InvoiceStyles.value}>{sale.customer?.person?.whatsapp || 'N/A'}</Text>
                    </View>
                    <View style={InvoiceStyles.infoRow}>
                        <Text style={InvoiceStyles.label}>Email:</Text>
                        <Text style={InvoiceStyles.value}>{sale.customer?.person?.email || 'N/A'}</Text>
                    </View>
                    <View style={InvoiceStyles.infoRow}>
                        <Text style={InvoiceStyles.label}>Fecha:</Text>
                        <Text style={InvoiceStyles.value}>{formatDate(sale.date)}</Text>
                    </View>
                </View>

                <View style={InvoiceStyles.table}>
                    <View style={InvoiceStyles.tableHeader}>
                        <Text style={InvoiceStyles.col1}>Cant.</Text>
                        <Text style={InvoiceStyles.col2}>Descripción</Text>
                        <Text style={InvoiceStyles.col3}>P. Unit.</Text>
                        <Text style={InvoiceStyles.col4}>Desc.</Text>
                        <Text style={InvoiceStyles.col5}>Total</Text>
                    </View>
                    {sale.items.map((item, index) => (
                        <View key={index} style={InvoiceStyles.tableRow}>
                            <Text style={InvoiceStyles.col1}>{item.quantity}</Text>
                            <View style={InvoiceStyles.col2}>
                                <Text>{item.name}</Text>
                                {item.attributes && item.attributes.length > 0 && (
                                    <Text style={{ fontSize: 7, color: '#666' }}>
                                        {item.attributes.map(attr => `${attr.attribute_type}: ${attr.attribute_value}`).join(', ')}
                                    </Text>
                                )}
                            </View>
                            <Text style={InvoiceStyles.col3}>{formatCurrency(item.unit_price ?? 0)}</Text>
                            <Text style={InvoiceStyles.col4}>{item.discount_amount ? `-${formatCurrency(item.discount_amount)}` : '-'}</Text>
                            <Text style={InvoiceStyles.col5}>{formatCurrency(item.total_price ?? 0)}</Text>
                        </View>
                    ))}
                </View>

                <View style={InvoiceStyles.totalsSection}>
                    <View style={InvoiceStyles.totalRow}>
                        <Text style={InvoiceStyles.totalLabel}>Subtotal:</Text>
                        <Text style={InvoiceStyles.totalValue}>{formatCurrency(sale.total_amount - (sale.tax_amount || 0))}</Text>
                    </View>
                    {sale.tax_amount > 0 && (
                        <View style={InvoiceStyles.totalRow}>
                            <Text style={InvoiceStyles.totalLabel}>IGV:</Text>
                            <Text style={InvoiceStyles.totalValue}>{formatCurrency(sale.tax_amount)}</Text>
                        </View>
                    )}
                    <View style={[InvoiceStyles.totalRow, InvoiceStyles.finalTotal]}>
                        <Text style={InvoiceStyles.totalLabel}>TOTAL:</Text>
                        <Text style={InvoiceStyles.totalValue}>{formatCurrency(sale.total_amount)}</Text>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 9, fontStyle: 'italic' }}>{numberToWords(sale.total_amount)}</Text>
                    </View>
                </View>

                <View style={InvoiceStyles.footer}>
                    <Text>Gracias por su compra. Generado en Bizventory.</Text>
                </View>
            </Page>
        </Document>
    )
}

// Componente PDF de ticket (80mm / 3.125in)
const TicketPDF = ({
    company,
    sale
}: {
    company: any
    sale: SaleWithItems
}) => {
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
        } catch {
            return dateString
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount)
    }

    return (
        <Document>
            <Page size={[226, 842]} style={TicketStyles.page}>
                <View style={TicketStyles.header}>
                    <Text style={TicketStyles.companyName}>{company?.business_name || company?.name}</Text>
                    <Text style={TicketStyles.companyInfo}>RUC: {company?.document_number || company?.tax_number}</Text>
                    <Text style={TicketStyles.title}>TICKET DE VENTA</Text>
                    <Text style={TicketStyles.companyInfo}>N°: {sale.reference_number}</Text>
                    <Text style={TicketStyles.companyInfo}>{formatDate(sale.date)}</Text>
                </View>

                <View style={TicketStyles.table}>
                    <View style={TicketStyles.tableHeader}>
                        <Text style={TicketStyles.col1}>Cnt</Text>
                        <Text style={TicketStyles.col2}>Descr.</Text>
                        <Text style={TicketStyles.col3}>Tot.</Text>
                    </View>
                    {sale.items.map((item, index) => (
                        <View key={index} style={TicketStyles.tableRow}>
                            <Text style={TicketStyles.col1}>{item.quantity}</Text>
                            <View style={TicketStyles.col2}>
                                <Text>{item.name}</Text>
                                {item.attributes && item.attributes.length > 0 && (
                                    <Text style={{ fontSize: 6, color: '#666' }}>
                                        {item.attributes.map(attr => `${attr.attribute_value}`).join(', ')}
                                    </Text>
                                )}
                            </View>
                            <Text style={TicketStyles.col3}>{formatCurrency(item.total_price ?? 0)}</Text>
                        </View>
                    ))}
                </View>

                <View>
                    <View style={TicketStyles.totalsRow}>
                        <Text style={TicketStyles.totalLabel}>TOTAL:</Text>
                        <Text style={TicketStyles.totalValue}>{formatCurrency(sale.total_amount)}</Text>
                    </View>
                </View>

                <View style={TicketStyles.footer}>
                    <Text>Gracias por su preferencia</Text>
                </View>
            </Page>
        </Document>
    )
}

const PDFGenerators = ({
    company,
    sale
}: {
    company: any
    sale: SaleWithItems
}) => {
    const fileName = `venta-${sale.reference_number || sale.id}`

    return (
        <div className="flex flex-wrap gap-2">
            <PDFDownloadLink
                document={<TicketPDF company={company} sale={sale} />}
                fileName={`${fileName}-ticket.pdf`}
            >
                {({ loading }: { loading: boolean }) => (
                    <Button variant="outline" size="sm" disabled={loading}>
                        <Download className="h-4 w-4 mr-2" />
                        {loading ? 'Generando...' : 'Ticket (80mm)'}
                    </Button>
                )}
            </PDFDownloadLink>

            <PDFDownloadLink
                document={<InvoicePDF company={company} sale={sale} />}
                fileName={`${fileName}-comprobante.pdf`}
            >
                {({ loading }: { loading: boolean }) => (
                    <Button size="sm" disabled={loading}>
                        <FileText className="h-4 w-4 mr-2" />
                        {loading ? 'Generando...' : 'Comprobante A4'}
                    </Button>
                )}
            </PDFDownloadLink>
        </div>
    )
}

export const InvoiceDetailPrint = ({ company: propCompany, sale }: InvoiceDetailProps) => {
    const company = propCompany || sale.business

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'Completado'
            case 'pending':
                return 'Pendiente'
            case 'cancelled':
                return 'Cancelado'
            default:
                return status
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount)
    }

    const saleDate = sale.date ? new Date(sale.date) : new Date()

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        Detalle de Venta
                    </h1>
                    <p className="text-muted-foreground">#{sale.reference_number}</p>
                </div>
                <PDFGenerators company={company} sale={sale} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Fecha</p>
                            <p className="font-medium">{format(saleDate, 'dd/MM/yyyy')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Estado</p>
                            <Badge className={getStatusColor(sale.status)} variant="outline">
                                {getStatusText(sale.status)}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Método de Pago</p>
                            <p className="font-medium capitalize">{sale.payment_method || 'No especificado'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Items</p>
                            <p className="font-medium">{sale.total_items}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="font-bold">{sale.customer?.person?.name || 'Cliente Varios'}</p>
                        <div className="text-sm space-y-1">
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="font-medium text-foreground">DNI/RUC:</span> {sale.customer?.person?.document_number || 'N/A'}
                            </p>
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="font-medium text-foreground">Teléfono:</span> {sale.customer?.person?.whatsapp || 'N/A'}
                            </p>
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="font-medium text-foreground">Email:</span> {sale.customer?.person?.email || 'N/A'}
                            </p>
                        </div>
                        {sale.shipping_address && (
                            <div className="mt-2 text-sm flex items-start gap-1">
                                <MapPin className="h-3 w-3 mt-1" />
                                <span>{sale.shipping_address}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-lg">Productos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">Cod.</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-center">Cant.</TableHead>
                                    <TableHead className="text-right">Precio</TableHead>
                                    <TableHead className="text-right">Descuento</TableHead>
                                    <TableHead className="text-right font-bold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sale.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.code}</TableCell>
                                        <TableCell>
                                            <p className="font-medium">{item.name}</p>
                                            {item.variant_name && (
                                                <p className="text-xs text-muted-foreground italic">{item.variant_name}</p>
                                            )}
                                            {item.attributes && item.attributes.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {item.attributes.map((attr, idx) => (
                                                        <span key={idx} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                            {attr.attribute_type}: {attr.attribute_value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.unit_price ?? 0)}</TableCell>
                                        <TableCell className="text-right text-red-600">
                                            {item.discount_amount ? `-${formatCurrency(item.discount_amount)}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(item.total_price ?? 0)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="mt-6 flex justify-end">
                            <div className="w-full md:w-64 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(sale.total_amount - (sale.tax_amount || 0))}</span>
                                </div>
                                {sale.tax_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Impuestos (IGV)</span>
                                        <span>{formatCurrency(sale.tax_amount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold border-t pt-2">
                                    <span>Total</span>
                                    <span className="text-primary">{formatCurrency(sale.total_amount)}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground italic mt-2">
                                        {numberToWords(sale.total_amount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Datos del Negocio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="font-bold">{company?.business_name || company?.name}</p>
                            <p className="text-sm text-muted-foreground">Documento: {company?.document_number || company?.tax_number}</p>
                        </div>
                        <div className="text-sm">
                            <p>{company?.address}</p>
                            <p>Telf: {company?.contact_phone || company?.phone}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Este comprobante es para uso informativo. Puede descargar la versión en PDF para impresión profesional.
                </AlertDescription>
            </Alert>
        </div>
    )
}
