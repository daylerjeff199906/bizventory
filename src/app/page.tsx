import { getAllStorefrontProducts } from '@/apis/app/business'
import { createClient } from '@/utils/supabase/server'
import { Percent, ShieldCheck, Sparkles } from 'lucide-react'
import Catalog from '@/components/storefront/catalog'
import StorefrontNavbar from '@/components/storefront/navbar'

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
      {/* Reusable Navbar */}
      <StorefrontNavbar user={user} />

      {/* Hero Banner Section */}
      <section className="w-full bg-slate-950 border-b border-rose-950/45 relative overflow-hidden py-16 md:py-24 shadow-xl bg-[url('/images/banner_background.png')] bg-cover bg-center">
        {/* Dark overlay mask for text legibility */}
        <div className="absolute inset-0 bg-slate-950/75 mix-blend-multiply z-0" />

        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-85 h-85 bg-rose-650/15 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-65 h-65 bg-red-600/15 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-5 text-left">
            <span className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-400/25 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5 text-rose-450" />
              Mega Promo de Temporada
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight md:leading-none text-white">
              Encuentra productos de <span className="bg-gradient-to-r from-red-400 to-rose-350 bg-clip-text text-transparent">tiendas locales</span>
            </h1>
            <p className="text-slate-100 text-sm sm:text-base leading-relaxed">
              Explora catálogos, revisa variaciones en tiempo real y compra directamente con los vendedores de forma segura a través de WhatsApp.
            </p>

            {/* Value Badges */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-rose-450" />
                Compra Directa
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Sparkles className="w-4 h-4 text-rose-400" />
                Variantes en Vivo
              </span>
            </div>
          </div>

          {/* Banner Promotional Card */}
          <div className="w-full md:w-auto shrink-0 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center text-center shadow-lg min-w-[240px] text-white">
            <span className="text-[10px] text-rose-300 uppercase tracking-widest font-bold block mb-1">Descuentos de hoy</span>
            <span className="text-4xl font-bold text-red-500 leading-none">HASTA -80%</span>
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
