'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { signOut } from '@/apis/core/auth'

interface UserSectionProps {
  isCollapsed?: boolean
  user?: {
    name?: string | null
    email?: string | null
    role?: string | null
    avatarUrl?: string | null
  }
}

export const UserSection = ({
  isCollapsed = false,
  user
}: UserSectionProps) => {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut() // Usamos la Server Action
      router.refresh() // Actualizamos el estado de la aplicación
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'US'
    const names = name.split(' ')
    return names
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 h-auto p-2',
            isCollapsed && 'justify-center'
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.avatarUrl || '/placeholder-user.jpg'}
              alt="Usuario"
            />
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">
                {user?.name || 'Usuario'}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.role || 'Usuario'}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
