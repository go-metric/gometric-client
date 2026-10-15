"use client"

import { useEffect, useState, Suspense, type ReactNode } from "react"
import { Menu, Plus, X } from "lucide-react"
import { NotificationsMenu } from "@/components/dashboard/shell/notifications-menu"
import { SearchBox } from "@/components/dashboard/shell/search-box"
import { Sidebar } from "@/components/dashboard/shell/sidebar"
import { UserMenu } from "@/components/dashboard/shell/user-menu"
import { ListSkeleton } from "@/components/dashboard/ui"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button, ButtonLink } from "@/components/ui/button"
import { routes } from "@/config/site"

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [drawerOpen])

  return (
    <div className="flex min-h-svh flex-1 bg-muted/40">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-r border-border bg-card lg:block">
        <Sidebar />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-card shadow-xl">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close navigation"
              className="absolute top-4 right-3 z-10"
              onClick={() => setDrawerOpen(false)}
            >
              <X />
            </Button>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-border bg-card/95 px-4 sm:gap-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open navigation"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu />
          </Button>
          <Suspense fallback={<div className="hidden flex-1 sm:block" />}>
            <SearchBox />
          </Suspense>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Suspense fallback={null}>
              <NotificationsMenu />
            </Suspense>
            <ButtonLink variant="ink" size="sm" className="px-3 sm:px-3.5" href={routes.dashboard.compose}>
              <Plus data-icon="inline-start" />
              <span className="hidden sm:inline">Create post</span>
            </ButtonLink>
            <Suspense fallback={<span className="ml-1 size-8 rounded-full bg-muted" />}>
              <UserMenu />
            </Suspense>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Suspense fallback={<ListSkeleton rows={6} />}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}
