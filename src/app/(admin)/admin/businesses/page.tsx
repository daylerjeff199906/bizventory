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

export default async function BusinessesAdminPage() {
    const supabase = await createClient()

    // Fetch businesses, ordering by creation date
    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestión de Negocios</h2>
                <Button>Crear Negocio</Button>
            </div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Creado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {businesses?.map((business: any) => (
                            <TableRow key={business.id}>
                                <TableCell className="font-medium">{business.name}</TableCell>
                                <TableCell>
                                    <Badge variant={business.is_active || business.status === 'active' ? 'default' : 'secondary'}>
                                        {business.status || (business.is_active ? 'Activo' : 'Inactivo')}
                                    </Badge>
                                </TableCell>
                                <TableCell>{business.created_at ? new Date(business.created_at).toLocaleDateString() : '-'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Administrar</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!businesses?.length && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No se encontraron negocios.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
