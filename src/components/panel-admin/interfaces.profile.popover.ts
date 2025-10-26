export interface MenuItem {
  label: string
  href?: string
  onClick?: () => void | Promise<void>
}

export interface MenuSection {
  label?: string
  items: MenuItem[]
}

export interface ProfileData {
  names: string
  photo?: string
  email?: string
}

export interface MenuProfileProps {
  profileData: ProfileData
  menuSections?: MenuSection[]
  progressValue?: number
  showProgress?: boolean
  showBorders?: boolean
  avatarClassName?: string
  contentClassName?: string
}
