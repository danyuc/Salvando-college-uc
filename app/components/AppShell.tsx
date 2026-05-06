'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getLocalUser, type LocalUser } from '@/lib/local-user'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [localUser, setLocalUser] = useState<LocalUser | null>(null)

  useEffect(() => {
    const user = getLocalUser()
    setLocalUser(user?.email ? user : null)
  }, [pathname])

  const isLogin = pathname === '/login' || pathname.startsWith('/auth')
  const isOnboarding = pathname === '/onboarding'
  const isFullScreen = pathname.startsWith('/lab-ambiental')

  if (isLogin || isOnboarding || isFullScreen) {
    return <>{children}</>
  }

  return <>{children}</>
}
