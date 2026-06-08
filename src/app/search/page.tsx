import { getAllStorefrontProducts, getStorefrontFilters } from '@/apis/app/business'
import { createClient } from '@/utils/supabase/server'
import SearchPageContent from '@/components/storefront/search-page-content'
import StorefrontNavbar from '@/components/storefront/navbar'

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
      {/* Reusable Navbar */}
      <StorefrontNavbar user={user} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 py-8">
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
