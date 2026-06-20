function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="h-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse border-b border-zinc-100 dark:border-zinc-800" />
      <div className="p-3 flex-1 space-y-2">
        <div className="h-3.5 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-full" />
        <div className="h-3.5 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-4/5" />
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-3/5 mt-1" />
      </div>
      <div className="px-3 pb-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-16" />
        <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-10" />
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">
          ⚡ Streamline
        </span>
        <div className="flex-1 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse shrink-0" />
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-3 py-2 flex gap-1.5">
        {['News', 'À lire', 'Favoris'].map(label => (
          <div key={label} className="h-7 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Filters placeholder */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-3 py-2.5 space-y-2">
        <div className="flex gap-1.5">
          {[80, 72, 88, 96].map(w => (
            <div key={w} className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Grid */}
      <main className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}
