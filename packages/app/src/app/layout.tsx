import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Streamline — Veille tech',
  description:
    'Agrège les repos GitHub trending et les articles Dev.to dans un tableau de bord unifié',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-zinc-50 min-h-screen">{children}</body>
    </html>
  )
}
