import { Zap } from 'lucide-react'

export default function ReleaseLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-8">
      <header className="bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Zap size={14} /> Streamline</span>
        <div className="ml-auto h-7 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </header>

      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-3/4" />
              <div className="flex items-center gap-2 mt-1">
                <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse shrink-0" />
          </div>

          <div className="h-3 w-56 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse mb-6" />

          <div className="space-y-2">
            {[0.4, 1, 0.85, 0.9, 0.6, 1, 0.75, 0.9, 0.5].map((w, i) => (
              <div
                key={i}
                className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"
                style={{ width: `${w * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
