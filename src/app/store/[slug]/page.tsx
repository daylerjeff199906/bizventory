import { getBusinessBySlug, getStorefrontProducts } from '@/apis/app/business'
import { notFound } from 'next/navigation'
import { Package, Phone, Mail, MapPin, Search, ShoppingBag, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  params: Promise<{
    slug: string
  }>
}

export default async function StorefrontPage({ params }: Props) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)

  if (!business || !business.is_public) {
    notFound()
  }

  const products = await getStorefrontProducts(business.id!)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans pb-12">
      {/* Cover Image & Store Header */}
      <div className="relative w-full h-48 md:h-72 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        {business.cover_image_url ? (
          <img
            src={business.cover_image_url}
            alt={business.business_name || 'Portada'}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700 via-indigo-800 to-slate-900 opacity-60" />
        )}
      </div>

      {/* Profile & Store Info Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 md:-mt-24 relative z-10">
        <div className="bg-background rounded-2xl border shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Logo/Avatar */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-background overflow-hidden bg-muted shadow-lg shrink-0">
              {business.brand ? (
                <img
                  src={business.brand}
                  alt={business.business_name || 'Logo'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600">
                  <ShoppingBag className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {business.business_name}
                </h1>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold uppercase tracking-wider text-[10px]">
                  Tienda Oficial
                </Badge>
              </div>
              {business.description && (
                <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                  {business.description}
                </p>
              )}

              {/* Contact / Location Row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-slate-500 font-medium">
                {business.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {business.address}
                  </span>
                )}
                {business.contact_phone && (
                  <a href={`tel:${business.contact_phone}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {business.contact_phone}
                  </a>
                )}
                {business.business_email && (
                  <a href={`mailto:${business.business_email}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {business.business_email}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {business.contact_phone && (
            <Button asChild size="lg" className="rounded-xl shadow-lg shadow-indigo-600/15 font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full md:w-auto">
              <a
                href={`https://wa.me/${business.contact_phone.replace(/[^0-9]/g, '')}?text=Hola,%20me%20interesa%20comprar%20algunos%20de%20sus%20productos.`}
                target="_blank"
                rel="noreferrer"
              >
                Contactar por WhatsApp
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Main Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10 flex-1">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          Catálogo de Productos
        </h2>

        {products.length === 0 ? (
          <div className="bg-background rounded-2xl border border-dashed p-12 text-center max-w-md mx-auto mt-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 text-base mb-1">Catálogo vacío</h3>
            <p className="text-slate-500 text-xs">Esta tienda no tiene productos activos registrados actualmente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => {
              const hasVariants = product.variants && product.variants.length > 0
              const isOutOfStock = !hasVariants && (!product.stock || product.stock <= 0)
              
              return (
                <Card key={product.id} className="overflow-hidden border border-slate-100 hover:shadow-xl hover:border-slate-200/80 transition-all flex flex-col group h-full">
                  {/* Image Area */}
                  <div className="h-48 w-full bg-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-slate-300" />
                    )}

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full uppercase shadow-md">
                          Agotado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info Area */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {product.brand?.name && (
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                          {product.brand.name}
                        </span>
                      )}
                      <h3 className="font-bold text-sm text-slate-800 line-clamp-1 mb-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-50">
                      {/* If has variants, display variants */}
                      {hasVariants ? (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Opciones Disponibles:
                          </span>
                          <div className="grid gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                            {product.variants.map((v: any) => {
                              const variantOutOfStock = !v.stock || v.stock <= 0
                              return (
                                <div key={v.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-colors">
                                  <div className="min-w-0">
                                    <span className="font-semibold text-slate-700 block truncate">
                                      {v.name}
                                    </span>
                                    {v.attributes && v.attributes.length > 0 && (
                                      <span className="text-[10px] text-slate-400 block truncate">
                                        {v.attributes.map((a: any) => a.attribute_value).join(' / ')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-bold text-slate-900 block">
                                      {formatCurrency(v.price_unit || 0)}
                                    </span>
                                    <span className={`text-[9px] font-medium block ${variantOutOfStock ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                                      {variantOutOfStock ? 'Sin stock' : `Stock: ${v.stock}`}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                              Precio
                            </span>
                            <span className="font-extrabold text-base text-slate-900">
                              {formatCurrency(product.price || 0)}
                            </span>
                          </div>
                          {!isOutOfStock && (
                            <span className="text-[10px] font-medium text-slate-400">
                              Stock: {product.stock} {product.unit || 'und'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Map location if present */}
      {business.map_iframe_url && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            Ubicación del Negocio
          </h2>
          <div 
            className="w-full h-80 rounded-2xl overflow-hidden border shadow-sm"
            dangerouslySetInnerHTML={{ __html: business.map_iframe_url }}
          />
        </div>
      )}
    </div>
  )
}
