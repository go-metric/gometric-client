import { Sparkline } from "@/components/charts"
import { DeltaBadge } from "@/components/dashboard/ui"
import { Skeleton } from "@/components/ui/skeleton"
import type { Kpi, Stat } from "@/lib/api/types"
import { formatCompact, formatCurrency, formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"

export function formatKpi(kpi: Pick<Stat, "value" | "format">) {
  switch (kpi.format) {
    case "percent":
      return `${kpi.value}%`
    case "duration":
      return formatDuration(kpi.value)
    case "rating":
      return `${kpi.value.toFixed(1)} ★`
    case "currency":
      return formatCurrency(kpi.value)
    default:
      return formatCompact(kpi.value)
  }
}

const cardClass = "min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5"

export function KpiCards({
  kpis,
  accent,
  cardClassName,
  skeletons = 4,
  compact = false,
  className,
}: {
  kpis: Kpi[] | undefined
  /** Sparkline colour; defaults to the brand colour. */
  accent?: string
  cardClassName?: string
  skeletons?: number
  /** Drops the sparkline for a lighter, denser row of numbers. */
  compact?: boolean
  className?: string
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4", className)}>
      {kpis
        ? kpis.map((kpi) => (
            <li key={kpi.id} className={cn(cardClass, cardClassName)}>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{kpi.label}</p>
                <DeltaBadge value={kpi.change} />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{formatKpi(kpi)}</p>
              {compact ? null : <Sparkline points={kpi.series} stroke={accent} className="mt-3 h-10" />}
            </li>
          ))
        : Array.from({ length: skeletons }, (_, i) => (
            <li key={i} className={cn(cardClass, cardClassName)}>
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="mt-3 h-8 w-2/3" />
              {compact ? null : <Skeleton className="mt-3 h-10 w-full" />}
            </li>
          ))}
    </ul>
  )
}
