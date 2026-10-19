import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { AccountStatus, PostStatus } from "@/lib/api/types"
import { errorMessage } from "@/lib/api/errors"
import { formatChange } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {description ? <p className="mt-1.5 text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

/** White content card used across dashboard screens. */
export function Panel({
  title,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode
  action?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-3xl border border-border bg-card", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
          <h2 className="text-base font-semibold">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={cn("flex-1 p-5 sm:p-6", title && "pt-4 sm:pt-4", bodyClassName)}>{children}</div>
    </section>
  )
}

export function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
      {children}
      <ArrowRight className="size-3.5" />
    </Link>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-4 py-10 text-center", className)}>
      {icon ? <span className="mb-1 text-muted-foreground [&_svg]:size-7">{icon}</span> : null}
      <p className="text-sm font-semibold">{title}</p>
      {description ? <p className="max-w-xs text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <EmptyState
      title="Couldn't load this"
      description={errorMessage(error)}
      action={
        onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw data-icon="inline-start" />
            Try again
          </Button>
        ) : null
      }
    />
  )
}

export function ListSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

const postStatusStyles: Record<PostStatus, string> = {
  scheduled: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  published: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  draft: "bg-foreground/8 text-foreground/70",
}

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", postStatusStyles[status])}>
      {status}
    </span>
  )
}

const accountStatusStyles: Record<AccountStatus, { label: string; className: string }> = {
  connected: { label: "Connected", className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  expiring: { label: "Reconnect soon", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  expired: { label: "Reconnect required", className: "bg-red-500/12 text-red-700 dark:text-red-300" },
  disconnected: { label: "Not connected", className: "bg-foreground/8 text-foreground/60" },
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const { label, className } = accountStatusStyles[status]
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", className)}>{label}</span>
}

export function DeltaBadge({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
        value < 0
          ? "bg-red-500/12 text-red-700 dark:text-red-300"
          : "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
      )}
    >
      {formatChange(value)}
    </span>
  )
}

export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:text-foreground aria-checked:bg-card aria-checked:text-foreground aria-checked:shadow-sm"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
