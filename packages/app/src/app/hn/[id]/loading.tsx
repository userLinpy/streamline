export default function HNLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-8">
      <header className="bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">⚡ Streamline</span>
        <div className="ml-auto h-7 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </header>

      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-start gap-2 mb-4">
            <span className="text-orange-200 dark:text-orange-900 text-lg font-bold shrink-0">▲</span>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-full" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-4/5" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            {[48, 72, 56, 80].map(w => (
              <div key={w} className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" style={{ width: w }} />
            ))}
          </div>

          <div className="space-y-2 mb-6">
            {[1, 0.9, 0.7, 1, 0.8].map((w, i) => (
              <div
                key={i}
                className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"
                style={{ width: `${w * 100}%` }}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <div className="h-9 w-32 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
            <div className="h-9 w-36 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
