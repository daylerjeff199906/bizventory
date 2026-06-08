import { getAllStorefrontProducts, getStorefrontFilters } from '@/apis/app/business'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ShoppingBag, LayoutDashboard, LogIn, ArrowLeft } from 'lucide-react'
import SearchPageContent from '@/components/storefront/search-page-content'
import { Button } from '@/components/ui/button'

interface Props {
  searchParams: Promise<{
    q?: string
    brandId?: string
    businessId?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
  }>
}

export default async function SearchResultsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const sParams = await searchParams

  const currentSearch = sParams.q || ''
  const currentPage = parseInt(sParams.page || '1') || 1
  const brandId = sParams.brandId || ''
  const businessId = sParams.businessId || ''
  const minPrice = parseFloat(sParams.minPrice || '0') || 0
  const maxPrice = parseFloat(sParams.maxPrice || '0') || 0
  const sort = sParams.sort || 'newest'

  // Fetch filtered products from backend database
  const { data: products, totalPages } = await getAllStorefrontProducts({
    page: currentPage,
    pageSize: 12,
    search: currentSearch,
    brandId,
    businessId,
    minPrice,
    maxPrice,
    sort
  })

  // Fetch filters options
  const filterOptions = await getStorefrontFilters()

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-slate-100/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Bizventory
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="rounded-xl text-xs font-semibold gap-1.5 hover:bg-slate-100/60">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                Volver al Inicio
              </Link>
            </Button>
            {user ? (
              <Button asChild variant="outline" className="rounded-xl border-slate-200 text-xs font-semibold gap-1.5 shadow-xs bg-background hover:bg-slate-50/60">
                <Link href="/dashboard">
                  <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                  Ir al Panel
                </Link>
              </Button>
            ) : (
              <Button asChild variant="default" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/10">
                <Link href="/login">
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 py-8">
        <SearchPageContent
          products={products}
          totalPages={totalPages}
          currentPage={currentPage}
          currentSearch={currentSearch}
          filterOptions={filterOptions}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-background py-8 text-center text-xs text-slate-400 mt-12">
        <p>© {new Date().getFullYear()} Bizventory. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
