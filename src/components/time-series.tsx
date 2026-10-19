"use client"

import { useId, useRef, useState, type PointerEvent } from "react"
import { formatCompact } from "@/lib/format"
import { cn } from "@/lib/utils"

export type TimeSeriesDef = { id: string; label: string; color: string }

export type TimeSeriesPoint = {
  /** Short x-axis label. */
  label: string
  /** Longer label for the tooltip. */
  detail?: string
  values: Partial<Record<string, number>>
}

type Pt = [number, number]

/** Smooth path through the points (Catmull-Rom converted to cubic Béziers). */
function smooth(pts: Pt[]) {
  if (pts.length === 0) return ""
  let d = `M${pts[0]![0].toFixed(2)},${pts[0]![1].toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[i + 2] ?? p2
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    const clamp = (y: number) => Math.min(100, Math.max(0, y))
    d += ` C${c1[0].toFixed(2)},${clamp(c1[1]).toFixed(2)} ${c2[0].toFixed(2)},${clamp(c2[1]).toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
  }
  return d
}

/** Round axis maximum with ~3 even steps. */
function niceScale(max: number) {
  if (max <= 0) return { step: 1, top: 3 }
  const raw = max / 3
  const pow = 10 ** Math.floor(Math.log10(raw))
  const base = [1, 2, 2.5, 5, 10].find((m) => m * pow >= raw)! * pow
  return { step: base, top: base * 3 }
}

function tickIndexes(n: number) {
  const step = n <= 8 ? 1 : Math.ceil((n - 1) / 4)
  const out: number[] = []
  for (let i = n - 1; i >= 0; i -= step) out.unshift(i)
  return out
}

/**
 * Smooth line chart with a soft transparent fill under each line, a y-axis,
 * thinned x-axis labels and a hover tooltip. Several series overlap.
 */
