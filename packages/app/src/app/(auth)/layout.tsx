import { Zap } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Zap size={18} />
          Streamline
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Votre veille tech,<br />
            partout, sur tous<br />
            vos appareils.
          </h2>
          <p className="text-zinc-400 text-sm">
            Synchronisez vos favoris, dépôts surveillés et historique de lecture sur tous vos appareils.
          </p>
        </div>
        <p className="text-zinc-600 text-xs">© 2026 Streamline</p>
      </div>

      <div className="flex items-center justify-center p-8 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
