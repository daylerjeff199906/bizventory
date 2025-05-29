'use client'

import * as React from 'react'
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Users,
  PackageCheck,
  Warehouse,
  FileDown,
  FileUp,
  BarChartBig,
  Contact2
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { APP_URLS } from '@/config/app-urls'

const navMain = [
  // {
  //   title: 'Empresas',
  //   url: '#',
  //   icon: Building2,
  //   items: [
  //     { title: 'Lista de Empresas', url: '/companies' },
  //     { title: 'Asignar Usuarios', url: '/companies/assign-users' },
  //     { title: 'Configuración General', url: '/companies/settings' }
  //   ]
  // },
  {
    title: 'Productos',
    url: '#',
    icon: PackageCheck,
    items: [
      { title: 'Catálogo de Productos', url: '/products' },
      { title: 'Categorías', url: '/products/categories' },
      { title: 'Códigos de Barras / QR', url: '/products/codes' },
      { title: 'Stock Mínimo', url: '/products/min-stock' }
    ]
  },
  {
    title: 'Inventario',
    url: '#',
    icon: Warehouse,
    items: [
      { title: 'Estado de Stock', url: '/inventory' },
      { title: 'Historial de Movimientos', url: '/inventory/history' },
      { title: 'Alertas de Stock', url: '/inventory/alerts' }
    ]
  },
  {
    title: 'Entradas (Compras)',
    url: '#',
    icon: FileDown,
    items: [
      { title: 'Nueva Compra', url: '/purchases/new' },
      { title: 'Lista de Compras', url: '/purchases' },
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
  }
]

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup'
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free'
    }
  ],
  navMain: navMain,
  projects: [
    {
      name: 'Usuarios y Roles',
      url: '#',
      icon: Users
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
