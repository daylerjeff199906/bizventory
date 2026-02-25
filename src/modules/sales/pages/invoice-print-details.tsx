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
import { Copy, Share2, ShieldCheck, ChevronRight, Truck, Clock, CreditCard, Lock, CheckCircle2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

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

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
            return { text: 'Completado', icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, color: 'text-black' }
        case 'pending':
            return { text: 'Pendiente', icon: <Clock className="w-5 h-5 text-yellow-600" />, color: 'text-black' }
        case 'cancelled':
            return { text: 'Cancelado', icon: <Info className="w-5 h-5 text-red-600" />, color: 'text-black' }
        default:
            return { text: status, icon: <Info className="w-5 h-5" />, color: 'text-black' }
    }
}

export const InvoiceDetailPrint = ({ company: propCompany, sale }: InvoiceDetailProps) => {
    const company = propCompany || sale.business
    const saleDate = sale.date ? new Date(sale.date) : new Date()

    const formatDate = (date: Date) => {
        return format(date, 'd MMM yyyy', { locale: es })
    }

    const { text: statusText } = getStatusBadge(sale.status)

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount)
    }

    // Cálculos de montos calculados
    const totalDiscounts = sale.items.reduce((acc, item) => acc + (item.discount_amount || 0) * (item.quantity || 1), 0)
    const subtotal = sale.total_amount - (sale.tax_amount || 0)
    const itemsTotal = subtotal + totalDiscounts

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-background min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-foreground">{statusText}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                        <Lock className="h-4 w-4" />
                        <span>Todos los datos están protegidos</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                        <span>Fecha del pedido: {formatDate(saleDate)}</span>
                        <div className="flex items-center gap-2">
                            <span>ID del pedido: {sale.reference_number || sale.id}</span>
                            <button
                                onClick={() => copyToClipboard(sale.reference_number || sale.id)}
                                className="text-primary hover:underline flex items-center gap-1 border border-primary/20 bg-primary/5 px-2 py-0.5 rounded-full text-xs font-semibold"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        La confirmación del pedido se envió a <span className="text-foreground font-medium">{sale.customer?.person?.email || 'N/A'}</span>
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none border-primary/20 text-primary hover:bg-primary/5 rounded-full px-6">
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir
                    </Button>
                    <div className="hidden md:block">
                        <PDFGenerators company={company} sale={sale} />
                    </div>
                </div>
            </div>

            {/* Delivery Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-card p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Se envía a</h3>
                            <button disabled className="text-primary text-sm font-medium hover:underline flex items-center">
                                Cambiar dirección <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="font-bold uppercase mb-1">{sale.customer?.person?.name || 'Cliente Varios'}</p>
                        <p className="text-muted-foreground leading-relaxed uppercase">
                            {sale.shipping_address || 'Sin dirección registrada'}
                        </p>
                    </div>
                </div>

                <div className="bg-card p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Horario de entrega</h3>
                        <button className="text-primary text-sm font-medium hover:underline flex items-center">
                            Obtén actualizaciones <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-primary font-bold">Llegada rápida en un plazo de {Math.floor(Math.random() * 5) + 3} días hábiles</p>
                            <p className="text-sm text-muted-foreground mt-1">Estimada: {formatDate(new Date(saleDate.getTime() + 7 * 24 * 60 * 60 * 1000))}</p>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <Truck className="h-5 w-5" />
                            <span>Entrega garantizada</span>
                        </div>
                        <ul className="space-y-2">
                            {[
                                'Reembolso por 30 días sin actualizaciones',
                                'Devolución si el artículo está dañado',
                                'Reembolso por 70 días sin entrega'
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Products List & Sidebar Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                        <div className="p-1 sm:p-4 divide-y divide-border">
                            {sale.items.map((item, index) => (
                                <div key={index} className="py-6 flex flex-col sm:flex-row gap-6 first:pt-2 last:pb-2">
                                    <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden border">
                                        {item.images && item.images.length > 0 ? (
                                            <img
                                                src={item.images[0]}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <FileText className="h-10 w-10 opacity-30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <h4 className="font-medium text-sm sm:text-base leading-tight hover:text-primary transition-colors cursor-pointer line-clamp-2">
                                                {item.name}
                                            </h4>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-lg">{formatCurrency(item.unit_price ?? 0)}</p>
                                                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                                            {item.brand?.name ? item.brand.name : 'Vendido por Negocio'}
                                        </p>
                                        {item.attributes && item.attributes.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {item.attributes.map((attr, idx) => (
                                                    <Badge key={idx} variant="secondary" className="font-normal text-[10px] sm:text-xs">
                                                        {attr.attribute_type}: {attr.attribute_value}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-4 flex items-center gap-2 text-xs border rounded-md p-2 bg-muted/20 sm:w-fit">
                                            <Info className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-muted-foreground font-medium">Qué incluye</span>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto sm:ml-2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions (Desktop) / Status Card (Mobile) */}
                <div className="space-y-6">
                    <div className="bg-primary p-6 rounded-2xl text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-lg">Estado de envío</span>
                                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                                    {statusText}
                                </Badge>
                            </div>
                            <div className="p-3 bg-black/20 rounded-xl backdrop-blur-sm border border-white/10">
                                <p className="text-xs opacity-70 mb-1">Última actualización:</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <p className="font-bold text-sm">Pedido procesado con éxito</p>
                                </div>
                            </div>
                            <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-full py-6">
                                Rastrear pedido
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {[
                            'Comprar de nuevo',
                            'Ver recibo',
                            'Devolución/Reembolso',
                            'Ajuste de precios',
                            'Cambiar dirección'
                        ].map((action, i) => (
                            <Button key={i} variant="outline" className="w-full justify-center rounded-full border-muted-foreground/20 text-foreground font-medium hover:bg-muted/50 transition-all active:scale-95 py-6">
                                {action}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment & Summary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-card p-6 md:p-8 space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-xl">Detalles del pago</h3>
                        <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                            <Lock className="h-4 w-4" />
                            <span>Todos los datos están protegidos</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total del pedido:</p>
                        <p className="text-4xl font-black text-foreground">{formatCurrency(sale.total_amount)}</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-dashed">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total de artículos:</span>
                            <span className="font-medium">{formatCurrency(itemsTotal)}</span>
                        </div>
                        {totalDiscounts > 0 && (
                            <div className="flex justify-between text-sm text-destructive">
                                <span className="text-muted-foreground">Descuento de artículo(s):</span>
                                <span className="font-medium">-{formatCurrency(totalDiscounts)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium font-bold">{formatCurrency(subtotal)}</span>
                        </div>
                        <Separator className="my-1 opacity-50" />
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Envío:</span>
                            <span className="text-green-600 font-bold">GRATIS</span>
                        </div>
                        {sale.discount_amount > 0 && (
                            <div className="flex justify-between text-sm text-destructive font-semibold">
                                <span className="text-muted-foreground">Crédito/Descuento Especial:</span>
                                <span>-{formatCurrency(sale.discount_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-4 border-t">
                            <span>Total del pedido:</span>
                            <span>{formatCurrency(sale.total_amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-primary italic">
                            <span>Ahorraste:</span>
                            <span>-{formatCurrency(totalDiscounts + (sale.discount_amount || 0))}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/10 p-6 md:p-8 space-y-8">
                    <div className="space-y-4">
                        <h3 className="font-bold text-xl border-b pb-2">Método de pago</h3>
                        <div className="flex items-start gap-4 p-4 bg-card border rounded-xl shadow-sm">
                            <div className="w-12 h-8 bg-muted rounded flex items-center justify-center border">
                                <CreditCard className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1 flex-1">
                                <p className="font-bold capitalize text-sm">{sale.payment_method || 'Tarjeta bancaria'}</p>
                                <p className="text-xs text-muted-foreground">Pagado el {formatDate(saleDate)}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm">{formatCurrency(sale.total_amount)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Dirección de facturación:</h4>
                        <div className="text-sm space-y-1">
                            <p className="font-bold text-foreground">{sale.customer?.person?.name || 'Cliente Varios'}</p>
                            <p className="text-muted-foreground">{sale.customer?.person?.document_number ? `DOC: ${sale.customer.person.document_number}` : ''}</p>
                            <p className="text-muted-foreground">{sale.shipping_address || 'Sin dirección registrada'}</p>
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-dashed">
                        <div className="flex items-center gap-2 text-green-600 font-bold mb-4">
                            <CheckCircle2 className="h-5 w-5" />
                            <span>Certificación de seguridad</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                            {company?.name || 'Bizventory'} se compromete a proteger tu información de pago. Seguimos los estándares PCI DSS, utilizamos un encriptado sólido y realizamos revisiones periódicas del sistema para proteger tu privacidad.
                        </p>
                        <div className="flex flex-wrap gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                            {/* Simulated Security Logos */}
                            <div className="px-3 py-1 bg-white border rounded font-black text-[10px] text-blue-900 shadow-sm">VISA</div>
                            <div className="px-3 py-1 bg-white border rounded font-black text-[10px] text-orange-600 shadow-sm">MasterCard</div>
                            <div className="px-3 py-1 bg-white border rounded font-black text-[10px] text-blue-600 shadow-sm flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> PCI DSS
                            </div>
                            <div className="px-2 py-1 bg-white border rounded font-black text-[10px] text-green-700 shadow-sm">SSL SECURE</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex md:hidden justify-center pb-8 pt-4 border-t">
                <PDFGenerators company={company} sale={sale} />
            </div>
        </div>
    )
}
