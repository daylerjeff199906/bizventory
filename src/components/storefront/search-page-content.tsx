'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  RotateCcw, 
  Building2, 
  Tag, 
  DollarSign, 
  ArrowUpDown 
} from 'lucide-react'

interface SearchPageContentProps {
  products: any[]
  totalPages: number
  currentPage: number
  currentSearch: string
  filterOptions: {
    businesses: any[]
    brands: any[]
  }
}

export default function SearchPageContent({
  products,
  totalPages,
  currentPage,
  currentSearch,
  filterOptions
}: SearchPageContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Read current filters from URL params
  const brandParam = searchParams.get('brandId') || ''
  const businessParam = searchParams.get('businessId') || ''
  const minPriceParam = searchParams.get('minPrice') || ''
  const maxPriceParam = searchParams.get('maxPrice') || ''
  const sortParam = searchParams.get('sort') || 'newest'

  // Input states
  const [minPrice, setMinPrice] = useState(minPriceParam)
  const [maxPrice, setMaxPrice] = useState(maxPriceParam)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    params.set('page', '1') // reset page
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePriceApply = () => {
    updateFilters({
      minPrice: minPrice,
      maxPrice: maxPrice
    })
  }

  const handleClearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    router.push(pathname)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const getProductDetailUrl = (product: any) => {
    const slug = product.business?.slug || product.brand?.business?.slug || 'unknown'
    return `/store/${slug}/product/${product.id}`
  }

  // Parse images safely helper
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

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Sidebar - Aside filters */}
      <aside className="w-full md:w-64 shrink-0 bg-background border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            Filtros
          </h2>
          <Button 
            variant="ghost" 
            size="xs" 
            onClick={handleClearFilters}
            className="text-[10px] text-slate-500 hover:text-indigo-600 gap-1 px-2 py-1 h-fit"
          >
            <RotateCcw className="w-3 h-3" />
            Limpiar
          </Button>
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Ordenar por
          </label>
          <select
            value={sortParam}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="w-full h-10 px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="newest">Más reciente</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
          </select>
        </div>

        {/* Store Filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Tienda
          </label>
          <select
            value={businessParam}
            onChange={(e) => updateFilters({ businessId: e.target.value, brandId: '' })}
            className="w-full h-10 px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="">Todas las tiendas</option>
            {filterOptions.businesses.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.business_name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Marca
          </label>
          <select
            value={brandParam}
            onChange={(e) => updateFilters({ brandId: e.target.value })}
            className="w-full h-10 px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="">Todas las marcas</option>
            {filterOptions.brands
              .filter((b: any) => !businessParam || b.business_id === businessParam)
              .map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Rango de precio (S/)
          </label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Mín"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-9 text-xs rounded-xl bg-slate-50/50 border-slate-250/60"
            />
            <span className="text-slate-300 text-xs">—</span>
            <Input
              type="number"
              placeholder="Máx"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-9 text-xs rounded-xl bg-slate-50/50 border-slate-250/60"
            />
          </div>
          <Button 
            onClick={handlePriceApply}
            className="w-full mt-2 h-9 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs"
          >
            Aplicar Rango
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 w-full space-y-6">
        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            {currentSearch ? (
              <>Resultados para &ldquo;<strong className="text-slate-900 font-bold">{currentSearch}</strong>&rdquo;</>
            ) : (
              'Todos los productos'
            )}
          </span>
          <span>{products.length} artículos encontrados</span>
        </div>

        {/* 4-column Product Grid */}
        {products.length === 0 ? (
          <div className="bg-background rounded-3xl border border-dashed p-16 text-center max-w-md mx-auto mt-8">
            <Package className="w-12 h-12 text-slate-350 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 text-sm mb-1">Sin resultados</h3>
            <p className="text-slate-500 text-xs leading-relaxed">No se encontraron productos que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  className="overflow-hidden border border-slate-100 hover:shadow-xl hover:border-indigo-150 transition-all duration-300 flex flex-col group h-full cursor-pointer rounded-2xl bg-card hover:-translate-y-1 py-0"
                >
                  {/* Image Area */}
                  <div className="h-48 w-full bg-slate-50 flex items-center justify-center relative overflow-hidden shrink-0 border-b border-slate-100/60">
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
                      {product.business && (
                        <Badge variant="secondary" className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 font-semibold border border-slate-100 max-w-[100px] truncate rounded-lg">
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
    </div>
  )
}
