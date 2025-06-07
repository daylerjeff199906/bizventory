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
  User,
  Settings,
  LogOut,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { APP_URLS } from '@/config/app-urls'

const navMain = [
  {
    title: 'Productos',
    url: '#',
    icon: PackageCheck,
    items: [
      { title: 'Lista de productos', url: APP_URLS.PRODUCTS.LIST },
      { title: 'Categorías', url: '/products/categories' },
      { title: 'Stock Mínimo', url: '/products/min-stock' }
    ]
  },
  {
    title: 'Inventario',
    url: '#',
    icon: Warehouse,
    items: [
      { title: 'Estado de Stock', url: APP_URLS.PRODUCTS.PRODUCTS_STOCK },
      { title: 'Historial de Movimientos', url: APP_URLS.PURCHASES.INVENTORY },
      { title: 'Alertas de Stock', url: '/inventory/alerts' }
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
      { title: 'Nueva Venta', url: '/sales/new' },
      { title: 'Lista de Ventas', url: '/sales' },
      { title: 'Tickets (PDF)', url: '/sales/tickets' }
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
      { title: 'Proveedores', url: APP_URLS.SUPPLIERS.LIST },
      { title: 'Relaciones', url: '/relationships' }
    ]
  },
  {
    title: 'Usuarios y Roles',
    url: '#',
    icon: Users,
    items: [
      { title: 'Gestión de Usuarios', url: '/users' },
      { title: 'Roles y Permisos', url: '/roles' }
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2 h-auto p-2',
                isCollapsed && 'justify-center'
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="Usuario" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">Juan Pérez</span>
                  <span className="text-xs text-muted-foreground">
                    Administrador
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
          'hidden lg:flex flex-col border-r bg-muted/40 transition-all duration-300 sticky top-0 h-screen max-h-[calc(100vh-4rem)]',
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
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
