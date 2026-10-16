"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Suspense } from "react"
import { Check, ChevronsUpDown, Lock, Plus } from "lucide-react"
import { toast } from "sonner"
import { BrandWordmark } from "@/components/brand-wordmark"
import { dashboardFooterNav, dashboardNav, isNavActive, type DashboardNavItem } from "@/components/dashboard/nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { routes } from "@/config/site"
import { formatCompact, initials } from "@/lib/format"
import { useAccounts } from "@/lib/queries/accounts"
import { useUnreadCount } from "@/lib/queries/inbox"
import { useSetActiveBrand, useWorkspace } from "@/lib/queries/workspace"
import { cn } from "@/lib/utils"

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className="px-2 pt-1">
        <BrandWordmark size="sm" showIcon href={routes.dashboard.overview} />
      </div>

      <Suspense fallback={<BrandCardSkeleton />}>
        <BrandSwitcher onNavigate={onNavigate} />
      </Suspense>

      <nav aria-label="Dashboard" className="flex-1">
        <NavList items={dashboardNav} onNavigate={onNavigate} />
      </nav>

      <Suspense fallback={null}>
        <LinkedAccountsCard onNavigate={onNavigate} />
      </Suspense>

      <NavList items={dashboardFooterNav} onNavigate={onNavigate} />
    </div>
  )
}

function BrandCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border p-2.5">
      <Skeleton className="size-9 rounded-xl" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

function BrandSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter()
  const { data } = useWorkspace()
  const switchBrand = useSetActiveBrand()

  if (!data) return <BrandCardSkeleton />

  const active = data.brands.find((b) => b.id === data.activeBrandId) ?? data.brands[0]

  if (!active) {
    return (
      <Link
        href={routes.dashboard.brands}
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-2.5 transition-colors hover:bg-muted/60"
      >
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Plus className="size-4" />
        </span>
        <span className="min-w-0 text-sm font-semibold">Add a brand</span>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border p-2.5 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink text-xs font-semibold text-ink-foreground">
          {initials(active.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{active.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{active.handle}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 rounded-xl p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
            Switch brand
          </DropdownMenuLabel>
          {data.brands.map((brand) => {
            const isActive = brand.id === data.activeBrandId
            return (
              <DropdownMenuItem
                key={brand.id}
                className="py-2"
                onClick={() => {
                  if (isActive) return
                  switchBrand.mutate(brand.id, {
                    onSuccess: () => {
                      toast.success(`Switched to ${brand.name}`)
                      onNavigate?.()
                    },
                  })
                }}
              >
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-ink text-[10px] font-semibold text-ink-foreground">
                  {initials(brand.name)}
                </span>
                <span className="min-w-0 flex-1 truncate">{brand.name}</span>
                {brand.locked ? <Lock className="size-3.5 text-amber-600 dark:text-amber-300" aria-label="Locked" /> : null}
                {isActive ? <Check className="size-4 text-brand" /> : null}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="py-2"
          onClick={() => {
            router.push(routes.dashboard.brands)
            onNavigate?.()
          }}
        >
          <Plus />
          Manage brands
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LinkedAccountsCard({ onNavigate }: { onNavigate?: () => void }) {
  const { data: accounts } = useAccounts()
  if (!accounts) return null
  const linked = accounts.filter((a) => a.status !== "disconnected")
  const followers = linked.reduce((sum, a) => sum + (a.followers ?? 0), 0)
  const allLinked = linked.length === accounts.length
  if (accounts.length === 0) return null

  return (
    <Link
      href={routes.dashboard.accounts}
      onClick={onNavigate}
      className="rounded-2xl bg-tint-lime p-4 transition-opacity hover:opacity-90"
    >
      <p className="text-sm font-semibold">
        {linked.length} of {accounts.length} networks linked
      </p>
      <span className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-foreground/10">
        <span
          className="block h-full rounded-full bg-foreground transition-[width]"
          style={{ width: `${(linked.length / accounts.length) * 100}%` }}
        />
      </span>
      <p className="mt-2 text-xs text-foreground/70">
        {allLinked ? `${formatCompact(followers)} followers in total` : "Connect the rest →"}
      </p>
    </Link>
  )
}

function UnreadBadge() {
  const { data: count } = useUnreadCount()
  if (!count) return null
  return <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">{count}</span>
}

function NavList({ items, onNavigate }: { items: DashboardNavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <ul className="space-y-1">
      {items.map(({ href, label, Icon, showUnread }) => {
        const active = isNavActive(pathname, href)
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-ink text-ink-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-[1.1rem]" />
              <span className="flex-1">{label}</span>
              {showUnread ? (
                <Suspense fallback={null}>
                  <UnreadBadge />
                </Suspense>
              ) : null}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
