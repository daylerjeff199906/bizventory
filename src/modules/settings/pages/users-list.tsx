/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
import {
  MoreHorizontal,
  UserPlus,
  Mail,
  Shield,
  ShieldOff,
  Trash2,
  RefreshCw,
  Search
} from 'lucide-react'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'

// Inicializar Supabase (reemplaza con tus credenciales)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'tu-supabase-url',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'tu-service-role-key'
)

interface User {
  id: string
  email: string
  phone?: string
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  phone_confirmed_at?: string
  banned_until?: string
  //   user_metadata: any
  //   app_metadata: any
}

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [dialogoCrear, setDialogoCrear] = useState(false)
  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: '',
    password: '',
    phone: ''
  })

  const usuariosPorPagina = 10

  const cargarUsuarios = async (pagina = 1, buscar = '') => {
    setCargando(true)
    try {
      const query = supabase.auth.admin.listUsers({
        page: pagina,
        perPage: usuariosPorPagina
      })

      const { data, error } = await query

      if (error) throw error

      let usuariosFiltrados = data.users

      if (buscar) {
        usuariosFiltrados = data.users.filter(
          (user) =>
            user.email?.toLowerCase().includes(buscar.toLowerCase()) ||
            user.phone?.includes(buscar)
        )
      }

      setUsuarios(usuariosFiltrados as User[])
      setTotalUsuarios(data.total || usuariosFiltrados.length)
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      toast.error(
        <ToastCustom
          title="Error al cargar usuarios"
          message="No se pudieron cargar los usuarios. Por favor, inténtalo de nuevo más tarde."
        />
      )
    } finally {
      setCargando(false)
    }
  }

  const crearUsuario = async () => {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: nuevoUsuario.email,
        password: nuevoUsuario.password,
        phone: nuevoUsuario.phone || undefined,
        email_confirm: true
      })

      if (error) throw error

      toast.success(
        <ToastCustom
          title="Usuario creado"
          message={`El usuario ${data.user.email} ha sido creado exitosamente`}
        />
      )

      setDialogoCrear(false)
      setNuevoUsuario({ email: '', password: '', phone: '' })
      cargarUsuarios(paginaActual, busqueda)
    } catch (error) {
      console.error('Error creando usuario:', error)
      toast.error(
        <ToastCustom
          title="Error al crear usuario"
          message={
            'No se pudo crear el usuario. Por favor, verifica los datos e inténtalo de nuevo.'
          }
        />
      )
    }
  }

  const eliminarUsuario = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) throw error

      toast.success(
        <ToastCustom
          title="Usuario eliminado"
          message="El usuario ha sido eliminado exitosamente"
        />
      )
      cargarUsuarios(paginaActual, busqueda)
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'
      toast.error(
        <ToastCustom
          title="Error al eliminar usuario"
          message={
            errorMessage ||
            'No se pudo eliminar el usuario. Por favor, inténtalo de nuevo más tarde.'
          }
        />
      )
    }
  }

  const enviarEmailRecuperacion = async (email: string) => {
    try {
      const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email
      })

      if (error) throw error

      toast.success(
        <ToastCustom
          title="Email enviado"
          message={`Se ha enviado un email de recuperación a ${email}`}
        />
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'
      toast.error(
        <ToastCustom
          title="Error al enviar email"
          message={
            errorMessage ||
            'No se pudo enviar el email de recuperación. Por favor, inténtalo de nuevo más tarde.'
          }
        />
      )
    }
  }

  const alternarBaneoUsuario = async (userId: string, banear: boolean) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: banear ? '24h' : 'none'
      })

      if (error) throw error

      toast.success(
        <ToastCustom
          title={banear ? 'Usuario baneado' : 'Usuario desbaneado'}
          message={`El usuario ha sido ${
            banear ? 'baneado' : 'desbaneado'
          } exitosamente`}
        />
      )

      cargarUsuarios(paginaActual, busqueda)
    } catch (error) {
      console.error('Error alternando baneo de usuario:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'
      toast.error(
        <ToastCustom
          title="Error al alternar baneo"
          message={
            errorMessage ||
            'No se pudo alternar el estado de baneo del usuario. Por favor, inténtalo de nuevo más tarde.'
          }
        />
      )
    }
  }

  useEffect(() => {
    cargarUsuarios(paginaActual, busqueda)
  }, [paginaActual])

  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault()
    setPaginaActual(1)
    cargarUsuarios(1, busqueda)
  }

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Nunca'
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPaginas = Math.ceil(totalUsuarios / usuariosPorPagina)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administración de Usuarios
          </CardTitle>
          <CardDescription>
            Gestiona los usuarios registrados en tu aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de herramientas */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <form
              onSubmit={handleBusqueda}
              className="flex gap-2 flex-1 max-w-md"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email o teléfono..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                Buscar
              </Button>
            </form>

            <div className="flex gap-2">
              <Button
                onClick={() => cargarUsuarios(paginaActual, busqueda)}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>

              <Dialog open={dialogoCrear} onOpenChange={setDialogoCrear}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>
                      Crea un nuevo usuario en el sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={nuevoUsuario.email}
                        onChange={(e) =>
                          setNuevoUsuario({
                            ...nuevoUsuario,
                            email: e.target.value
                          })
                        }
                        placeholder="usuario@ejemplo.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Contraseña *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={nuevoUsuario.password}
                        onChange={(e) =>
                          setNuevoUsuario({
                            ...nuevoUsuario,
                            password: e.target.value
                          })
                        }
                        placeholder="Contraseña segura"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono (opcional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={nuevoUsuario.phone}
                        onChange={(e) =>
                          setNuevoUsuario({
                            ...nuevoUsuario,
                            phone: e.target.value
                          })
                        }
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogoCrear(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={crearUsuario}>Crear Usuario</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargando ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                ) : usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{usuario.email}</div>
                          {usuario.phone && (
                            <div className="text-sm text-muted-foreground">
                              {usuario.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              usuario.email_confirmed_at
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {usuario.email_confirmed_at
                              ? 'Email verificado'
                              : 'Email pendiente'}
                          </Badge>
                          {usuario.phone_confirmed_at && (
                            <Badge variant="default">Teléfono verificado</Badge>
                          )}
                          {usuario.banned_until && (
                            <Badge variant="destructive">Baneado</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatearFecha(usuario.created_at)}
                      </TableCell>
                      <TableCell>
                        {formatearFecha(usuario.last_sign_in_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                enviarEmailRecuperacion(usuario.email)
                              }
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Enviar recuperación
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                alternarBaneoUsuario(
                                  usuario.id,
                                  !usuario.banned_until
                                )
                              }
                            >
                              {usuario.banned_until ? (
                                <>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Desbanear usuario
                                </>
                              ) : (
                                <>
                                  <ShieldOff className="h-4 w-4 mr-2" />
                                  Banear usuario
                                </>
                              )}
                            </DropdownMenuItem>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar usuario
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    ¿Estás seguro?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se
                                    eliminará permanentemente el usuario{' '}
                                    {usuario.email} y todos sus datos asociados.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => eliminarUsuario(usuario.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {(paginaActual - 1) * usuariosPorPagina + 1} a{' '}
                {Math.min(paginaActual * usuariosPorPagina, totalUsuarios)} de{' '}
                {totalUsuarios} usuarios
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
