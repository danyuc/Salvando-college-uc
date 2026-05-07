import type { Metadata } from 'next'
import './globals.css'
import CommandPalette from './components/CommandPalette'
import AppShell from './components/AppShell'
import { inter } from './fonts'

export const metadata: Metadata = {
  title: 'Salvando College UC',
  description: 'Plataforma de estudio UC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body
        className={inter.variable}
        style={{
          margin: 0,
          fontFamily: 'var(--font-inter)',
          background: '#020617',
        }}
      >
        <AppShell>
          <CommandPalette />
          {children}
        </AppShell>
      </body>
    </html>
  )
}