export function TimeSeriesChart({
  points,
  series,
  formatValue = formatCompact,
  formatAxis = formatCompact,
  className,
}: {
  points: TimeSeriesPoint[]
  series: TimeSeriesDef[]
  /** Tooltip values. */
  formatValue?: (value: number) => string
  /** Y-axis tick labels. */
  formatAxis?: (value: number) => string
  className?: string
}) {
  const uid = useId()
  const plotRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const n = points.length
  const multi = series.length > 1
  const totals = points.map((p) => series.reduce((sum, s) => sum + (p.values[s.id] ?? 0), 0))
  const dataMax = Math.max(...points.flatMap((p) => series.map((s) => p.values[s.id] ?? 0)), 0)
  const { step, top } = niceScale(dataMax)
  const ticks = [0, 1, 2, 3].map((i) => i * step)

  const x = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100)
  const y = (v: number) => 100 - (v / top) * 100

  // Each series is drawn on its own, so the fills overlap transparently.
  // A day a series has no data for is a gap, not a zero: the line breaks there.
  const edges = series.map((s) => points.map((p, i): Pt | null => (p.values[s.id] === undefined ? null : [x(i), y(p.values[s.id]!)])))
  const runs = edges.map((edge) => {
    const out: Pt[][] = []
    let cur: Pt[] = []
    for (const pt of edge) {
      if (pt) cur.push(pt)
      else if (cur.length) {
        out.push(cur)
        cur = []
      }
    }
    if (cur.length) out.push(cur)
    return out
  })
  // Largest series first, so the smaller ones stay visible on top.
  const sums = series.map((s) => points.reduce((sum, p) => sum + (p.values[s.id] ?? 0), 0))
  const drawOrder = series.map((_, k) => k).sort((a, b) => sums[b]! - sums[a]!)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = plotRef.current?.getBoundingClientRect()
    if (!rect || n === 0) return
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    setHover(n <= 1 ? 0 : Math.round(frac * (n - 1)))
  }

  const hx = hover === null ? 0 : x(hover)
  const hp = hover === null ? null : points[hover]!

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative min-h-0 flex-1 pr-3 pl-11">
        <div
          ref={plotRef}
          className="relative size-full touch-pan-y"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.map((t) => (
            <div key={t} className="pointer-events-none absolute inset-x-0" style={{ top: `${y(t)}%` }}>
              <span className="block border-t border-foreground/8" />
              <span className="absolute right-full mr-2 -translate-y-1/2 text-[11px] text-muted-foreground tabular-nums">
                {formatAxis(t)}
              </span>
            </div>
          ))}

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.id} id={`${uid}-${s.id}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={multi ? 0.16 : 0.32} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            {drawOrder.map((k) => {
              const s = series[k]!
              return (
                <g key={s.id}>
                  {runs[k]!.map((run, r) => {
                    if (run.length === 1) return null // a lone day is drawn as a dot below
                    const upper = smooth(run)
                    const lower = smooth(run.map(([px]): Pt => [px, 100]).reverse()).replace(/^M/, "L")
                    return (
                      <g key={r}>
                        <path d={`${upper} ${lower} Z`} fill={`url(#${uid}-${s.id})`} />
                        <path
                          d={upper}
                          fill="none"
                          stroke={s.color}
                          strokeWidth={2.25}
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    )
                  })}
                </g>
              )
            })}
          </svg>

          {(n <= 14 && hover === null) || runs.some((rs) => rs.some((r) => r.length === 1))
            ? edges.flatMap((edge, k) =>
                edge.map((pt, i) => {
                  if (!pt) return null
                  const lone = runs[k]!.some((r) => r.length === 1 && r[0] === pt)
                  if (!(lone || (n <= 14 && hover === null))) return null
                  const [px, py] = pt
                  return (
                  <span
                    key={`${k}-${i}`}
                    aria-hidden
                    className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card"
                    style={{ left: `${px}%`, top: `${py}%`, background: series[k]!.color }}
                  />
                  )
                })
              )
            : null}

          {hp ? (
            <>
              <span className="pointer-events-none absolute inset-y-0 w-px bg-foreground/25" style={{ left: `${hx}%` }} />
              {series.map((s, k) => (
                edges[k]![hover!] ? <span
                  key={s.id}
                  className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card"
                  style={{ left: `${hx}%`, top: `${edges[k]![hover!]![1]}%`, background: s.color }}
                /> : null
              ))}
              <div
                className={cn(
                  "pointer-events-none absolute top-1 z-10 min-w-36 rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg",
                  hx < 20 ? "translate-x-3" : hx > 80 ? "-translate-x-[calc(100%+0.75rem)]" : "-translate-x-1/2"
                )}
                style={{ left: `${hx}%` }}
              >
                <p className="mb-1.5 font-semibold">{hp.detail ?? hp.label}</p>
                <ul className="space-y-1">
                  {series.map((s) => (
                    <li key={s.id} className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background: s.color }} />
                      <span className="flex-1 text-muted-foreground">{s.label}</span>
                      <span className="font-semibold tabular-nums">{hp.values[s.id] === undefined ? "No data" : formatValue(hp.values[s.id]!)}</span>
                    </li>
                  ))}
                  {multi ? (
                    <li className="flex items-center gap-2 border-t border-border pt-1">
                      <span className="flex-1 text-muted-foreground">Total</span>
                      <span className="font-semibold tabular-nums">{formatValue(totals[hover!]!)}</span>
                    </li>
                  ) : null}
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="relative ml-11 h-4 mr-3">
        {tickIndexes(n).map((i) => (
          <span
            key={i}
            className={cn(
              "absolute text-[11px] whitespace-nowrap text-muted-foreground",
              i === 0 && n > 1 ? "" : i === n - 1 && n > 1 ? "-translate-x-full" : "-translate-x-1/2"
            )}
            style={{ left: `${x(i)}%` }}
          >
            {points[i]!.label}
          </span>
        ))}
      </div>
    </div>
  )
}
