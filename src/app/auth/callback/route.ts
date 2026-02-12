import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { createSupabaseSession } from '@/lib/session'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.session && data.user) {
            // Create the custom session cookie required by the application
            await createSupabaseSession({
                user: data.user as any,
                session: data.session as any
            })
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
