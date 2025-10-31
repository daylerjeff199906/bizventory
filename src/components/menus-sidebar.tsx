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
    title: 'Productos',
    url: APP_URLS.ORGANIZATION.PRODUCTS.LIST(uuid),
    icon: 'User',
    items: []
  },
  {
    title: 'Entradas',
    url: APP_URLS.ORGANIZATION.PURCHASES.LIST(uuid),
    icon: 'FolderOpen',
    items: []
  }
]
