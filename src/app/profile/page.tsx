import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"
import { SecurityForm } from "./security-form"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/app/header-section"

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const userData = {
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        email: user.email || '',
        avatar_url: profile?.avatar_url || '',
    }

    const initials = `${userData.first_name?.[0] || 'U'}${userData.last_name?.[0] || ''}`.toUpperCase()

    return (
        <div className="space-y-6">
            <PageHeader
                title="Mi Perfil"
                description="Gestiona tu información personal y seguridad"
            />
            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={userData.avatar_url} alt={initials} />
                                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle>{userData.first_name} {userData.last_name}</CardTitle>
                            <CardDescription>{userData.email}</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Tabs defaultValue="account" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="account">Información Personal</TabsTrigger>
                            <TabsTrigger value="security">Seguridad</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <ProfileForm initialData={userData} />
                        </TabsContent>
                        <TabsContent value="security">
                            <SecurityForm />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
