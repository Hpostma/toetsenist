import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname !== '/' // Homepage mag openbaar blijven? Of niet? Homepage start de wizard.
        // Laten we zeggen: Homepage is open, Dashboard is protected.
        // Maar homepage start wizard -> wizard upload -> upload API.
        // Upload API mag alleen voor auth users? 
        // Voor MVP: Laat homepage open, maar dwing login af vóór dashboard.
        // Wacht, als iemand een toets doet, moet hij gekoppeld worden aan een user.
        // Dus eigenlijk moet je inloggen VOORDAT je een toets begint, of tijdens.
        // Laten we simpel beginnen: Login verplicht voor ALLES behalve login pagina en auth routes.
        // Of: Login verplicht voor Dashboard en Rapport. Homepage = 'Try it out' of 'Login first'.
        // Ik maak het simpel: Login required for protected routes only (/dashboard, /rapport).
    ) {
        if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/rapport') || request.nextUrl.pathname === '/') {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    return response
}
