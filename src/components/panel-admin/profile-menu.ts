'use client'
import { MenuSection } from './interfaces.profile.popover'
import { signOut } from '@/apis/core/auth'

export const MENU_PROFILE_USER: MenuSection[] = [
  {
    label: 'Opciones',
    items: [
      {
        label: 'Cerrar sesión',
        onClick: async () => {
          await signOut()
        }
      }
    ]
  }
]

export const MENU_PROFILE = {
  APP_MENU: MENU_PROFILE_USER
}
