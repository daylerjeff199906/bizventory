import { NavItem } from '@/types/core'

import { APP_URLS } from '@/config/app-urls'

export const adminNavMain: (uuid: string) => NavItem[] = (uuid: string) => [
  {
    title: 'Inicio',
    url: APP_URLS.ORGANIZATION.BUSINESS.DETAIL(uuid),
    icon: 'House',
    items: []
  },
  {
    title: 'Marcas',
    url: APP_URLS.ORGANIZATION.BRANDS.LIST(uuid),
    icon: 'Tag',
    items: []
  },
  {
    title: 'Productos',
    url: APP_URLS.ORGANIZATION.PRODUCTS.LIST(uuid),
    icon: 'Box',
    items: []
  },
  {
    title: 'Inventario',
    url: APP_URLS.ORGANIZATION.INVENTORY.LIST(uuid),
    icon: 'Package',
    items: []
  },
  {
    title: 'Clientes',
    url: APP_URLS.ORGANIZATION.CUSTOMERS.LIST(uuid),
    icon: 'Users',
    items: []
  },
  {
    title: 'Proveedores',
    url: APP_URLS.ORGANIZATION.SUPPLIERS.LIST(uuid),
    icon: 'Building2',
    items: []
  },
  {
    title: 'Entradas',
    url: APP_URLS.ORGANIZATION.PURCHASES.LIST(uuid),
    icon: 'SquareArrowDownRight',
    items: []
  },
  {
    title: 'Salidas',
    url: APP_URLS.ORGANIZATION.SALES.LIST(uuid),
    icon: 'SquareArrowUpRight',
    items: []
  }
]
