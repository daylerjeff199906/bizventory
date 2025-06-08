'use client'

import type * as React from 'react'
import {
  GalleryVerticalEnd,
  Users,
  PackageCheck,
  Warehouse,
  FileDown,
  FileUp,
  BarChartBig,
  Contact2
} from 'lucide-react'

import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar'
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
      { title: 'Comprobantes (PDF)', url: '/purchases/receipts' }
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

// Datos del usuario (mantener los originales)
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Sistema de Inventario</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="font-medium">
                    <item.icon className="size-4" />
                    {item.title}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>{subItem.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
