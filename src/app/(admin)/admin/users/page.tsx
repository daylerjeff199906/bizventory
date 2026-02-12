import { createClient } from '@/utils/supabase/server'
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

export default async function UsersAdminPage() {
    const supabase = await createClient()
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
                {/* Add User Button could go here */}
            </div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Super Admin</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user: any) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.first_name || '-'} {user.last_name || ''}</TableCell>
                                <TableCell>
                                    <Badge variant={user.is_active ? 'default' : 'destructive'}>
                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.is_super_admin ? 'Sí' : 'No'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Editar</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!users?.length && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No se encontraron usuarios.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
