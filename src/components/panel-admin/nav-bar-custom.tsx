'use client'
// import { SheetMenu } from './sheet-menu'
// import { useSidebar } from '@/hooks'
import { cn } from '@/lib/utils'
import { SectionElement, IMoreApp } from './sidebar'
// import { useStore } from 'zustand'
import { MENU_PROFILE } from './profile-menu'
import { ProfilePopover } from './profile-popover'
// import { SearchBar } from '../miscellaneous/search-bar'
import { ModeToggle } from '@/components/mode-toggle'

interface NavBarCustomProps {
  moreApps?: Array<IMoreApp>
  userName?: string
  urlPhoto?: string
  email?: string
  menuItems?: SectionElement[]
}

export const NavBarCustom = (props: NavBarCustomProps) => {
  const { userName, urlPhoto, email } = props

  // const sidebar = useStore(useSidebar, (x) => x)
  // if (!sidebar) return null

  return (
    <header
      className={cn(
        `sticky top-0 z-50 w-full border border-b-gray-200 bg-white dark:bg-zinc-900 dark:border-b-gray-700`
      )}
    >
      <div className="px-4 sm:px-6 md:px-7 flex h-16 items-center">
        {/* <div className="flex items-center space-x-4 lg:space-x-0 sm:gap-3 w-full">
          <SheetMenu title="Tu panel" menuItems={menuItems} />
          <div className="w-full flex items-center justify-between gap-2 max-w-2xl mx-auto">
            <SearchBar showSmartButton={false} />
          </div>
        </div> */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/*Menu de perfil*/}
          <ModeToggle />
          <ProfilePopover
            profileData={{
              names: `${userName}`,
              email,
              photo: urlPhoto
            }}
            menuSections={MENU_PROFILE.APP_MENU}
            showProgress={false}
            showBorders={false}
          />
        </div>
      </div>
    </header>
  )
}
