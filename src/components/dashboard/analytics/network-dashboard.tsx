"use client"

import type { CSSProperties } from "react"
import { AlertTriangle, CircleDollarSign, Plug } from "lucide-react"
import { BreakdownPanel, HeatmapPanel, InsightsPanel, StatTiles, TopPostsPanel } from "@/components/dashboard/analytics/widgets"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { Panel } from "@/components/dashboard/ui"
import { NetworkTile } from "@/components/network"
import { TimeSeriesChart } from "@/components/time-series"
import { ButtonLink } from "@/components/ui/button"
import { networkThemes } from "@/config/network-themes"
import { networks } from "@/config/networks"
import { routes } from "@/config/site"
import { DEMOGRAPHIC_IDS } from "@/lib/analytics-constants"
import type { AnalyticsRange, Monetization, NetworkAnalytics } from "@/lib/api/types"
import { formatCompact, formatCurrency, formatCurrencyAxis } from "@/lib/format"
import { cn } from "@/lib/utils"

const placeholder = "animate-pulse rounded-2xl bg-muted"

/** Desktop column count by item count (full class names so Tailwind can see them). */
const rowCols: Record<number, string> = { 1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3" }

function NetworkHero({
  network,
  data,
  rangeLabel,
}: {
  network: NetworkAnalytics["network"]
  data: NetworkAnalytics | undefined
  rangeLabel: string
}) {
  const { name, accountLabel } = networks[network]
  const theme = networkThemes[network]
  const ink = "color-mix(in srgb, var(--net) 78%, var(--foreground))"
  const live = data && data.status !== "disconnected" ? data : undefined

  return (
    <section
      className="flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      style={{
        background: "color-mix(in srgb, var(--net) 8%, var(--card))",
        borderColor: "color-mix(in srgb, var(--net) 22%, var(--border))",
      }}
    >
      <div className="flex min-w-0 items-center gap-4">
        <NetworkTile network={network} size="lg" />
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{name}</h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="truncate">{live?.handle ?? accountLabel}</span>
            {live ? (
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{ background: "color-mix(in srgb, var(--net) 16%, transparent)", color: ink }}
              >
                {live.status === "expiring" ? "Reconnect soon" : "Connected"}
              </span>
            ) : null}
          </p>
        </div>
      </div>
      {live ? (
        <div className="sm:text-right">
          <p className="text-3xl font-semibold tracking-tight" style={{ color: ink }}>
            {formatCompact(live.followers)}
          </p>
          <p className="text-xs text-muted-foreground">followers · {rangeLabel}</p>
        </div>
      ) : (
        <p className="max-w-xs text-sm text-muted-foreground sm:text-right">{theme.tagline}</p>
      )}
    </section>
  )
}

function NotConnected({ data }: { data: NetworkAnalytics }) {
  const { name } = networks[data.network]
  return (
    <Panel>
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-6 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-muted text-[var(--net)]">
          <Plug className="size-5" />
        </span>
        <h3 className="text-lg font-semibold">Connect {name} to see its analytics</h3>
        <p className="text-sm text-muted-foreground">
          You&apos;ll get these {name} metrics here, and they&apos;ll count towards your combined totals.
        </p>
        <ul className="my-1 flex flex-wrap justify-center gap-1.5">
          {data.trackedMetrics.map((metric) => (
            <li key={metric} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {metric}
            </li>
          ))}
        </ul>
        <ButtonLink href={routes.dashboard.accounts} style={{ background: "var(--net)" }} className="text-white hover:opacity-90">
          Connect {name}
        </ButtonLink>
      </div>
    </Panel>
  )
}

/** Earnings a network reports (YouTube): the figures when monetized, otherwise what's missing. */
function EarningsSection({
  network,
  monetization,
  perDay,
  accent,
}: {
  network: NetworkAnalytics["network"]
  monetization: Monetization
  perDay: boolean
  accent: string
}) {
  const { name } = networks[network]
  return (
    <section aria-labelledby="earnings-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <h2 id="earnings-heading" className="text-xl font-semibold tracking-tight">
          Earnings
        </h2>
        {monetization.status === "monetized" ? (
          <p className="text-xs text-muted-foreground">
            Estimates from {name}, in USD. Recent days can lag and may change as revenue is finalized.
          </p>
        ) : null}
      </div>

      {monetization.status === "monetized" ? (
        <>
          <KpiCards kpis={monetization.kpis} accent={accent} />
          <div className="grid gap-4 xl:grid-cols-3">
            <Panel
              title={`${monetization.timelineTitle} ${perDay ? "per day" : "per week"}`}
              action={
                <span className="text-xs text-muted-foreground">{formatCurrency(monetization.kpis[0]?.value ?? 0)} total</span>
              }
              className="xl:col-span-2"
            >
              <TimeSeriesChart
                points={monetization.timeline.map((d) => ({ label: d.label, detail: d.detail, values: { v: d.value } }))}
                series={[{ id: "v", label: monetization.timelineTitle, color: accent }]}
                formatValue={formatCurrency}
                formatAxis={formatCurrencyAxis}
                className="h-60 sm:h-72"
              />
            </Panel>
            {monetization.breakdowns[0] ? <BreakdownPanel breakdown={monetization.breakdowns[0]} accent={accent} /> : null}
          </div>
        </>
      ) : (
        <Panel>
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 py-4 text-center">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-muted text-[var(--net)]">
              <CircleDollarSign className="size-5" />
            </span>
            <h3 className="text-lg font-semibold">Earnings aren&apos;t available for this channel yet</h3>
            <p className="text-sm text-muted-foreground">{monetization.reason}</p>
          </div>
        </Panel>
      )}
    </section>
  )
}

