import { getBusinessBySlug, getStorefrontProducts } from '@/apis/app/business'
import { notFound } from 'next/navigation'
import { Package, Phone, Mail, MapPin, ShoppingBag, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Catalog from '@/components/storefront/catalog'

interface Props {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    q?: string
    page?: string
  }>
}

export default async function StorefrontPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sParams = await searchParams
  const currentSearch = sParams.q || ''
  const currentPage = parseInt(sParams.page || '1') || 1

  const business = await getBusinessBySlug(slug)

  if (!business || !business.is_public) {
    notFound()
  }

  const { data: products, totalPages } = await getStorefrontProducts({
    businessId: business.id!,
    page: currentPage,
    pageSize: 12,
    search: currentSearch
  })

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
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
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
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          Catálogo de Productos
        </h2>

        <Catalog
          products={products}
          totalPages={totalPages}
          currentPage={currentPage}
          currentSearch={currentSearch}
          storeSlug={slug}
        />
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
