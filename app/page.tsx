'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.replace('/login')
      }
    }

    check()
  }, [])

  return <p>Cargando...</p>
}