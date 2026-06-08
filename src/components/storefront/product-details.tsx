'use client'

import { useState } from 'react'
import { Package, ArrowLeft, ArrowUpRight, Phone, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
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

  const parseImages = (imagesField: any): string[] => {
    if (!imagesField) return []
    if (Array.isArray(imagesField)) {
      return imagesField.filter((img): img is string => typeof img === 'string' && img.trim() !== '')
    }
    if (typeof imagesField === 'string') {
      const trimmed = imagesField.trim()
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            return parsed.filter((img): img is string => typeof img === 'string' && img.trim() !== '')
          }
        } catch (e) { }
      }
      return trimmed.split(',').map(img => img.trim()).filter(img => img !== '')
    }
    return []
  }

  // Gather all unique images
  const allImages: string[] = []

  parseImages(product.images).forEach((img) => {
    if (img && !allImages.includes(img)) allImages.push(img)
  })

  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((v: any) => {
      parseImages(v.images).forEach((img) => {
        if (img && !allImages.includes(img)) allImages.push(img)
      })
    })
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const handleVariantSelect = (v: any) => {
    setSelectedVariant(v)
    const variantImages = parseImages(v.images)
    if (variantImages.length > 0) {
      const idx = allImages.indexOf(variantImages[0])
      if (idx !== -1) {
        setActiveImageIndex(idx)
      }
    }
  }

  const hasVariants = product.variants && product.variants.length > 0
  const currentPrice = selectedVariant ? (selectedVariant.price_unit || 0) : (product.price || 0)
  const currentStock = selectedVariant ? (selectedVariant.stock || 0) : (product.stock || 0)
  const isOutOfStock = currentStock <= 0

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Main Product Panel (AliExpress style) */}
        <div className="bg-background rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Left Column: Image Area */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50/50 flex items-center justify-center shadow-inner group relative">
              {allImages[activeImageIndex] ? (
                <img
                  src={allImages[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-300">
                  <Package className="w-16 h-16 stroke-[1.2]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sin imagen</span>
                </div>
              )}

              {/* Slider Arrows (only if more than 1 image) */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 hover:bg-background shadow flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 hover:bg-background shadow flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Selector Slider */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${activeImageIndex === idx
                      ? 'border-indigo-600 shadow-sm'
                      : 'border-slate-100 hover:border-slate-300'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Configuration */}
          <div className="w-full md:w-1/2 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                {product.brand?.name && (
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100/40">
                    {product.brand.name}
                  </span>
                )}
                <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-200 text-slate-600 bg-slate-50/50 px-2.5 py-1 rounded-lg">
                  Unidad: {product.unit || 'und'}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Price & Stock Status Box */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col gap-1 shadow-xs">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Precio de Venta
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">
                    {formatCurrency(currentPrice)}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/40 flex items-center">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${isOutOfStock
                    ? 'bg-red-50 text-red-600 border border-red-100/50'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                    }`}>
                    {isOutOfStock ? 'Agotado' : `Stock disponible: ${currentStock} unidades`}
                  </span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Descripción del Producto
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/30 p-3.5 rounded-xl border border-slate-100/50">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Variants Selector */}
              {hasVariants && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                          onClick={() => handleVariantSelect(v)}
                          className={`
                            text-xs px-4 py-3 rounded-2xl border transition-all text-left flex flex-col min-w-[130px]
                            ${isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold shadow-sm'
                              : variantOutOfStock
                                ? 'border-slate-100 bg-slate-50/30 text-slate-350 cursor-not-allowed opacity-40'
                                : 'border-slate-200 bg-background hover:border-slate-350 hover:bg-slate-50/30 text-slate-700 font-medium'
                            }
                          `}
                        >
                          <span className="font-semibold block truncate">{v.name}</span>
                          <span className="text-[10px] opacity-85 block mt-0.5 font-bold">
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
                  className="w-full rounded-2xl py-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-sm shadow-lg shadow-emerald-600/15 hover:shadow-emerald-600/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <a
                    href={`https://wa.me/${(business.contact_phone || '999999999').replace(/[^0-9]/g, '')
                      }?text=Hola,%20me%20interesa%20comprar%20el%20producto:%20*${encodeURIComponent(product.name)
                      }*${selectedVariant
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
                <Button disabled className="w-full rounded-2xl py-6 font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed">
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

                const pImages = parseImages(p.images)

                return (
                  <Card
                    key={p.id}
                    onClick={() => {
                      router.push(`/store/${business.slug}/product/${p.id}`)
                    }}
                    className="overflow-hidden border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col group cursor-pointer rounded-2xl bg-card hover:-translate-y-1 py-0"
                  >
                    <div className="h-44 w-full bg-slate-50 flex items-center justify-center relative overflow-hidden shrink-0 border-b border-slate-100/60">
                      {pImages.length > 0 ? (
                        <img
                          src={pImages[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-slate-350">
                          <Package className="h-8 w-8 stroke-[1.5]" />
                          <span className="text-[9px] uppercase font-semibold text-slate-450 tracking-wider">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </h3>
                        {p.description && (
                          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        )}
                      </div>
                      <div className="pt-2.5 border-t border-slate-100/80 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">
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
