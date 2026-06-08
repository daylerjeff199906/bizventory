'use client'

import { useState } from 'react'
import { Package, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

interface CatalogProps {
  products: any[]
  totalPages: number
  currentPage: number
  currentSearch: string
  isGeneralMarketplace?: boolean
  storeSlug?: string
  showSearch?: boolean
}

export default function Catalog({
  products,
  totalPages,
  currentPage,
  currentSearch,
  isGeneralMarketplace = false,
  storeSlug,
  showSearch = true
}: CatalogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(currentSearch)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    
    if (pathname === '/') {
      router.push(`/search?${params.toString()}`)
    } else {
      router.push(`${pathname}?${params.toString()}`)
    }
  }, 400)

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
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
        } catch (e) {}
      }
      return trimmed.split(',').map(img => img.trim()).filter(img => img !== '')
    }
    return []
  }

  const getProductDetailUrl = (product: any) => {
    const slug = storeSlug || product.business?.slug || product.brand?.business?.slug || 'unknown'
    return `/store/${slug}/product/${product.id}`
  }

  return (
    <div className="space-y-6">
      {showSearch && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos por nombre o descripción..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                debouncedSearch(e.target.value)
              }}
              className="w-full pl-10 pr-4 py-2 bg-background border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
            />
          </div>
          {isGeneralMarketplace && (
            <Button 
              onClick={() => router.push('/search')}
              variant="outline" 
              className="rounded-xl border-slate-250 text-xs font-semibold hover:bg-slate-50 shrink-0 w-full sm:w-auto text-slate-700 bg-background"
            >
              Ver todos los productos
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {products.length === 0 ? (
        <div className="bg-background rounded-2xl border border-dashed p-12 text-center max-w-md mx-auto mt-8">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 text-sm mb-1">Sin resultados</h3>
          <p className="text-slate-500 text-xs">No se encontraron productos en esta página.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const hasVariants = product.variants && product.variants.length > 0
            const displayPrice = hasVariants
              ? Math.min(...product.variants.map((v: any) => v.price_unit || 0))
              : (product.price || 0)
            const isOutOfStock = !hasVariants && (!product.stock || product.stock <= 0)
            const productImages = parseImages(product.images)

            return (
              <Card
                key={product.id}
                onClick={() => router.push(getProductDetailUrl(product))}
                className="overflow-hidden border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col group h-full cursor-pointer rounded-2xl bg-card hover:-translate-y-1 py-0"
              >
                {/* Image Area */}
                <div className="h-52 w-full bg-slate-50 flex items-center justify-center relative overflow-hidden shrink-0 border-b border-slate-100/60">
                  {productImages.length > 0 ? (
                    <img
                      src={productImages[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <Package className="h-10 w-10 stroke-[1.5]" />
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Sin imagen</span>
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1.5px] flex items-center justify-center">
                      <span className="bg-red-500 text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase shadow-md animate-pulse">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Area */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    {product.brand?.name && (
                      <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest block">
                        {product.brand.name}
                      </span>
                    )}
                    <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100/80 flex items-end justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">
                        {hasVariants ? 'Desde' : 'Precio'}
                      </span>
                      <span className="font-bold text-base text-slate-900">
                        {formatCurrency(displayPrice)}
                      </span>
                    </div>
                    {isGeneralMarketplace && product.business && (
                      <Badge variant="secondary" className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 font-semibold border border-slate-100 max-w-[120px] truncate rounded-lg">
                        {product.business.business_name}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-xl border-slate-200"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <span className="text-xs text-slate-500 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-xl border-slate-200"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
