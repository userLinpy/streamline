'use client'

import { useState, Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/ui/app-sidebar'

const HIDDEN_PATHS = ['/login', '/register']

function SidebarSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-40
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
        border-r border-slate-700
        -translate-x-full lg:translate-x-0
        w-64 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}
    />
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const showSidebar = !HIDDEN_PATHS.includes(pathname)

  return (
    <div className="flex min-h-screen">
      {showSidebar && (
        <Suspense fallback={<SidebarSkeleton isCollapsed={isCollapsed} />}>
          <AppSidebar
            isCollapsed={isCollapsed}
            onCollapsedChange={setIsCollapsed}
          />
        </Suspense>
      )}
      <div
        className={
          showSidebar
            ? `flex-1 transition-[margin] duration-300 ease-in-out ${
                isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
              }`
            : 'flex-1'
        }
      >
        {children}
      </div>
    </div>
  )
}
