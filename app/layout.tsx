import type { Metadata } from 'next'
import './globals.css'
import CommandPalette from './components/CommandPalette'
import AppShell from './components/AppShell'

export const metadata: Metadata = {
  title: 'Salvando College UC',
  description: 'Plataforma de estudio UC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>
        <AppShell>
          <CommandPalette />
          {children}
        </AppShell>
      </body>
    </html>
  )
}
