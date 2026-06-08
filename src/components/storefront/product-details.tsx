'use client'

import { useState } from 'react'
import { Package, ArrowLeft, ArrowUpRight, Phone, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ProductDetailsProps {
  product: any
  business: any
  relatedProducts: any[]
}

export default function ProductDetails({ product, business, relatedProducts }: ProductDetailsProps) {
  const router = useRouter()
  const [selectedVariant, setSelectedVariant] = useState<any | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const hasVariants = product.variants && product.variants.length > 0
  const currentPrice = selectedVariant ? (selectedVariant.price_unit || 0) : (product.price || 0)
  const currentStock = selectedVariant ? (selectedVariant.stock || 0) : (product.stock || 0)
  const isOutOfStock = currentStock <= 0

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" className="gap-1.5 text-xs font-semibold rounded-xl" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>

          <Link href={`/store/${business.slug}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xs text-slate-500 font-medium">Tienda:</span>
            <span className="text-sm font-bold text-slate-900">{business.business_name}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Main Product Panel (AliExpress style) */}
        <div className="bg-background rounded-2xl border shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Left Column: Image Area */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="w-full aspect-square rounded-2xl overflow-hidden border bg-slate-50 flex items-center justify-center shadow-xs">
              {(selectedVariant?.images && selectedVariant.images.length > 0) ? (
                <img
                  src={selectedVariant.images[0]}
                  alt={selectedVariant.name}
                  className="w-full h-full object-cover"
                />
              ) : (product.images && product.images.length > 0) ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-24 h-24 text-slate-300" />
              )}
            </div>
          </div>

          {/* Right Column: Details & Configuration */}
          <div className="w-full md:w-1/2 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {product.brand?.name && (
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                    {product.brand.name}
                  </span>
                )}
                <Badge variant="outline" className="text-[10px] uppercase font-bold border-indigo-100 text-indigo-700 bg-indigo-50/30">
                  {product.unit || 'und'}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Price & Stock Status Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
                  Precio de Venta
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {formatCurrency(currentPrice)}
                  </span>
                </div>
                <span className={`text-xs font-medium mt-2 block ${isOutOfStock ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                  {isOutOfStock ? 'Agotado' : `Stock disponible: ${currentStock} unidades`}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Descripción del Producto
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Variants Selector */}
              {hasVariants && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Selecciona una Opción:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v: any) => {
                      const isSelected = selectedVariant?.id === v.id
                      const variantOutOfStock = !v.stock || v.stock <= 0
                      return (
                        <button
                          key={v.id}
                          disabled={variantOutOfStock}
                          onClick={() => setSelectedVariant(v)}
                          className={`
                            text-xs px-3 py-2.5 rounded-xl border transition-all text-left flex flex-col min-w-[120px]
                            ${isSelected 
                              ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-semibold shadow-xs' 
                              : variantOutOfStock 
                                ? 'border-slate-100 bg-slate-50/50 text-slate-400 cursor-not-allowed opacity-50' 
                                : 'border-slate-200 bg-background hover:border-slate-300 text-slate-700'
                            }
                          `}
                        >
                          <span className="font-semibold block truncate">{v.name}</span>
                          <span className="text-[10px] opacity-80 block mt-0.5">
                            {formatCurrency(v.price_unit || 0)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Buy Action / WhatsApp */}
            <div className="pt-6 border-t border-slate-100">
              {!isOutOfStock ? (
                <Button
                  asChild
                  className="w-full rounded-xl py-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-sm shadow-lg shadow-indigo-600/15"
                >
                  <a
                    href={`https://wa.me/${
                      (business.contact_phone || '999999999').replace(/[^0-9]/g, '')
                    }?text=Hola,%20me%20interesa%20comprar%20el%20producto:%20*${
                      encodeURIComponent(product.name)
                    }*${
                      selectedVariant 
                        ? `%20en%20la%20opción%20*${encodeURIComponent(selectedVariant.name)}*` 
                        : ''
                    }.`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Realizar Compra por WhatsApp
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </Button>
              ) : (
                <Button disabled className="w-full rounded-xl py-6 font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed">
                  Producto Agotado
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Other Products Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Otros productos de la tienda
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const pHasVariants = p.variants && p.variants.length > 0
                const pPrice = pHasVariants 
                  ? Math.min(...p.variants.map((v: any) => v.price_unit || 0))
                  : (p.price || 0)

                return (
                  <Card
                    key={p.id}
                    onClick={() => {
                      router.push(`/store/${business.slug}/product/${p.id}`)
                    }}
                    className="overflow-hidden border border-slate-100 hover:shadow-xl hover:border-slate-200/80 transition-all flex flex-col group cursor-pointer"
                  >
                    <div className="h-40 w-full bg-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
                      {p.images && p.images.length > 0 ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-slate-300" />
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xs text-slate-800 line-clamp-1 mb-1">
                          {p.name}
                        </h3>
                        {p.description && (
                          <p className="text-slate-500 text-[10px] line-clamp-2 leading-relaxed mb-3">
                            {p.description}
                          </p>
                        )}
                      </div>
                      <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">
                          {formatCurrency(pPrice)}
                        </span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
