'use client'
import { MenuSection } from './interfaces.profile.popover'
// import { APP_URLS } from '@/config/app-urls'
// import { handleLogout } from '@/utils/logout'

export const MENU_PROFILE_USER: MenuSection[] = [
  {
    label: 'Opciones',
    items: [
      // {
      //   label: 'Panel de control',
      //   href: APP_URLS.DASHBOARD.BASE
      // },
      // {
      //   label: 'Perfil',
      //   href: APP_URLS.DASHBOARD.PROFILE
      // },
      // {
      //   label: 'Configuración',
      //   href: APP_URLS.DASHBOARD.SETTINGS
      // },
      // {
      //   label: 'Cerrar sesión',
      //   onClick: () => {
      //     handleLogout(APP_URLS.AUTH.LOGIN)
      //   }
      // }
    ]
  }
]

export const MENU_PROFILE = {
  APP_MENU: MENU_PROFILE_USER
}
