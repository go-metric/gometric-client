"use client"

import Link from "next/link"
import { CalendarPlus, Inbox, Link2 } from "lucide-react"
import { ProgressBar } from "@/components/charts"
import { buildTrend } from "@/components/dashboard/analytics/report-widgets"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { TimeSeriesChart } from "@/components/time-series"
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  PageHeader,
  Panel,
  PanelLink,
  PostStatusBadge,
} from "@/components/dashboard/ui"
import { Accent } from "@/components/marketing/primitives"
import { NetworkBadge, NetworkTile, PersonAvatar } from "@/components/network"
import { ButtonLink } from "@/components/ui/button"
import { networkThemes } from "@/config/network-themes"
import { networks } from "@/config/networks"
import { routes } from "@/config/site"
import { useNow } from "@/hooks/use-now"
import { formatAgo, formatCompact, formatTime } from "@/lib/format"
import { postExcerpt, postTitle } from "@/lib/posts"
import { useAnalyticsReport } from "@/lib/queries/analytics"
import { useConversationPreview } from "@/lib/queries/inbox"
import { usePosts } from "@/lib/queries/posts"
import { useWorkspace } from "@/lib/queries/workspace"
import { format } from "date-fns"

function greeting(now: Date | null) {
  if (!now) return "Hello"
  const hour = now.getHours()
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
}

export function Overview() {
  const now = useNow()
  const { data: workspace } = useWorkspace()
  const analytics = useAnalyticsReport({ range: 30 })
  const firstName = workspace?.profile.name.split(" ")[0]

  return (
    <>
      <PageHeader
        title={
          <>
            {greeting(now)}
            {firstName ? (
              <>
                , <Accent>{firstName}</Accent>
              </>
            ) : null}
          </>
        }
        description="Here's how your brand is doing over the last 30 days."
      />

      <KpiCards kpis={analytics.data?.kpis.slice(0, 4)} />

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <UpcomingPosts />
        <RecentMessages />

        <Panel
          title="Views per day"
          action={<PanelLink href={routes.dashboard.analytics}>Analytics</PanelLink>}
          className="xl:col-span-2"
        >
          {analytics.data ? (
            (() => {
              const trend = buildTrend(analytics.data.accounts, "views")
              return trend.points.length === 0 ? (
                <EmptyState
                  icon={<Link2 />}
                  title="No view data yet"
                  description="Daily views appear once a connected network reports them. Not every network does."
                />
              ) : (
                <TimeSeriesChart points={trend.points} series={trend.series} className="h-52 sm:h-60" />
              )
            })()
          ) : analytics.error ? (
            <ErrorState error={analytics.error} onRetry={() => analytics.refetch()} />
          ) : (
            <div className="h-52 animate-pulse rounded-2xl bg-muted sm:h-60" />
          )}
        </Panel>

        <Panel title="Audience by network">
          {!analytics.data ? (
            <ListSkeleton rows={4} />
          ) : analytics.data.accounts.length === 0 ? (
            <EmptyState
              icon={<Link2 />}
              title="No networks linked"
              action={
                <ButtonLink size="sm" variant="ink" href={routes.dashboard.accounts}>
                  Connect accounts
                </ButtonLink>
              }
            />
          ) : (
            (() => {
              const total = analytics.data.accounts.reduce((n, a) => n + (a.followers.value ?? 0), 0) || 1
              return (
                <ul className="space-y-4">
                  {analytics.data.accounts.map((a) => (
                    <li key={a.accountId}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <NetworkBadge network={a.network} className="ring-0" />
                          {networks[a.network].name}
                        </span>
                        <span className="text-muted-foreground">{a.followers.value === null ? "n/a" : formatCompact(a.followers.value)}</span>
                      </div>
                      <ProgressBar value={((a.followers.value ?? 0) / total) * 100} color={networkThemes[a.network].accent} />
                    </li>
                  ))}
                </ul>
              )
            })()
          )}
        </Panel>
      </div>
    </>
  )
}

function UpcomingPosts() {
  const now = useNow()
  const { data: posts, error, refetch } = usePosts({ status: "scheduled" })
  const upcoming = now ? (posts ?? []).filter((p) => p.scheduledAt && new Date(p.scheduledAt) > now).slice(0, 5) : []

  return (
    <Panel
      title="Upcoming posts"
      action={<PanelLink href={routes.dashboard.planner}>Open planner</PanelLink>}
      className="xl:col-span-2"
    >
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !posts || !now ? (
        <ListSkeleton rows={4} />
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarPlus />}
          title="Nothing scheduled"
          description="Plan your next post to keep the week busy."
          action={
            <ButtonLink size="sm" variant="ink" href={routes.dashboard.compose}>
              Create post
            </ButtonLink>
          }
        />
      ) : (
        <ul className="divide-y divide-border">
          {upcoming.map((post) => {
            const at = new Date(post.scheduledAt!)
            return (
              <li key={post.id}>
                <Link
                  href={`${routes.dashboard.compose}?post=${post.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-muted/60 sm:gap-4"
                >
                  <div className="w-12 shrink-0 text-center">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase">{format(at, "EEE")}</p>
                    <p className="text-lg leading-tight font-semibold">{format(at, "d")}</p>
                  </div>
                  <div className="flex -space-x-1.5">
                    {post.networks.map((n) => (
                      <NetworkTile key={n} network={n} size="sm" className="ring-2 ring-card" />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{postTitle(post)}</p>
                    <p className="truncate text-xs text-muted-foreground">{postExcerpt(post)}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium">{formatTime(post.scheduledAt!)}</p>
                    <PostStatusBadge status={post.status} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

function RecentMessages() {
  const { data, error, refetch } = useConversationPreview({ status: "open", limit: 4 })
  const recent = data?.items ?? []

  return (
    <Panel title="Recent messages" action={<PanelLink href={routes.dashboard.inbox}>Inbox</PanelLink>}>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <ListSkeleton rows={4} />
      ) : recent.length === 0 ? (
        <EmptyState
          icon={<Inbox />}
          title="No open conversations"
          description="Comments and messages from your connected accounts appear here as they arrive."
        />
      ) : (
        <ul className="space-y-1">
          {recent.map((c) => (
            <li key={c.id}>
              <Link
                href={`${routes.dashboard.inbox}?c=${c.id}`}
                className="-mx-2 flex items-start gap-3 rounded-2xl p-2 hover:bg-muted/60"
              >
                <PersonAvatar initials={c.contact.initials} color={c.contact.color} network={c.network} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{c.contact.name}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{formatAgo(c.updatedAt)}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.lastMessage?.text}</p>
                </div>
                {c.unread ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" /> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
