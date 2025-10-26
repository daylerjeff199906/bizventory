import * as LucideIcons from 'lucide-react'
type LucideIconName = keyof typeof LucideIcons
export interface SectionElement {
  section: SectionSection
  menus: MenuElement[]
}

export interface MenuElement {
  menu: SubmenuElement
  submenus: SubmenuElement[]
}

export interface SubmenuElement {
  id: number
  name: string
  description?: string
  icon?: LucideIconName
  url: null | string
  isDisabled?: boolean
  isExternal?: boolean
}

export interface SectionSection {
  id: number
  name: string
}

export interface IMoreApp {
  title: string
  description: string
  icon: string
  url: string
  category?: string
  isNew?: boolean
  isPopular?: boolean
}
