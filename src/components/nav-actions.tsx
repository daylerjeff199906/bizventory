'use client'

import * as React from 'react'
import { Bell, User, CreditCard, LogOut, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { URL_CONFIG } from '@/config/urlConfig'

// Datos de ejemplo para el menú de opciones
// Opciones del dropdown del usuario
const userMenuOptions = [
  [
    {
      label: 'Mi Perfil',
      icon: User,
      href: URL_CONFIG.PROFILE
    }
  ],
  [
    {
      label: 'Planes y Facturación',
      icon: CreditCard,
      href: URL_CONFIG.PLANS
    },
    {
      label: 'Notificaciones',
      icon: Bell
    }
  ],
  [
    {
      label: 'Cerrar Sesión',
      icon: LogOut
    }
  ]
]

export function NavActions({
  isAuthenticated,
  userData
}: {
  isAuthenticated: boolean
  userData?: {
    name: string
    email: string
    avatar: string
  } | null
}) {
  const router = useRouter()
  // Datos de usuario de ejemplo (deberías obtenerlos de tu estado de autenticación real)
  const user = userData || {
    name: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    avatar: '/avatars/juan.jpg'
  }

  // Función para manejar el logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST'
      })

      if (response.ok) {
        router.replace('/login')
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isAuthenticated ? (
        // Usuario autenticado - mostrar avatar con dropdown
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-full px-2 flex items-center gap-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start mr-2">
                <span className="text-xs font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userMenuOptions.map((group, index) => (
              <React.Fragment key={index}>
                <DropdownMenuGroup>
                  {group.map((item, itemIndex) => {
                    if (item.label === 'Cerrar Sesión') {
                      return (
                        <AlertDialog key={itemIndex}>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onSelect={(e) => e.preventDefault()}
                              variant="destructive"
                            >
                              <item.icon className="mr-2 h-4 w-4" />
                              <span>{item.label}</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-96">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ¿Cerrar sesión?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que deseas cerrar tu sesión?
                                Podrás volver a iniciar sesión en cualquier
                                momento.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="grid grid-cols-2 gap-4 pt-4">
                              <AlertDialogCancel className="rounded-full">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="rounded-full bg-destructive hover:bg-destructive/90"
                                onClick={handleLogout}
                              >
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )
                    }

                    return (
                      <DropdownMenuItem
                        key={itemIndex}
                        className="cursor-pointer"
                        asChild={!!item.href}
                        onSelect={(e) => {
                          if (!item.href) {
                            e.preventDefault()
                          }
                        }}
                      >
                        <Link
                          href={item.href || '#'}
                          className="flex items-center"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuGroup>
                {index < userMenuOptions.length - 1 && (
                  <DropdownMenuSeparator />
                )}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // Usuario no autenticado - mostrar botones de inicio de sesión y comprar plan
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="rounded-full border" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button className="rounded-full">Comprar plan</Button>
        </div>
      )}
    </div>
  )
}
