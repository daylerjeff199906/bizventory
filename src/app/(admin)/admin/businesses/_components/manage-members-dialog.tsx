'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Search, UserPlus, Trash2, Loader2 } from 'lucide-react'
import {
    addMemberToBusinessAction,
    getBusinessMembersAction,
    removeMemberFromBusinessAction,
    searchUsersAction
} from '../../_actions'
import { toast } from 'react-toastify'

interface ManageMembersDialogProps {
    business: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ManageMembersDialog({ business, open, onOpenChange }: ManageMembersDialogProps) {
    const [members, setMembers] = useState<any[]>([])
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        if (open && business?.id) {
            fetchMembers()
        }
    }, [open, business?.id])

    async function fetchMembers() {
        setIsLoading(true)
        const result = await getBusinessMembersAction(business.id)
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
        const result = await addMemberToBusinessAction(business.id, userId, ['admin'])
        if (result.success) {
            toast.success('Miembro añadido')
            fetchMembers()
            setSearchResults([])
            setSearchQuery('')
        } else {
            toast.error(result.error || 'Error al añadir miembro')
        }
    }

    async function removeMember(memberId: string) {
        const result = await removeMemberFromBusinessAction(memberId)
        if (result.success) {
            toast.success('Miembro eliminado')
            fetchMembers()
        } else {
            toast.error(result.error || 'Error al eliminar miembro')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-base">Gestionar Miembros - {business.business_name}</DialogTitle>
                    <DialogDescription className="text-sm">
                        Añade o elimina usuarios que tienen acceso a este negocio.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Search Section */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Añadir Nuevo Miembro</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Buscar por email o nombre..."
                                className="text-sm h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button size="sm" onClick={handleSearch} disabled={isSearching} className="h-9">
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                        </div>

                        {searchResults.length > 0 && (
                            <div className="mt-2 border rounded-md divide-y overflow-hidden">
                                {searchResults.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-2 bg-muted/30">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
                                            <span className="text-[11px] text-muted-foreground">{user.email}</span>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => addMember(user.id)}>
                                            <UserPlus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Members List */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Miembros Actuales</label>
                        <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                            ) : members.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">No hay miembros asignados.</div>
                            ) : (
                                members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-2">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {member.user?.first_name} {member.user?.last_name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] text-muted-foreground">{member.user?.email}</span>
                                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                                    {member.roles?.[0] || 'Member'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeMember(member.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
