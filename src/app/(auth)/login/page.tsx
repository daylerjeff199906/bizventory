import { LoginForm } from '@/components/app/login-form'
import { APP_URLS } from '@/config/app-urls'
import { getSupabaseSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await getSupabaseSession()

  if (session) {
    redirect(APP_URLS.BASE)
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
      <footer className="absolute bottom-4 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Bizventory Inc. Todos los derechos reservados.
      </footer>
    </div>
  )
}
