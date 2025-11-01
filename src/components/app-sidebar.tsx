'use client'

import * as React from 'react'
import { Frame, Map, PieChart } from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { TeamSwitcher, TeamSwitcherType } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { NavActions } from './nav-actions'
import { NavMainType } from '@/types'

// This is sample data.
const data = {
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map
    }
  ]
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userData?: {
    name: string
    email: string
    avatar: string
    roles?: string[]
  } | null
  menuNavBar?: NavMainType
  menuTeamSwitcher?: TeamSwitcherType[]
}

export function AppSidebar(props: AppSidebarProps) {
  // Extraer los props personalizados y dejar solo los props del Sidebar
  const { userData, menuNavBar, menuTeamSwitcher, ...sidebarProps } = props

  return (
    <Sidebar collapsible="icon" {...sidebarProps}>
      <SidebarHeader>
        <TeamSwitcher teams={menuTeamSwitcher || []} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menuNavBar?.navMain || []} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavActions
          isAuthenticated={!!userData?.email}
          userData={userData || null}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
