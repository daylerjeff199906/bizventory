import { getAllStorefrontProducts } from '@/apis/app/business'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ShoppingBag, LayoutDashboard, LogIn } from 'lucide-react'
import Catalog from '@/components/storefront/catalog'
import { Button } from '@/components/ui/button'

interface Props {
  searchParams: Promise<{
    q?: string
    page?: string
  }>
}

export default async function Home({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const sParams = await searchParams
  const currentSearch = sParams.q || ''
  const currentPage = parseInt(sParams.page || '1') || 1

  const { data: products, totalPages } = await getAllStorefrontProducts({
    page: currentPage,
    pageSize: 12,
    search: currentSearch
  })

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Bizventory
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild variant="outline" className="rounded-xl border-slate-200 text-xs font-semibold gap-1.5">
                <Link href="/dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                  Ir al Panel
                </Link>
              </Button>
            ) : (
              <Button asChild variant="default" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-sm">
                <Link href="/login">
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50/30 to-transparent pt-12 pb-6 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Encuentra productos de tiendas locales
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Explora catálogos, revisa variaciones en tiempo real y compra directamente con los vendedores a través de WhatsApp.
          </p>
        </div>
      </section>

      {/* Main Catalog */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 py-8">
        <Catalog
          products={products}
          totalPages={totalPages}
          currentPage={currentPage}
          currentSearch={currentSearch}
          isGeneralMarketplace={true}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-background py-8 text-center text-xs text-slate-400 mt-12">
        <p>© {new Date().getFullYear()} Bizventory. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
