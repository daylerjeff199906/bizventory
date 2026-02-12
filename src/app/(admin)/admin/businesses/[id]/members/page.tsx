'use client'

import { useState, useEffect, use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, UserPlus, Trash2, Loader2, ChevronLeft, Shield } from 'lucide-react'
import {
    addMemberToBusinessAction,
    getBusinessMembersAction,
    removeMemberFromBusinessAction,
    searchUsersAction,
    updateMemberRoleAction
} from '../../../_actions'
import { toast } from 'react-toastify'
import Link from 'next/link'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function BusinessMembersPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const businessId = resolvedParams.id

    const [members, setMembers] = useState<any[]>([])
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSearching, setIsSearching] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [memberToDelete, setMemberToDelete] = useState<any | null>(null)

    useEffect(() => {
        if (businessId) {
            fetchMembers()
        }
    }, [businessId])

    async function fetchMembers() {
        setIsLoading(true)
        const result = await getBusinessMembersAction(businessId)
        if (result.success) {
            setMembers(result.data || [])
        }
        setIsLoading(false)
    }

    async function handleSearch() {
        if (!searchQuery.trim()) return
        setIsSearching(true)
        const result = await searchUsersAction(searchQuery)
        if (result.success) {
            setSearchResults(result.data || [])
        }
        setIsSearching(false)
    }

    async function addMember(userId: string) {
        const result = await addMemberToBusinessAction(businessId, userId, ['admin'])
        if (result.success) {
            toast.success('Miembro añadido')
            fetchMembers()
            setSearchResults([])
            setSearchQuery('')
        } else {
            toast.error(result.error || 'Error al añadir miembro')
        }
    }

    async function removeMember() {
        if (!memberToDelete) return
        setIsDeleting(true)
        const result = await removeMemberFromBusinessAction(memberToDelete.id)
        if (result.success) {
            toast.success('Miembro eliminado')
            fetchMembers()
        } else {
            toast.error(result.error || 'Error al eliminar miembro')
        }
        setIsDeleting(false)
        setMemberToDelete(null)
    }

    async function updateRole(memberId: string, role: string) {
        const result = await updateMemberRoleAction(memberId, [role])
        if (result.success) {
            toast.success('Rol actualizado')
            fetchMembers()
        } else {
            toast.error(result.error || 'Error al actualizar rol')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="h-9 w-9 p-0">
                    <Link href="/admin/businesses">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestionar Miembros</h1>
                    <p className="text-muted-foreground text-sm">
                        Administra los usuarios y sus roles para este negocio.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search & Add Card */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Añadir Nuevo Miembro</CardTitle>
                        <CardDescription className="text-xs">
                            Busca usuarios por nombre o email para añadirlos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Buscar usuario..."
                                className="text-sm h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button size="sm" onClick={handleSearch} disabled={isSearching} className="h-9">
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {searchResults.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/30">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
                                        <span className="text-[11px] text-muted-foreground">{user.email}</span>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => addMember(user.id)}>
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {searchResults.length === 0 && searchQuery && !isSearching && (
                                <p className="text-center text-xs text-muted-foreground py-4">No se encontraron usuarios.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Current Members Card */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Miembros Actuales</CardTitle>
                        <CardDescription className="text-xs">
                            Lista de usuarios con acceso al negocio.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md divide-y">
                            {isLoading ? (
                                <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                            ) : members.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted-foreground">No hay miembros asignados a este negocio.</div>
                            ) : (
                                members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                {member.user?.first_name?.[0]}{member.user?.last_name?.[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {member.user?.first_name} {member.user?.last_name}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">{member.user?.email}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Select
                                                defaultValue={member.roles?.[0] || 'member'}
                                                onValueChange={(val) => updateRole(member.id, val)}
                                            >
                                                <SelectTrigger className="h-8 w-[110px] text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin" className="text-xs">Administrador</SelectItem>
                                                    <SelectItem value="member" className="text-xs">Miembro</SelectItem>
                                                    <SelectItem value="viewer" className="text-xs">Lector</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => setMemberToDelete(member)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas quitar a <span className="font-bold">{memberToDelete?.user?.first_name} {memberToDelete?.user?.last_name}</span> de este negocio?
                            Esta acción revocará su acceso de inmediato.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                removeMember()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
