'use client'
import type React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import {
  PackageCheck,
  Warehouse,
  FileDown,
  FileUp,
  BarChartBig,
  Contact2,
  Users,
  Menu,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { APP_URLS } from '@/config/app-urls'
import { UserSection } from './user-section'

const navMain = [
  {
    title: 'Productos',
    url: '#',
    icon: PackageCheck,
    items: [
      { title: 'Lista de productos', url: APP_URLS.PRODUCTS.LIST }
      // { title: 'Categorías', url: '/products/categories' },
    ]
  },
  {
    title: 'Inventario',
    url: '#',
    icon: Warehouse,
    items: [
      { title: 'Estado de Stock', url: APP_URLS.PRODUCTS.PRODUCTS_STOCK },
      { title: 'Historial de Movimientos', url: APP_URLS.PURCHASES.INVENTORY }
    ]
  },
  {
    title: 'Entradas (Compras)',
    url: '#',
    icon: FileDown,
    items: [
      { title: 'Nueva Compra', url: APP_URLS.PURCHASES.CREATE },
      { title: 'Lista de Compras', url: APP_URLS.PURCHASES.LIST },
      { title: 'Comprobantes (PDF)', url: APP_URLS.PURCHASES.RECEIPTS.LIST }
    ]
  },
  {
    title: 'Salidas (Ventas)',
    url: '#',
    icon: FileUp,
    items: [
      { title: 'Nueva Venta', url: APP_URLS.SALES.CREATE },
      { title: 'Lista de Ventas', url: APP_URLS.SALES.LIST },
      { title: 'Tickets (PDF)', url: APP_URLS.SALES.TICKETS.LIST }
    ]
  },
  {
    title: 'Reportes',
    url: '#',
    icon: BarChartBig,
    items: [
      { title: 'Por Fecha', url: '/reports/dates' },
      { title: 'Stock Actual', url: '/reports/stock' },
      { title: 'Movimientos de Inventario', url: '/reports/movements' }
    ]
  },
  {
    title: 'Clientes y Proveedores',
    url: '#',
    icon: Contact2,
    items: [
      { title: 'Clientes', url: '/clients' },
      { title: 'Proveedores', url: APP_URLS.SUPPLIERS.LIST }
    ]
  },
  {
    title: 'Usuarios y Roles',
    url: '#',
    icon: Users,
    items: [
      { title: 'Gestión de Usuarios', url: '/users' },
      { title: 'Roles y Permisos', url: '/roles' },
      { title: 'Configuración', url: APP_URLS.SETTINGS.GENERAL }
    ]
  }
]

interface SidebarContentProps {
  isCollapsed?: boolean
  onNavigate?: () => void
}

function SidebarContent({
  isCollapsed = false,
  onNavigate
}: SidebarContentProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PackageCheck className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                Sistema de Inventario
              </span>
              <span className="text-xs text-muted-foreground">
                Gestión Integral
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navMain.map((item) => {
          const Icon = item.icon
          const isOpen = openItems.includes(item.title)

          return (
            <Collapsible
              key={item.title}
              open={isOpen}
              onOpenChange={() => toggleItem(item.title)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-2 h-10',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              {!isCollapsed && (
                <CollapsibleContent className="space-y-1">
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.title}
                      href={subItem.url}
                      onClick={onNavigate}
                      className="flex items-center gap-2 rounded-md px-8 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </CollapsibleContent>
              )}
            </Collapsible>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-4">
        <UserSection isCollapsed={isCollapsed} />
      </div>
    </div>
  )
}

export default function SidebarLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  // h-screen

  return (
    <div className="flex bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-muted/40 transition-all duration-300 fixed top-0 left-0 h-screen z-50',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} />

        {/* Collapse Toggle */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full"
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onNavigate={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 lg:pl-64 transition-all duration-300',
          isCollapsed ? 'lg:pl-16' : 'lg:pl-64',
          'w-[calc(100vw-64px)] lg:w-[calc(100vw-256px)]'
        )}
      >
        <div className="h-fit p-6 w-full">{children}</div>
      </main>
    </div>
  )
}
