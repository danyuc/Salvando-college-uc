import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/auth', '/onboarding', '/lab-ambiental', '/cardenal-respira', '/precalculo-full']

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const message =
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY for Supabase proxy authentication.'

    if (process.env.NODE_ENV !== 'production') {
      console.warn(`${message} Skipping auth proxy in local development.`)
      return res
    }

    throw new Error(message)
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data } = await supabase.auth.getSession()
  const user = data.session?.user ?? null

  const path = req.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some((route) => path.startsWith(route))
  const isDocenciaReview =
    req.cookies.get('salvando-docencia-review-access')?.value === 'true'
  const isReviewableStudentRoute =
    path.startsWith('/practica') ||
    path.startsWith('/precalculo-full') ||
    path.startsWith('/calendario')

  if (!user && isDocenciaReview && isReviewableStudentRoute) {
    return res
  }

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (user && path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)'],
}
