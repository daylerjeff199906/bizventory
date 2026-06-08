import Link from 'next/link'
import { ShoppingBag, LayoutDashboard, LogIn, Store, Sparkles, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StorefrontNavbarProps {
  user: any
}

export default function StorefrontNavbar({ user }: StorefrontNavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-slate-100/80 shadow-xs">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/10 group-hover:scale-102 transition-transform">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Bizventory
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50/60 text-rose-700 transition-colors">
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
              <Sparkles className="w-4 h-4 text-rose-500" />
              Novedades
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Button asChild variant="outline" className="rounded-xl border-slate-200 text-xs font-semibold gap-1.5 shadow-xs bg-background hover:bg-slate-50/60">
              <Link href="/dashboard">
                <LayoutDashboard className="w-4 h-4 text-rose-600" />
                Ir al Panel
              </Link>
            </Button>
          ) : (
            <Button asChild variant="default" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 shadow-md shadow-rose-600/10 transition-all hover:scale-[1.01] active:scale-[0.99]">
              <Link href="/login">
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
