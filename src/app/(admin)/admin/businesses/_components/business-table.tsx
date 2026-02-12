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
import { MoreHorizontal, UserPlus, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { BusinessForm } from '@/schemas/business/register.busines'
import { ManageMembersDialog } from './manage-members-dialog'

interface BusinessTableProps {
    businesses: any[]
}

export function BusinessTable({ businesses }: BusinessTableProps) {
    const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null)
    const [isMembersOpen, setIsMembersOpen] = useState(false)

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-xs">Nombre</TableHead>
                        <TableHead className="text-xs">Tipo</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs text-center">Estado</TableHead>
                        <TableHead className="text-xs text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {businesses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground text-sm">
                                No hay negocios registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        businesses.map((business) => (
                            <TableRow key={business.id}>
                                <TableCell className="font-medium text-sm">
                                    {business.business_name}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {business.business_type}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {business.business_email}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={business.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0">
                                        {business.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
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
                                                onClick={() => {
                                                    setSelectedBusiness(business)
                                                    setIsMembersOpen(true)
                                                }}
                                            >
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Gestionar Miembros
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-sm">
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-sm text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {selectedBusiness && (
                <ManageMembersDialog
                    business={selectedBusiness}
                    open={isMembersOpen}
                    onOpenChange={setIsMembersOpen}
                />
            )}
        </div>
    )
}
