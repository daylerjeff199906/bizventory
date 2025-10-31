'use client'
import type React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export type SidebarItem = {
  name: string
  url: string
  icon?: React.ReactNode
}

interface LayoutProductProps {
  children: React.ReactNode
  items: SidebarItem[]
  title?: string
}

export function LayoutProduct({ children, items, title }: LayoutProductProps) {
  const pathname = usePathname()
  return (
    <section className="flex gap-2">
      <aside className="w-48 shrink-0 sticky md:top-24 h-fit overflow-y-auto bg-background">
        {title && (
          <div className="mb-4">
            <h2 className="text-sm font-bold">{title}</h2>
          </div>
        )}
        <nav className="space-y-1">
          {items.map((item, index) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={index}
                href={item.url}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-primary hover:bg-accent'
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">{children}</div>
    </section>
  )
}
