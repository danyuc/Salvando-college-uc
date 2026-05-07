import type { Metadata } from 'next'
import './globals.css'
import GlobalSidebar from './components/GlobalSidebar'
import CommandPalette from './components/CommandPalette'
import AppShell from './components/AppShell'

export const metadata: Metadata = {
  title: 'Salvando College UC',
  description: 'Plataforma de estudio UC',
}

import { inter } from './fonts'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.variable} style={{ margin: 0, fontFamily: 'var(--font-inter)' }}>
        <AppShell>
          <CommandPalette />
          <GlobalSidebar />
<div style={{marginLeft:'260px'}}>{children}</div>
        </AppShell>
      </body>
    </html>
  )
}
