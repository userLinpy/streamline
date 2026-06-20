import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Streamline — Veille tech',
  description: 'Dashboard de veille technologique : GitHub, Dev.to, Hacker News',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Initialise le mode sombre avant hydration pour éviter le flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('streamline-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
        {children}
      </body>
    </html>
  )
}
