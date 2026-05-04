'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()

  if (pathname === '/' || pathname === '/login') return null

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) router.back()
        else router.push('/')
      }}
      style={{
        margin: '14px 0 0 14px',
        padding: '10px 14px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.14)',
        color: 'white',
        fontWeight: 800,
        cursor: 'pointer',
      }}
    >
      ← Volver
    </button>
  )
}
