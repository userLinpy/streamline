import { Zap } from 'lucide-react'

export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-8">
      <header className="bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Zap size={14} /> Streamline</span>
        <div className="ml-auto h-7 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </header>

      <article className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 mt-4 mx-3 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="h-5 w-14 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
          <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-full" />
          <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-3/4" />
          <div className="flex gap-4 pt-1">
            <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-12 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>

        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
        </div>

        <div className="p-6 space-y-3">
          {[1, 0.9, 0.75, 1, 0.6, 0.85, 1, 0.7, 0.5, 1, 0.9, 0.8].map((w, i) => (
            <div
              key={i}
              className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"
              style={{ width: `${w * 100}%` }}
            />
          ))}
        </div>
      </article>
    </div>
  )
}