export function NetworkDashboard({
  network,
  data,
  range,
  rangeLabel,
}: {
  network: NetworkAnalytics["network"]
  data: NetworkAnalytics | undefined
  range: AnalyticsRange
  rangeLabel: string
}) {
  const theme = networkThemes[network]
  const { name } = networks[network]
  const themeVars = { "--net": theme.accent } as CSSProperties
  const perDay = range <= 31
  const total = data?.timeline.reduce((sum, d) => sum + d.value, 0) ?? 0
  const contentBreakdowns = data?.breakdowns.filter((b) => !DEMOGRAPHIC_IDS.has(b.id)) ?? []
  const demographicBreakdowns = data?.breakdowns.filter((b) => DEMOGRAPHIC_IDS.has(b.id)) ?? []
  const leadBreakdown = contentBreakdowns[0]
  const otherContent = contentBreakdowns.slice(1)

  return (
    <div style={themeVars} className="space-y-4">
      <NetworkHero network={network} data={data} rangeLabel={rangeLabel} />

      {data?.status === "disconnected" ? (
        <NotConnected data={data} />
      ) : (
        <>
          {data?.status === "expiring" ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm">
              <p className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-200">
                <AlertTriangle className="size-4 shrink-0" />
                Your {name} connection expires soon.
              </p>
              <ButtonLink href={routes.dashboard.accounts} variant="outline" size="sm">
                Reconnect
              </ButtonLink>
            </div>
          ) : null}

          <KpiCards kpis={data?.kpis} accent={theme.accent} />

          <div className="grid gap-4 xl:grid-cols-3">
            <Panel
              title={`${data?.timelineTitle ?? "Performance"} ${perDay ? "per day" : "per week"}`}
              action={data ? <span className="text-xs text-muted-foreground">{formatCompact(total)} total</span> : null}
              className="xl:col-span-2"
            >
              {data ? (
                <TimeSeriesChart
                  points={data.timeline.map((d) => ({ label: d.label, detail: d.detail, values: { v: d.value } }))}
                  series={[{ id: "v", label: data.timelineTitle, color: theme.accent }]}
                  className="h-60 sm:h-72"
                />
              ) : (
                <div className={`${placeholder} h-60 sm:h-72`} />
              )}
            </Panel>

            {leadBreakdown ? (
              <BreakdownPanel breakdown={leadBreakdown} accent={theme.accent} />
            ) : (
              <Panel>
                <div className={`${placeholder} h-60 sm:h-72`} />
              </Panel>
            )}
          </div>

          {data ? <StatTiles stats={data.highlights} accent={theme.accent} /> : <div className={`${placeholder} h-20`} />}

          {data?.monetization ? (
            <EarningsSection network={network} monetization={data.monetization} perDay={perDay} accent={theme.accent} />
          ) : null}

          {/* Networks have one to three extra breakdowns; size the row to what's there so it never leaves an empty column. */}
          <div className={cn("grid gap-4 md:grid-cols-2 md:max-xl:[&>:last-child:nth-child(odd)]:col-span-2", rowCols[data ? Math.min(otherContent.length + 1, 3) : 3])}>
            {data ? (
              otherContent.map((b) => <BreakdownPanel key={b.id} breakdown={b} accent={theme.accent} />)
            ) : (
              <>
                <Panel><div className={`${placeholder} h-40`} /></Panel>
                <Panel><div className={`${placeholder} h-40`} /></Panel>
              </>
            )}
            <HeatmapPanel heatmap={data?.heatmap} accent={theme.accent} />
          </div>

          {data && demographicBreakdowns.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {demographicBreakdowns.map((b) => (
                <BreakdownPanel key={b.id} breakdown={b} accent={theme.accent} />
              ))}
            </div>
          ) : !data ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Panel><div className={`${placeholder} h-40`} /></Panel>
              <Panel><div className={`${placeholder} h-40`} /></Panel>
              <Panel><div className={`${placeholder} h-40`} /></Panel>
              <Panel><div className={`${placeholder} h-40`} /></Panel>
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-3">
            <InsightsPanel insights={data?.insights} title="Insights" accent={theme.accent} />
            <TopPostsPanel posts={data?.topPosts} title={`Top ${name} posts`} className="xl:col-span-2" />
          </div>
        </>
      )}
    </div>
  )
}
