'use client'

import * as React from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { usePathname } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import Link from 'next/link'

export interface TeamSwitcherType {
  name: string
  plan: string
  url_logo?: string
  href?: string
}

export function TeamSwitcher({ teams }: { teams: TeamSwitcherType[] }) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()

  // Open the dropdown by default if there is more than one team
  const [open, setOpen] = React.useState<boolean>(false)

  // Determine active team from pathname (falls back to first team)
  const getActiveFromPath = React.useCallback(() => {
    if (!pathname) return teams[0]
    const found = teams.find((t) => t.href && pathname.startsWith(t.href))
    return found || teams[0]
  }, [pathname, teams])

  const [activeTeam, setActiveTeam] = React.useState(() => getActiveFromPath())

  // Keep active team in sync with pathname changes
  React.useEffect(() => {
    const newActive = getActiveFromPath()
    if (newActive && newActive.name !== activeTeam?.name) {
      setActiveTeam(newActive)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, teams])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          {teams.length > 1 && (
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <img
                  src={activeTeam.url_logo || '/placeholder-team-logo.png'}
                  alt={activeTeam.name}
                  className="size-8 rounded-lg object-cover"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeTeam.name}
                  </span>
                  <span className="truncate text-xs">{activeTeam.plan}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          )}
          {teams.length <= 1 && (
            <SidebarMenuButton size="lg">
              <img
                src={activeTeam.url_logo || '/placeholder-team-logo.png'}
                alt={activeTeam.name}
                className="size-8 rounded-lg object-cover"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          )}
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Cambiar equipo
            </DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem key={team.name} className="gap-2 p-2" asChild>
                <Link
                  href={team.href || '#'}
                  className={`flex items-center rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                    team.name === activeTeam.name
                      ? 'bg-accent text-accent-foreground'
                      : ''
                  }`}
                >
                  <img
                    src={team.url_logo || '/placeholder-team-logo.png'}
                    alt={team.name}
                    className="size-3.5 shrink-0 rounded-sm border"
                  />
                  {team.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
