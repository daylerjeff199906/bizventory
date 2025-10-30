import type { icons,  } from 'lucide-react'

export type IconName = Exclude<Extract<keyof typeof icons, string>, 'default' | 'LucideIcon'>

// Tipado para los ítems del menú
export interface NavItem {
  title: string
  url: string
  icon?: IconName
  isActive?: boolean
  items?: NavSubItem[]
}

export interface NavSubItem {
  title: string
  url: string
}

// Tipado para el menú principal
export interface NavMainType {
  navMain: NavItem[]
}