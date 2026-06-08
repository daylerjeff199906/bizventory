'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDebouncedCallback } from 'use-debounce'

interface BannerSearchBarProps {
  currentSearch: string
}

export default function BannerSearchBar({ currentSearch }: BannerSearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(currentSearch)

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    router.push(`/search?${params.toString()}`)
  }, 400)

  return (
    <div className="w-full bg-slate-900/40 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
      {/* Search Input on the left */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-rose-300/80" />
        <input
          type="text"
          placeholder="Buscar productos en tiendas locales..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
            debouncedSearch(e.target.value)
          }}
          className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-450 transition-all text-sm"
        />
      </div>

      {/* View All Products button on the right */}
      <Button 
        onClick={() => router.push('/search')}
        variant="default"
        className="rounded-xl bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-semibold px-6 py-2.5 shadow-md shadow-rose-600/10 transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0 w-full sm:w-auto h-auto"
      >
        Ver todos los productos
      </Button>
    </div>
  )
}
