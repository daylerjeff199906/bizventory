import { getAllStorefrontProducts } from '@/apis/app/business'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ShoppingBag, LayoutDashboard, LogIn, Store, Sparkles, Flame, Percent, ShieldCheck } from 'lucide-react'
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
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-slate-100/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10 group-hover:scale-102 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Bizventory
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
              <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50/60 text-indigo-700 transition-colors">
                <Store className="w-4 h-4" />
                Explorar Tiendas
              </Link>
              <span className="text-slate-200">|</span>
              <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer">
                <Flame className="w-4 h-4 text-amber-500" />
                Súper Ofertas
              </span>
              <span className="text-slate-200">|</span>
              <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Novedades
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild variant="outline" className="rounded-xl border-slate-200 text-xs font-semibold gap-1.5 shadow-xs bg-background hover:bg-slate-50/60">
                <Link href="/dashboard">
                  <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                  Ir al Panel
                </Link>
              </Button>
            ) : (
              <Button asChild variant="default" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/10 transition-all hover:scale-[1.01] active:scale-[0.99]">
                <Link href="/login">
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="w-full bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border-b border-indigo-950/40 relative overflow-hidden py-10 md:py-16 shadow-xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-5 text-left">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5 text-indigo-400" />
              Mega Promo de Temporada
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight md:leading-none text-white">
              Encuentra productos de <span className="bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">tiendas locales</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explora catálogos, revisa variaciones en tiempo real y compra directamente con los vendedores de forma segura a través de WhatsApp.
            </p>

            {/* Value Badges */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Compra Directa
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Variantes en Vivo
              </span>
            </div>
          </div>

          {/* Banner Promotional Card */}
          <div className="w-full md:w-auto shrink-0 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center text-center shadow-lg min-w-[240px] text-white">
            <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold block mb-1">Descuentos de hoy</span>
            <span className="text-4xl font-bold text-indigo-400 leading-none">HASTA -80%</span>
            <span className="text-xs text-slate-400 mt-2 block border-t border-white/10 pt-2 w-full">En productos Choice</span>
          </div>
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
