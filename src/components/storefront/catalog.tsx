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
}

export default function Catalog({
  products,
  totalPages,
  currentPage,
  currentSearch,
  isGeneralMarketplace = false,
  storeSlug
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
    router.push(`${pathname}?${params.toString()}`)
  }, 400)

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const getProductDetailUrl = (product: any) => {
    const slug = storeSlug || product.business?.slug || product.brand?.business?.slug || 'unknown'
    return `/store/${slug}/product/${product.id}`
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto w-full mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar productos por nombre o descripción..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              debouncedSearch(e.target.value)
            }}
            className="w-full pl-10 pr-4 py-2 bg-background border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
      </div>

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

            return (
              <Card
                key={product.id}
                onClick={() => router.push(getProductDetailUrl(product))}
                className="overflow-hidden border border-slate-100 hover:shadow-xl hover:border-slate-200/80 transition-all flex flex-col group h-full cursor-pointer py-0"
              >
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
                      <span className="bg-red-600 text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase shadow-md">
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

                  <div className="pt-2 border-t border-slate-50 flex items-end justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                        {hasVariants ? 'Desde' : 'Precio'}
                      </span>
                      <span className="font-bold text-base text-slate-900">
                        {formatCurrency(displayPrice)}
                      </span>
                    </div>
                    {isGeneralMarketplace && product.business && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 font-medium max-w-[100px] truncate">
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
