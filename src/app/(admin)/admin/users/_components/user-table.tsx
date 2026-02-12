'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Key, Shield, UserX } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { resetUserPasswordAction } from '../../_actions'
import { toast } from 'react-toastify'

interface UserTableProps {
    users: any[]
}

export function UserTable({ users }: UserTableProps) {
    async function handleResetPassword(email: string) {
        toast.promise(resetUserPasswordAction(email), {
            pending: 'Enviando correo de recuperación...',
            success: 'Correo enviado correctamente',
            error: 'Error al enviar el correo'
        })
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-xs">Nombre</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs text-center">Super Admin</TableHead>
                        <TableHead className="text-xs text-center">Estado</TableHead>
                        <TableHead className="text-xs text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground text-sm">
                                No hay usuarios registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium text-sm">
                                    {user.first_name} {user.last_name}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {user.email}
                                </TableCell>
                                <TableCell className="text-center">
                                    {user.is_super_admin ? (
                                        <Badge variant="default" className="text-[10px] px-2 py-0">Sí</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] px-2 py-0">No</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={user.is_active ? 'default' : 'secondary'} className="text-[10px] px-2 py-0 bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200">
                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel className="text-xs">Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                className="text-sm"
                                                onClick={() => handleResetPassword(user.email)}
                                            >
                                                <Key className="mr-2 h-4 w-4" />
                                                Enviar Password Reset
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-sm">
                                                <Shield className="mr-2 h-4 w-4" />
                                                Cambiar Permisos
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm text-destructive">
                                                <UserX className="mr-2 h-4 w-4" />
                                                Desactivar Usuario
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
