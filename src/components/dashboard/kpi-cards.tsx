import { Info } from "lucide-react"
import { DeltaBadge } from "@/components/dashboard/ui"
import { Skeleton } from "@/components/ui/skeleton"
import type { Metric } from "@/lib/api/types"
import { formatCompact } from "@/lib/format"
import { cn } from "@/lib/utils"

/** `null` is "not reported" and must never look like a real zero. */
export function formatMetric(metric: Pick<Metric, "value" | "format">) {
  if (metric.value === null) return "Not available"
  return metric.format === "percent" ? `${metric.value}%` : formatCompact(metric.value)
}

const cardClass = "min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5"

export function KpiCards({
  kpis,
  cardClassName,
  skeletons = 4,
  className,
}: {
  kpis: Metric[] | undefined
  cardClassName?: string
  skeletons?: number
  className?: string
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4", className)}>
      {kpis
        ? kpis.map((kpi) => (
            <li key={kpi.id} className={cn(cardClass, cardClassName)}>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{kpi.label}</p>
                {kpi.change !== null ? <DeltaBadge value={kpi.change} /> : null}
              </div>
              <p
                className={cn(
                  "mt-2 font-semibold tracking-tight",
                  kpi.value === null ? "text-lg text-muted-foreground sm:text-xl" : "text-2xl sm:text-3xl"
                )}
              >
                {formatMetric(kpi)}
              </p>
              {kpi.note ? (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  <span className="line-clamp-3" title={kpi.note}>
                    {kpi.note}
                  </span>
                </p>
              ) : null}
            </li>
          ))
        : Array.from({ length: skeletons }, (_, i) => (
            <li key={i} className={cn(cardClass, cardClassName)}>
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="mt-3 h-8 w-2/3" />
            </li>
          ))}
    </ul>
  )
}
