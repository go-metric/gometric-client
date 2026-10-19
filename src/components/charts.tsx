import { cn } from "@/lib/utils"

/** Dependency-free SVG line chart that stretches to its container. */
export function Sparkline({
  points,
  className,
  stroke = "var(--brand)",
  fill = true,
}: {
  points: number[]
  className?: string
  stroke?: string
  fill?: boolean
}) {
  const w = 100
  const h = 32
  const max = Math.max(...points)
  const min = Math.min(...points)
  const line = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / (max - min || 1)) * (h - 4) - 2
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-8 w-full", className)}
      aria-hidden
    >
      {fill ? <path d={`${line} L${w},${h} L0,${h} Z`} fill={stroke} opacity={0.12} /> : null}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Faint horizontal rules behind a chart plot area. */
function Gridlines({ lines = 3 }: { lines?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="block border-t border-foreground/6" />
      ))}
    </div>
  )
}

function AxisLabels({ labels }: { labels: string[] }) {
  return (
    <div className="flex gap-1.5">
      {labels.map((l, i) => (
        <span key={i} className="flex-1 truncate text-center text-[10px] text-muted-foreground">
          {l}
        </span>
      ))}
    </div>
  )
}

export function BarChart({
  values,
  labels,
  titles,
  highlight = values.length - 1,
  color,
  className,
}: {
  values: number[]
  labels?: string[]
  /** Native hover tooltip for each bar. */
  titles?: string[]
  highlight?: number
  /** Series colour; defaults to the brand colour with neutral bars behind the highlight. */
  color?: string
  className?: string
}) {
  const max = Math.max(...values, 1)
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative flex min-h-0 flex-1 items-end gap-1.5">
        <Gridlines />
        {values.map((v, i) => (
          <div key={i} title={titles?.[i]} className="relative flex h-full flex-1 flex-col justify-end">
            <div
              className={cn(
                "rounded-t-md transition-colors",
                !color && (i === highlight ? "bg-brand" : "bg-foreground/12")
              )}
              style={{
                height: `${Math.max((v / max) * 100, 1)}%`,
                ...(color
                  ? { background: i === highlight ? color : `color-mix(in oklab, ${color} 30%, transparent)` }
                  : null),
              }}
            />
          </div>
        ))}
      </div>
      {labels ? <AxisLabels labels={labels} /> : null}
    </div>
  )
}

export function DonutChart({
  items,
  centerValue,
  centerLabel,
  className,
}: {
  items: { label: string; value: number; color: string }[]
  centerValue?: string
  centerLabel?: string
  className?: string
}) {
  const total = items.reduce((sum, i) => sum + i.value, 0) || 1
  const starts = items.map((_, i) => items.slice(0, i).reduce((sum, it) => sum + it.value, 0))
  return (
    <div className={cn("relative aspect-square", className)}>
      <svg viewBox="0 0 42 42" className="size-full" role="img" aria-label={items.map((i) => `${i.label} ${Math.round((i.value / total) * 100)}%`).join(", ")}>
        <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--muted)" strokeWidth="5" />
        {items.map((item, i) => {
          const share = (item.value / total) * 100
          const gap = items.length > 1 ? Math.min(0.8, share / 2) : 0
          const el = (
            <circle
              key={item.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="none"
              stroke={item.color}
              strokeWidth="5"
              strokeDasharray={`${Math.max(share - gap, 0)} ${100 - Math.max(share - gap, 0)}`}
              strokeDashoffset={25 - (starts[i]! / total) * 100}
            >
              <title>{`${item.label}: ${Math.round(share)}%`}</title>
            </circle>
          )
          return el
        })}
      </svg>
      {centerValue ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-semibold tracking-tight sm:text-2xl">{centerValue}</span>
          {centerLabel ? <span className="text-[11px] text-muted-foreground">{centerLabel}</span> : null}
        </div>
      ) : null}
    </div>
  )
}

export function ChartLegend({ items, className }: { items: { label: string; color: string }[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground", className)}>
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

/** Weekday × time-of-day grid; cell intensity follows the value (0–100). */
export function Heatmap({
  days,
  slots,
  values,
  best,
  color = "var(--brand)",
  className,
}: {
  days: string[]
  slots: string[]
  /** Cells with no posts are `null` and render empty. */
  values: (number | null)[][]
  best?: { day: string; slot: string }
  color?: string
  className?: string
}) {
  return (
    <div
      role="img"
      aria-label={best ? `Best time to post: ${best.day} around ${best.slot}` : "Best times to post"}
      className={cn("grid gap-1.5", className)}
      style={{ gridTemplateColumns: `auto repeat(${slots.length}, minmax(0, 1fr))` }}
    >
      <span />
      {slots.map((slot) => (
        <span key={slot} className="text-center text-[10px] text-muted-foreground">
          {slot}
        </span>
      ))}
      {days.map((day, d) => (
        <div key={day} className="contents">
          <span className="flex items-center pr-1 text-[11px] text-muted-foreground">{day}</span>
          {slots.map((slot, s) => {
            const v = values[d]?.[s] ?? null
            const isBest = best?.day === day && best.slot === slot
            return (
              <span
                key={slot}
                title={v === null ? `${day} ${slot}: no posts` : `${day} ${slot}: ${v}/100`}
                className={cn("h-7 rounded-md", isBest && "ring-2 ring-foreground/70 ring-offset-1 ring-offset-card")}
                style={{ background: v === null ? "var(--muted)" : `color-mix(in oklab, ${color} ${Math.round(8 + v * 0.92)}%, var(--muted))` }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function ProgressBar({
  value,
  color = "var(--brand)",
  className,
}: {
  value: number
  color?: string
  className?: string
}) {
  return (
    <span className={cn("block h-1.5 overflow-hidden rounded-full bg-muted", className)}>
      <span
        className="block h-full rounded-full"
        style={{ width: `${Math.min(100, value)}%`, background: color }}
      />
    </span>
  )
}
